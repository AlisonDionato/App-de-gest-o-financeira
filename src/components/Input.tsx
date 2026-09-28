import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from "react-native";
import { colors, radius, spacing, typography } from "../theme";

interface InputProps extends TextInputProps {
  label: string;
  error?: string;
  helperText?: string;
}

/** Campo de entrada base do design system, usado em todos os formulários. */
export function Input({
  label,
  error,
  helperText,
  style,
  onFocus,
  onBlur,
  ...rest
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[
          styles.input,
          isFocused && styles.inputFocused,
          !!error && styles.inputError,
          style,
        ]}
        placeholderTextColor={colors.textDisabled}
        onFocus={(e) => {
          setIsFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setIsFocused(false);
          onBlur?.(e);
        }}
        {...rest}
      />
      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : helperText ? (
        <Text style={styles.helperText}>{helperText}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.sm,
  },
  label: {
    ...typography.label,
    color: colors.textSecondary,
    marginBottom: spacing.xxs,
  },
  input: {
    ...typography.bodyLg,
    color: colors.textPrimary,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    minHeight: 48,
  },
  inputFocused: {
    borderColor: colors.primary,
  },
  inputError: {
    borderColor: colors.danger,
  },
  errorText: {
    ...typography.bodySm,
    color: colors.danger,
    marginTop: spacing.xxs,
  },
  helperText: {
    ...typography.bodySm,
    color: colors.textSecondary,
    marginTop: spacing.xxs,
  },
});
