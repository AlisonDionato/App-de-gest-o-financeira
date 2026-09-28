import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import { Button, Input } from "../../components";
import { useAuth } from "../../contexts/AuthContext";
import { colors, radius, spacing, typography } from "../../theme";
import type { AuthStackParamList } from "../../navigation/types";

type NavigationProp = NativeStackNavigationProp<AuthStackParamList, "Register">;

export function RegisterScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { register } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    if (!email.trim() || !password || !confirmPassword) {
      setError("Preencha todos os campos.");
      return;
    }
    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }
    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await register(email, password);
    } catch (err: any) {
      if (err?.code === "auth/email-already-in-use") {
        setError("Este e-mail já está cadastrado.");
      } else if (err?.code === "auth/invalid-email") {
        setError("E-mail inválido.");
      } else if (err?.code === "auth/weak-password") {
        setError("A senha deve ter no mínimo 6 caracteres.");
      } else {
        setError("Falha ao criar conta. Tente novamente.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Text style={styles.title}>Criar nova conta</Text>
            <Text style={styles.subtitle}>
              Comece a organizar suas finanças hoje mesmo.
            </Text>
          </View>

          {error ? (
            <View style={styles.errorBox}>
              <Feather name="alert-circle" size={16} color={colors.expense} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <View style={styles.form}>
            <Input
              label="E-mail"
              placeholder="seu@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
            <Input
              label="Senha"
              placeholder="No mínimo 6 caracteres"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
            <Input
              label="Confirmar senha"
              placeholder="Repita a senha"
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />

            <Button
              label="Criar conta"
              onPress={handleRegister}
              loading={loading}
            />
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Já possui uma conta?</Text>
            <Pressable onPress={() => navigation.navigate("Login")}>
              <Text style={styles.loginLink}>Fazer login</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    flexGrow: 1,
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.displayLg,
    color: colors.textPrimary,
    textAlign: "center",
  },
  subtitle: {
    ...typography.bodyLg,
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: spacing.xs,
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    backgroundColor: colors.expenseLight,
    padding: spacing.sm,
    borderRadius: radius.md,
    marginBottom: spacing.md,
  },
  errorText: {
    ...typography.bodyMd,
    color: colors.expense,
    flex: 1,
  },
  form: {
    gap: spacing.sm,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: spacing.xs,
    marginTop: spacing.xl,
  },
  footerText: {
    ...typography.bodyMd,
    color: colors.textSecondary,
  },
  loginLink: {
    ...typography.titleMd,
    color: colors.primary,
  },
});
