import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';

export const online = new Map(); // userId -> Set(socketId)

export default function registerSocketHandlers(io) {
  io.on('connection', (socket) => {
    const userId = socket.user.id.toString(); // ensure string

    // Track online users
    if (!online.has(userId)) online.set(userId, new Set());
    online.get(userId).add(socket.id);

    socket.join(`user:${userId}`);
    io.emit('presence', { userId, isOnline: true, lastSeen: null });

    // --- Conversation join ---
    socket.on('join:conversation', ({ conversationId }) => {
      socket.join(`conv:${conversationId}`);
      console.log(`User ${userId} joined conversation ${conversationId}`);
    });

    // --- Typing events ---
    socket.on('typing:start', ({ conversationId }) => {
      socket.to(`conv:${conversationId}`).emit('typing', { conversationId, userId, isTyping: true });
    });
    socket.on('typing:stop', ({ conversationId }) => {
      socket.to(`conv:${conversationId}`).emit('typing', { conversationId, userId, isTyping: false });
    });

    // --- Send message ---
    socket.on('message:send', async ({ conversationId, text, tempId }) => {
      if (!text || !conversationId) return;

      const conv = await Conversation.findById(conversationId);
      if (!conv) return;

      const recipient = conv.participants.find(p => p.toString() !== userId);

      const msg = await Message.create({
        conversation: conv._id,
        sender: userId,
        recipient,
        text,
        status: 'sent',
        sentAt: new Date()
      });

      // update conversation lastMessage
      await Conversation.findByIdAndUpdate(conversationId, {
        lastMessage: { text, sender: userId, createdAt: new Date() }
      });

      const payload = { ...msg.toObject(), tempId };

      // broadcast to all in conversation (sender + recipient)
      io.to(`conv:${conversationId}`).emit('message:new', { message: payload });
    });

    // --- Mark delivered ---
    socket.on('message:delivered', async ({ conversationId, messageId }) => {
      const m = await Message.findById(messageId);
      if (!m) return;

      if (m.status === 'sent') {
        m.status = 'delivered';
        m.deliveredAt = new Date();
        await m.save();

        io.to(`conv:${conversationId}`).emit('message:updated', {
          messageId,
          status: 'delivered',
          deliveredAt: m.deliveredAt
        });
      }
    });

    // --- Mark read ---
    socket.on('message:read', async ({ conversationId, messageId }) => {
      const m = await Message.findById(messageId);
      if (!m) return;

      if (m.status !== 'read') {
        m.status = 'read';
        m.readAt = new Date();
        await m.save();

        io.to(`conv:${conversationId}`).emit('message:updated', {
          messageId,
          status: 'read',
          readAt: m.readAt
        });
      }
    });

    // --- Disconnect ---
    socket.on('disconnect', () => {
      const set = online.get(userId);
      if (set) {
        set.delete(socket.id);
        if (set.size === 0) online.delete(userId);
      }

      io.emit('presence', {
        userId,
        isOnline: online.has(userId),
        lastSeen: online.has(userId) ? null : new Date()
      });
    });
  });
}
