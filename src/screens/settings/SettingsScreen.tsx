import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { Button, Card, ConfirmModal } from "../../components";
import { useAuth } from "../../contexts/AuthContext";
import { colors, radius, spacing, typography } from "../../theme";

export function SettingsScreen() {
  const { user, logout } = useAuth();
  const [confirmingLogout, setConfirmingLogout] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await logout();
    } finally {
      setLoggingOut(false);
      setConfirmingLogout(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["bottom", "left", "right"]}>
      <View style={styles.content}>
        <Card style={styles.profileCard}>
          <View style={styles.avatarWrapper}>
            <Feather name="user" size={32} color={colors.primary} />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.label}>Conta autenticada</Text>
            <Text style={styles.email}>{user?.email ?? "Usuário"}</Text>
            <Text style={styles.uid}>UID: {user?.uid ?? "—"}</Text>
          </View>
        </Card>

        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Segurança e Conta</Text>
          <Text style={styles.sectionDescription}>
            Seus dados estão protegidos e vinculados exclusivamente ao seu perfil
            no Firebase Authentication.
          </Text>
          <View style={styles.buttonWrapper}>
            <Button
              label="Sair da conta (Logout)"
              variant="danger"
              onPress={() => setConfirmingLogout(true)}
            />
          </View>
        </Card>
      </View>

      <ConfirmModal
        visible={confirmingLogout}
        title="Sair da conta"
        message="Tem certeza de que deseja encerrar a sua sessão?"
        destructive
        loading={loggingOut}
        onConfirm={handleLogout}
        onCancel={() => setConfirmingLogout(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.md,
    gap: spacing.md,
  },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  avatarWrapper: {
    width: 56,
    height: 56,
    borderRadius: radius.full,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  profileInfo: {
    flex: 1,
  },
  label: {
    ...typography.bodySm,
    color: colors.textSecondary,
  },
  email: {
    ...typography.titleLg,
    color: colors.textPrimary,
    marginTop: 2,
  },
  uid: {
    ...typography.bodySm,
    color: colors.textSecondary,
    marginTop: 2,
    fontSize: 11,
  },
  sectionCard: {
    gap: spacing.xs,
  },
  sectionTitle: {
    ...typography.titleMd,
    color: colors.textPrimary,
  },
  sectionDescription: {
    ...typography.bodyMd,
    color: colors.textSecondary,
  },
  buttonWrapper: {
    marginTop: spacing.sm,
  },
});
