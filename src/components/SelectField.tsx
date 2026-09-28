import React, { useState } from "react";
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { colors, radius, spacing, typography } from "../theme";

export interface SelectOption {
  id: string;
  label: string;
  icon?: keyof typeof Feather.glyphMap;
  color?: string;
}

interface SelectFieldProps {
  label: string;
  placeholder?: string;
  value: string | null;
  options: SelectOption[];
  onChange: (id: string) => void;
  error?: string;
}

/**
 * Campo de seleção usado por categoria e conta nos formulários de
 * receita/despesa. Reaproveita o mesmo padrão visual de modal do
 * `ConfirmModal`/`MenuModal`.
 */
export function SelectField({
  label,
  placeholder = "Selecionar",
  value,
  options,
  onChange,
  error,
}: SelectFieldProps) {
  const [visible, setVisible] = useState(false);
  const selected = options.find((o) => o.id === value) ?? null;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <Pressable
        style={[styles.field, !!error && styles.fieldError]}
        onPress={() => setVisible(true)}
        accessibilityRole="button"
      >
        {selected?.color ? (
          <View style={[styles.dot, { backgroundColor: selected.color }]} />
        ) : selected?.icon ? (
          <Feather
            name={selected.icon}
            size={16}
            color={colors.textSecondary}
            style={styles.icon}
          />
        ) : null}
        <Text
          style={[styles.fieldText, !selected && styles.placeholderText]}
          numberOfLines={1}
        >
          {selected ? selected.label : placeholder}
        </Text>
        <Feather name="chevron-down" size={18} color={colors.textSecondary} />
      </Pressable>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <Modal visible={visible} transparent animationType="fade">
        <Pressable style={styles.overlay} onPress={() => setVisible(false)}>
          <Pressable
            style={styles.sheet}
            onPress={(e) => e.stopPropagation()}
          >
            <Text style={styles.sheetTitle}>{label}</Text>
            <FlatList
              data={options}
              keyExtractor={(item) => item.id}
              style={styles.list}
              renderItem={({ item }) => (
                <Pressable
                  style={({ pressed }) => [
                    styles.option,
                    pressed && styles.optionPressed,
                  ]}
                  onPress={() => {
                    onChange(item.id);
                    setVisible(false);
                  }}
                >
                  {item.color ? (
                    <View style={[styles.dot, { backgroundColor: item.color }]} />
                  ) : item.icon ? (
                    <Feather
                      name={item.icon}
                      size={16}
                      color={colors.textSecondary}
                      style={styles.icon}
                    />
                  ) : null}
                  <Text style={styles.optionText}>{item.label}</Text>
                  {item.id === value ? (
                    <Feather name="check" size={18} color={colors.primary} />
                  ) : null}
                </Pressable>
              )}
              ListEmptyComponent={
                <Text style={styles.emptyText}>Nenhuma opção cadastrada.</Text>
              }
            />
          </Pressable>
        </Pressable>
      </Modal>
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
  field: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    minHeight: 48,
  },
  fieldError: {
    borderColor: colors.danger,
  },
  fieldText: {
    ...typography.bodyLg,
    color: colors.textPrimary,
    flex: 1,
  },
  placeholderText: {
    color: colors.textDisabled,
  },
  errorText: {
    ...typography.bodySm,
    color: colors.danger,
    marginTop: spacing.xxs,
  },
  icon: {
    marginRight: 2,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: radius.full,
  },
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: "flex-end",
  },
  sheet: {
    maxHeight: "70%",
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingTop: spacing.md,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.lg,
  },
  sheetTitle: {
    ...typography.titleLg,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  list: {
    flexGrow: 0,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  optionPressed: {
    opacity: 0.6,
  },
  optionText: {
    ...typography.bodyLg,
    color: colors.textPrimary,
    flex: 1,
  },
  emptyText: {
    ...typography.bodyMd,
    color: colors.textSecondary,
    paddingVertical: spacing.md,
  },
});
