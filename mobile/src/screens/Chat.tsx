import { useEffect, useRef, useState } from 'react';
import { 
  View, FlatList, Text, TextInput, Button, 
  KeyboardAvoidingView, Platform, SafeAreaView 
} from 'react-native';
import io from 'socket.io-client';
import api from '../api/client';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function Chat({ route }: any) {
  const { conversationId, other } = route.params;
  const [msgs, setMsgs] = useState<any[]>([]);
  const [text, setText] = useState('');
  const [typing, setTyping] = useState(false);
  const socketRef = useRef<any>(null);

  const me = String((globalThis as any).__userId);
  const insets = useSafeAreaInsets();

  // Fetch existing messages
  useEffect(() => { 
    (async () => {
      const { data } = await api.get(`/conversations/${conversationId}/messages`);
      setMsgs(
        data
          .map((m: any) => ({ ...m, sender: String(m.sender), recipient: String(m.recipient) }))
          .reverse() // ✅ reverse so newest at bottom
      );
    })(); 
  }, [conversationId]);

  // Setup socket
  useEffect(() => {
    const s = io(process.env.EXPO_PUBLIC_SOCKET_URL as string, { 
      auth: { token: (globalThis as any).__token } 
    });
    socketRef.current = s;

    s.emit('join:conversation', { conversationId });

    // New message
   // New message
s.on('message:new', ({ message }) => {
  if (String(message.conversation) !== conversationId) return;

  message.sender = String(message.sender);
  message.recipient = String(message.recipient);

  setMsgs(m => {
    // If a temp message with same tempId exists, replace it instead of adding new
    if (message.tempId) {
      return m.map(x => x._id === message.tempId ? message : x);
    }

    // If already exists by _id, skip
    if (m.some(x => x._id === message._id)) return m;

    return [message, ...m]; // ✅ prepend because FlatList is inverted
  });

  if (message.recipient === me) {
    socketRef.current?.emit('message:delivered', { conversationId, messageId: message._id });
  }
});


    // Status update from server
    s.on('message:updated', ({ messageId, status, deliveredAt, readAt }) => {
      setMsgs(m => m.map(x => 
        x._id === messageId ? { ...x, status, deliveredAt, readAt } : x
      ));
    });

    // Typing indicator
    s.on('typing', ({ isTyping }) => setTyping(isTyping));

    return () => s.disconnect();
  }, [conversationId, me]);

  // Typing indicator
  useEffect(() => {
    const i = setTimeout(
      () => socketRef.current?.emit('typing:stop', { conversationId }), 
      1200
    );
    if (text) socketRef.current?.emit('typing:start', { conversationId });
    return () => clearTimeout(i);
  }, [text]);

  // Send message
  const send = () => {
    if (!text.trim()) return;
    const tempId = 'tmp_' + Date.now();

    const local = { 
      _id: tempId, 
      conversation: conversationId, 
      sender: me, 
      recipient: other._id, 
      text, 
      status: 'sending', 
      sentAt: new Date().toISOString() 
    };

    setMsgs(m => [local, ...m]); // ✅ prepend for inverted list

    socketRef.current?.emit(
      'message:send',
      { conversationId, text, tempId },
      (serverMsg: any) => {
        serverMsg.sender = String(serverMsg.sender);
        serverMsg.recipient = String(serverMsg.recipient);
    
        setMsgs(m => m.map(x => x._id === tempId ? serverMsg : x));
      }
    );
    

    setText('');
  };

  // Track read messages when visible
  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    viewableItems.forEach((item: any) => {
      if (item.item.recipient === me && item.item.status !== 'read') {
        setMsgs(m => m.map(x => x._id === item.item._id ? { ...x, status: 'read' } : x));
        socketRef.current?.emit('message:read', { conversationId, messageId: item.item._id });
      }
    });
  }).current;

  // Render each message
  const render = ({ item }: any) => {
    const mine = item.sender === me;
    let tick = '✓';
    if (item.status === 'delivered') tick = '✓✓';
    if (item.status === 'read') tick = '✓✓ (read)';

    return (
      <View 
      style={{ 
        alignSelf: mine ? 'flex-end' : 'flex-start', 
        backgroundColor: mine ? '#DCF8C6' : '#fff', 
        margin: 6, padding: 8, borderRadius: 8, maxWidth: '80%' 
      }}
    >
      <Text style={{ fontSize: 18 }}>{item.text}</Text> {/* ✅ Bigger font */}
      {mine && (
        <Text style={{ fontSize: 12, opacity: 0.6, textAlign: 'right' }}>
          {tick}
        </Text>
      )}
    </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 65 : 0}
      >
        {typing ? <Text style={{ margin: 8 }}>{other.name} is typing…</Text> : null}

        <FlatList 
          data={msgs} 
          keyExtractor={(x) => String(x._id)} 
          renderItem={render} 
          contentContainerStyle={{ padding: 10 }}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
          inverted // ✅ makes newest appear at bottom
        />

        {/* ✅ Input area with safe-area padding */}
        <View 
          style={{ 
            flexDirection: 'row', 
            padding: 8, 
            backgroundColor: '#f9f9f9',
            paddingBottom: insets.bottom || 8 
          }}
        >
           <TextInput 
            value={text} 
            onChangeText={setText} 
            placeholder='Message' 
            style={{ 
              flex: 1, 
              borderWidth: 1, 
              borderRadius: 8, 
              padding: 10, 
              fontSize: 18, // ✅ Bigger input font
              marginRight: 8,
              backgroundColor: '#fff' 
            }} 
          />
          <Button title='Send' onPress={send} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}  