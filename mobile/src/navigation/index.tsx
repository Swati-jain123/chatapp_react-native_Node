
import { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Login from '../screens/Login';
import Register from '../screens/Register';
import Home from '../screens/Home';
import Chat from '../screens/Chat';

const Stack = createNativeStackNavigator();

export default function RootNav() {
  const [token, setToken] = useState<string | null>(null);

  return (
    <NavigationContainer>
      {!token ? (
        <Stack.Navigator initialRouteName="Login">
          <Stack.Screen name="Login">
            {(props) => <Login {...props} setToken={setToken} />}
          </Stack.Screen>
          <Stack.Screen name="Register" component={Register} />
        </Stack.Navigator>
      ) : (
        <Stack.Navigator initialRouteName="Home">
          <Stack.Screen name="Home">
            {(props) => <Home {...props} setToken={setToken} />}
          </Stack.Screen>
          <Stack.Screen name="Chat" component={Chat} />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
}
