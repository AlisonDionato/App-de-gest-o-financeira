import React from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  type PressableProps,
} from "react-native";
import { colors, radius, spacing, typography } from "../theme";

export type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";

interface ButtonProps extends Omit<PressableProps, "style"> {
  label: string;
  variant?: ButtonVariant;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
}

/**
 * Botão base do design system. Demais botões do app (salvar, excluir,
 * cancelar, etc.) devem ser construídos a partir deste componente.
 */
export function Button({
  label,
  variant = "primary",
  loading = false,
  disabled = false,
  fullWidth = true,
  ...pressableProps
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        variantStyles[variant].container,
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        pressed && !isDisabled && styles.pressed,
      ]}
      {...pressableProps}
    >
      {loading ? (
        <ActivityIndicator color={variantStyles[variant].text.color as string} />
      ) : (
        <Text style={[styles.label, variantStyles[variant].text]}>{label}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
  },
  fullWidth: {
    alignSelf: "stretch",
  },
  label: {
    ...typography.titleMd,
  },
  disabled: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.85,
  },
});

const variantStyles: Record<
  ButtonVariant,
  { container: object; text: { color: string } }
> = {
  primary: {
    container: { backgroundColor: colors.primary },
    text: { color: colors.textInverse },
  },
  secondary: {
    container: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    text: { color: colors.textPrimary },
  },
  danger: {
    container: { backgroundColor: colors.danger },
    text: { color: colors.textInverse },
  },
  ghost: {
    container: { backgroundColor: "transparent" },
    text: { color: colors.primary },
  },
};
