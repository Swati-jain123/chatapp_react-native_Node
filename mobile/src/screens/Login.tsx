import { useState } from "react";
import {
  View,
  TextInput,
  Button,
  Text,
  Platform,
  StyleSheet,
} from "react-native";
import api from "../api/client";
import { AuthStore } from "../store/auth";

export default function Login({ navigation, setToken }: any) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  const submit = async () => {
    try {
      const { data } = await api.post("/auth/login", { email, password });
      AuthStore.set(data.user, data.token);
      setToken(data.token);
    } catch (e: any) {
      setErr(e?.response?.data?.message || "Login failed");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Email</Text>
      <TextInput
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        style={styles.input}
      />
      <Text style={styles.label}>Password</Text>
      <TextInput
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />
      {err ? <Text style={styles.error}>{err}</Text> : null}
      <Button title="Login" onPress={submit} />
      <Text style={styles.register} onPress={() => navigation.navigate("Register")}>
        No account? Register
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  label: {
    fontSize: Platform.OS === "web" ? 20 : 16, // ✅ bigger on web
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    marginBottom: 8,
    padding: 8,
    fontSize: Platform.OS === "web" ? 18 : 14, // ✅ bigger on web
  },
  error: {
    color: "red",
    fontSize: Platform.OS === "web" ? 18 : 14,
    marginBottom: 8,
  },
  register: {
    marginTop: 12,
    fontSize: Platform.OS === "web" ? 18 : 14,
  },
});
