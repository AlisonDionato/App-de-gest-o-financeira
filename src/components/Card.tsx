import React from "react";
import { StyleSheet, View, type ViewProps } from "react-native";
import { colors, radius, spacing } from "../theme";

interface CardProps extends ViewProps {
  padded?: boolean;
}

/** Superfície base usada em toda a UI: dashboard, listas, formulários. */
export function Card({ padded = true, style, children, ...rest }: CardProps) {
  return (
    <View style={[styles.card, padded && styles.padded, style]} {...rest}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  padded: {
    padding: spacing.md,
  },
});
