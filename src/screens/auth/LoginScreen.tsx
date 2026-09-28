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

type NavigationProp = NativeStackNavigationProp<AuthStackParamList, "Login">;

export function LoginScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { login } = useAuth();

  const [email, setEmail] = useState("dutzzrx@gmail.com");
  const [password, setPassword] = useState("dutzrx1@.");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email.trim() || !password) {
      setError("Preencha todos os campos.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
    } catch (err: any) {
      if (
        err?.code === "auth/invalid-credential" ||
        err?.code === "auth/user-not-found" ||
        err?.code === "auth/wrong-password"
      ) {
        setError("E-mail ou senha incorretos.");
      } else if (err?.code === "auth/invalid-email") {
        setError("E-mail inválido.");
      } else {
        setError("Falha ao realizar login. Tente novamente.");
      }
    } finally {
      setLoading(false);
    }
  }

  function handleFillTestCredentials() {
    setEmail("dutzzrx@gmail.com");
    setPassword("dutzrx1@.");
    setError(null);
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
            <View style={styles.logoBadge}>
              <Feather name="pie-chart" size={32} color={colors.primary} />
            </View>
            <Text style={styles.title}>Gestão Financeira</Text>
            <Text style={styles.subtitle}>
              Assuma o controle do seu dinheiro de forma simples e intuitiva.
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

            <View style={styles.passwordWrapper}>
              <Input
                label="Senha"
                placeholder="Sua senha"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />
              <Pressable
                style={styles.eyeButton}
                onPress={() => setShowPassword(!showPassword)}
                hitSlop={8}
              >
                <Feather
                  name={showPassword ? "eye-off" : "eye"}
                  size={20}
                  color={colors.textSecondary}
                />
              </Pressable>
            </View>

            <View style={styles.actionsRow}>
              <Pressable
                style={styles.testBadge}
                onPress={handleFillTestCredentials}
              >
                <Feather name="key" size={14} color={colors.primary} />
                <Text style={styles.testBadgeText}>Credenciais de teste</Text>
              </Pressable>

              <Pressable
                style={styles.forgotButton}
                onPress={() => navigation.navigate("ForgotPassword")}
              >
                <Text style={styles.forgotText}>Esqueceu a senha?</Text>
              </Pressable>
            </View>

            <Button label="Entrar" onPress={handleLogin} loading={loading} />
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Não tem uma conta?</Text>
            <Pressable onPress={() => navigation.navigate("Register")}>
              <Text style={styles.registerLink}>Cadastre-se</Text>
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
  logoBadge: {
    width: 64,
    height: 64,
    borderRadius: radius.lg,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
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
  passwordWrapper: {
    position: "relative",
  },
  eyeButton: {
    position: "absolute",
    right: spacing.md,
    top: 36,
  },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: spacing.xs,
  },
  testBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: radius.sm,
    backgroundColor: colors.primaryLight,
  },
  testBadgeText: {
    ...typography.bodySm,
    color: colors.primary,
    fontWeight: "600",
  },
  forgotButton: {
    alignSelf: "flex-end",
  },
  forgotText: {
    ...typography.bodyMd,
    color: colors.primary,
    fontWeight: "600",
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
  registerLink: {
    ...typography.titleMd,
    color: colors.primary,
  },
});
