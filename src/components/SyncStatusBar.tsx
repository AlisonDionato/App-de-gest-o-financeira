import React from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSync } from "../contexts/SyncContext";
import { colors, spacing, typography } from "../theme";

export function SyncStatusBar() {
  const { status } = useSync();

  if (status === "online") return null;

  return (
    <View
      style={[
        styles.container,
        status === "offline"
          ? styles.offline
          : status === "syncing"
          ? styles.syncing
          : styles.synced,
      ]}
    >
      {status === "syncing" ? (
        <ActivityIndicator size="small" color={colors.textInverse} />
      ) : status === "offline" ? (
        <Feather name="wifi-off" size={14} color={colors.textInverse} />
      ) : (
        <Feather name="check-circle" size={14} color={colors.textInverse} />
      )}
      <Text style={styles.text}>
        {status === "offline"
          ? "Modo Offline — Alterações serão salvas localmente"
          : status === "syncing"
          ? "Sincronizando com o Firebase..."
          : "Dados Sincronizados com Sucesso"}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  offline: {
    backgroundColor: "#EA580C", // Laranja / Aviso
  },
  syncing: {
    backgroundColor: colors.primary, // Azul / Sincronizando
  },
  synced: {
    backgroundColor: colors.income, // Verde / Sucesso
  },
  text: {
    ...typography.bodySm,
    color: colors.textInverse,
    fontWeight: "600",
  },
});
