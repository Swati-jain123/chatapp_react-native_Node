import { useEffect, useState } from 'react';
import { View, FlatList, Text, TouchableOpacity } from 'react-native';
import io from 'socket.io-client';
import api from '../api/client';

export default function Home({ navigation }: any) {
  const [users, setUsers] = useState<any[]>([]);
  const [online, setOnline] = useState<Record<string, boolean>>({});

  useEffect(() => {
    (async () => {
      const { data } = await api.get('/users');
      setUsers(data);
    })();
  }, []);

  useEffect(() => {
    const socket = io(process.env.EXPO_PUBLIC_SOCKET_URL as string, {
      auth: { token: (globalThis as any).__token },
    });

    socket.on('presence', ({ userId, isOnline }) =>
      setOnline((o) => ({ ...o, [userId]: isOnline }))
    );

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={users}
        keyExtractor={(u) => u._id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={{ padding: 16, borderBottomWidth: 1 }}
            onPress={async () => {
              const res = await api.post('/conversations', {
                otherUserId: item._id,
              });
              navigation.navigate('Chat', {
                conversationId: res.data._id,
                other: item,
              });
            }}
          >
            {/* ✅ Increased font size */}
            <Text style={{ fontSize: 18 }}>
              {item.name} {online[item._id] ? '• online' : '• offline'}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
