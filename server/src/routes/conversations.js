import { Router } from 'express';
import { authRest } from '../middleware/auth.js';
import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
const r = Router();

r.post('/', authRest, async (req, res) => {
  const me = req.user.id; const { otherUserId } = req.body;
  if (!otherUserId) return res.status(400).json({ message: 'otherUserId required' });
  let conv = await Conversation.findOne({ participants: { $all: [me, otherUserId] } });
  if (!conv) conv = await Conversation.create({ participants: [me, otherUserId] });
  res.json(conv);
});

r.get('/:id/messages', authRest, async (req, res) => {
  const { id } = req.params; const { limit = 30, before } = req.query;
  const q = { conversation: id };
  if (before) q.createdAt = { $lt: new Date(before) };
  const msgs = await Message.find(q).sort({ createdAt: -1 }).limit(Number(limit));
  res.json(msgs.reverse());
});

export default r;
