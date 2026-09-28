import React from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { colors, radius, spacing, typography } from "../theme";
import type { RecurringEditScope } from "../types";

interface ScopeOption {
  scope: RecurringEditScope;
  label: string;
  description: string;
  icon: keyof typeof Feather.glyphMap;
}

const options: ScopeOption[] = [
  {
    scope: "atual",
    label: "Apenas esta ocorrência",
    description: "Só o lançamento deste período muda; as próximas continuam como estavam.",
    icon: "calendar",
  },
  {
    scope: "futuras",
    label: "Próximas ocorrências",
    description: "A partir de agora, novos lançamentos usam os novos valores.",
    icon: "chevrons-right",
  },
  {
    scope: "todas",
    label: "Todas as ocorrências",
    description: "Atualiza também os lançamentos já gerados anteriormente.",
    icon: "repeat",
  },
];

interface RecurringScopeModalProps {
  visible: boolean;
  onSelect: (scope: RecurringEditScope) => void;
  onCancel: () => void;
}

/** Pergunta explicitamente o escopo da alteração, como exige a seção 8 do briefing. */
export function RecurringScopeModal({
  visible,
  onSelect,
  onCancel,
}: RecurringScopeModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <Pressable style={styles.overlay} onPress={onCancel}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <Text style={styles.title}>Aplicar alteração a:</Text>
          {options.map((option) => (
            <Pressable
              key={option.scope}
              style={({ pressed }) => [styles.option, pressed && styles.optionPressed]}
              onPress={() => onSelect(option.scope)}
            >
              <Feather name={option.icon} size={18} color={colors.primary} />
              <View style={styles.optionText}>
                <Text style={styles.optionLabel}>{option.label}</Text>
                <Text style={styles.optionDescription}>{option.description}</Text>
              </View>
            </Pressable>
          ))}
          <Pressable style={styles.cancel} onPress={onCancel}>
            <Text style={styles.cancelText}>Cancelar</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingTop: spacing.md,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
  },
  title: {
    ...typography.titleLg,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  option: {
    flexDirection: "row",
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  optionPressed: {
    opacity: 0.6,
  },
  optionText: {
    flex: 1,
  },
  optionLabel: {
    ...typography.bodyLg,
    color: colors.textPrimary,
  },
  optionDescription: {
    ...typography.bodySm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  cancel: {
    alignItems: "center",
    paddingVertical: spacing.sm,
    marginTop: spacing.xs,
  },
  cancelText: {
    ...typography.titleMd,
    color: colors.textSecondary,
  },
});
