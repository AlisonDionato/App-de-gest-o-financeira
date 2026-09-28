import React from "react";
import { Modal, StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing, typography } from "../theme";
import { Button } from "./Button";

interface ConfirmModalProps {
  visible: boolean;
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Modal de confirmação padrão do app. Regra de negócio #15: toda exclusão
 * definitiva deve solicitar confirmação — este componente é a base para
 * cumprir essa regra em qualquer tela (despesas, receitas, contas, metas...).
 */
export function ConfirmModal({
  visible,
  title,
  message,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  destructive = false,
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>{title}</Text>
          {message ? <Text style={styles.message}>{message}</Text> : null}

          <View style={styles.actions}>
            <View style={styles.actionButton}>
              <Button label={cancelLabel} variant="secondary" onPress={onCancel} />
            </View>
            <View style={styles.actionButton}>
              <Button
                label={confirmLabel}
                variant={destructive ? "danger" : "primary"}
                loading={loading}
                onPress={onConfirm}
              />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
  },
  card: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  title: {
    ...typography.titleLg,
    color: colors.textPrimary,
    marginBottom: spacing.xxs,
  },
  message: {
    ...typography.bodyMd,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  actions: {
    flexDirection: "row",
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  actionButton: {
    flex: 1,
  },
});
