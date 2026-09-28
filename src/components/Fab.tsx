import React from "react";
import { Pressable, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { colors, radius, spacing } from "../theme";

interface FabProps {
  onPress: () => void;
  accessibilityLabel: string;
}

/** Botão flutuante de ação primária ("+"), ancorado no canto inferior direito. */
export function Fab({ onPress, accessibilityLabel }: FabProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [styles.fab, pressed && styles.pressed]}
    >
      <Feather name="plus" size={26} color={colors.textInverse} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    right: spacing.md,
    bottom: spacing.lg,
    width: 56,
    height: 56,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  pressed: {
    opacity: 0.85,
  },
});
