import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing, typography } from "../theme";

export type BadgeTone =
  | "neutral"
  | "income"
  | "expense"
  | "creditCard"
  | "success"
  | "warning"
  | "danger";

interface BadgeProps {
  label: string;
  tone?: BadgeTone;
}

/**
 * Indicador visual curto. Usado para marcar receita/despesa, despesa no
 * cartão de crédito, e futuramente o status de sincronização
 * (Online / Offline / Sincronizando).
 */
export function Badge({ label, tone = "neutral" }: BadgeProps) {
  const toneStyle = toneStyles[tone];
  return (
    <View style={[styles.container, { backgroundColor: toneStyle.background }]}>
      <Text style={[styles.label, { color: toneStyle.text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: "flex-start",
    borderRadius: radius.full,
    paddingHorizontal: spacing.xs,
    paddingVertical: 4,
  },
  label: {
    ...typography.bodySm,
    fontWeight: "600",
  },
});

const toneStyles: Record<BadgeTone, { background: string; text: string }> = {
  neutral: { background: colors.surfaceAlt, text: colors.textSecondary },
  income: { background: colors.incomeLight, text: colors.income },
  expense: { background: colors.expenseLight, text: colors.expense },
  creditCard: { background: colors.creditCardLight, text: colors.creditCard },
  success: { background: colors.incomeLight, text: colors.success },
  warning: { background: colors.warningLight, text: colors.warning },
  danger: { background: colors.dangerLight, text: colors.danger },
};
