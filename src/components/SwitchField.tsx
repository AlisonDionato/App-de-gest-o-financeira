import React from "react";
import { StyleSheet, Switch, Text, View } from "react-native";
import { colors, radius, spacing, typography } from "../theme";

interface SwitchFieldProps {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
  helperText?: string;
}

/** Campo de alternância padrão do design system (ex.: "Despesa no cartão de crédito?"). */
export function SwitchField({
  label,
  value,
  onChange,
  helperText,
}: SwitchFieldProps) {
  return (
    <View style={styles.container}>
      <View style={styles.textColumn}>
        <Text style={styles.label}>{label}</Text>
        {helperText ? <Text style={styles.helper}>{helperText}</Text> : null}
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: colors.border, true: colors.creditCardLight }}
        thumbColor={value ? colors.creditCard : "#FFFFFF"}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    marginBottom: spacing.sm,
  },
  textColumn: {
    flex: 1,
    paddingRight: spacing.sm,
  },
  label: {
    ...typography.bodyLg,
    color: colors.textPrimary,
  },
  helper: {
    ...typography.bodySm,
    color: colors.textSecondary,
    marginTop: 2,
  },
});
