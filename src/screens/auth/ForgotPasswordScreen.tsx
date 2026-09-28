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

type NavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  "ForgotPassword"
>;

export function ForgotPasswordScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { resetPassword } = useAuth();

  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleResetPassword() {
    if (!email.trim()) {
      setError("Informe seu e-mail cadastrado.");
      return;
    }
    setError(null);
    setSuccess(false);
    setLoading(true);
    try {
      await resetPassword(email);
      setSuccess(true);
    } catch (err: any) {
      if (err?.code === "auth/user-not-found") {
        setError("Nenhum usuário encontrado com este e-mail.");
      } else if (err?.code === "auth/invalid-email") {
        setError("E-mail inválido.");
      } else {
        setError("Falha ao enviar e-mail de recuperação.");
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
          <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
            <Feather name="arrow-left" size={24} color={colors.textPrimary} />
          </Pressable>

          <View style={styles.header}>
            <Text style={styles.title}>Recuperar senha</Text>
            <Text style={styles.subtitle}>
              Digite seu e-mail cadastrado para receber o link de redefinição.
            </Text>
          </View>

          {error ? (
            <View style={styles.errorBox}>
              <Feather name="alert-circle" size={16} color={colors.expense} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {success ? (
            <View style={styles.successBox}>
              <Feather name="check-circle" size={16} color={colors.income} />
              <Text style={styles.successText}>
                E-mail de redefinição enviado com sucesso! Verifique sua caixa de
                entrada.
              </Text>
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

            <Button
              label="Enviar e-mail de recuperação"
              onPress={handleResetPassword}
              loading={loading}
            />
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
  backButton: {
    position: "absolute",
    top: spacing.md,
    left: spacing.lg,
    zIndex: 10,
  },
  header: {
    alignItems: "center",
    marginBottom: spacing.xl,
    marginTop: spacing.xl,
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
  successBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    backgroundColor: colors.incomeLight,
    padding: spacing.sm,
    borderRadius: radius.md,
    marginBottom: spacing.md,
  },
  successText: {
    ...typography.bodyMd,
    color: colors.income,
    flex: 1,
  },
  form: {
    gap: spacing.md,
  },
});
