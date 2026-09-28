import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { colors, radius, spacing, typography } from "../theme";
import type { DateFieldProps } from "./DateField.types";

/**
 * Versão web do DateField. `@react-native-community/datetimepicker` é um
 * módulo nativo (iOS/Android) sem suporte confiável em navegador, então
 * aqui usamos o `<input type="date">` do próprio navegador — leve, acessível
 * e sem dependência extra. O Metro escolhe este arquivo automaticamente
 * quando o app roda com `expo start --web` (resolução de módulo por
 * plataforma, sufixo `.web.tsx`).
 */
export function DateField({ label, value, onChange, error }: DateFieldProps) {
  function toInputValue(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function handleInputChange(e: { target: { value: string } }) {
    if (!e.target.value) return;
    const [year, month, day] = e.target.value.split("-").map(Number);
    onChange(new Date(year, month - 1, day));
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.field, !!error && styles.fieldError]}>
        <Feather name="calendar" size={16} color={colors.textSecondary} />
        {React.createElement("input", {
          type: "date",
          value: toInputValue(value),
          onChange: handleInputChange,
          style: webInputStyle,
        } as Record<string, unknown>)}
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const webInputStyle: React.CSSProperties = {
  border: "none",
  outline: "none",
  background: "transparent",
  fontSize: 16,
  color: colors.textPrimary,
  flex: 1,
  fontFamily: "inherit",
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.sm,
  },
  label: {
    ...typography.label,
    color: colors.textSecondary,
    marginBottom: spacing.xxs,
  },
  field: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    minHeight: 48,
  },
  fieldError: {
    borderColor: colors.danger,
  },
  errorText: {
    ...typography.bodySm,
    color: colors.danger,
    marginTop: spacing.xxs,
  },
});
