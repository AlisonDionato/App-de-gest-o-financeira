import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, spacing, typography } from "../theme";
import { Card } from "./Card";

interface PlaceholderScreenProps {
  title: string;
  description: string;
}

/**
 * Estrutura visual mínima para telas cujo módulo ainda será implementado
 * em etapas futuras (Etapas 4 a 9). Mantém a navegação e o layout
 * consistentes desde já, sem antecipar lógica de negócio.
 */
export function PlaceholderScreen({ title, description }: PlaceholderScreenProps) {
  return (
    <SafeAreaView style={styles.safeArea} edges={["bottom", "left", "right"]}>
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <Card>
          <Text style={styles.description}>{description}</Text>
        </Card>
      </View>
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
  title: {
    ...typography.displayMd,
    color: colors.textPrimary,
  },
  description: {
    ...typography.bodyMd,
    color: colors.textSecondary,
  },
});
