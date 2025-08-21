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

export default function Register({ navigation }: any) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  const submit = async () => {
    try {
      await api.post("/auth/register", { name, email, password });
      navigation.navigate("Login");
    } catch (e: any) {
      setErr(e?.response?.data?.message || "Register failed");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Name</Text>
      <TextInput
        value={name}
        onChangeText={setName}
        style={styles.input}
      />

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

      <Button title="Create Account" onPress={submit} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  label: {
    fontSize: Platform.OS === "web" ? 20 : 16, // ✅ larger on web
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    marginBottom: 8,
    padding: 8,
    fontSize: Platform.OS === "web" ? 18 : 14, // ✅ larger on web
  },
  error: {
    color: "red",
    fontSize: Platform.OS === "web" ? 16 : 14,
    marginBottom: 8,
  },
});
