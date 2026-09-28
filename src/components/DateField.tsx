import React, { useState } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import DateTimePicker, {
  type DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { colors, radius, spacing, typography } from "../theme";
import { formatDate } from "../utils/formatters";
import type { DateFieldProps } from "./DateField.types";

/**
 * Campo de data com seletor nativo, exibindo sempre no padrão dd/MM/yyyy
 * (seção 19). Este arquivo só é usado em iOS/Android — a resolução de
 * módulo do Metro por plataforma prioriza `DateField.web.tsx` na web
 * automaticamente, sem precisar de nenhum `Platform.OS` aqui.
 */
export function DateField({ label, value, onChange, error }: DateFieldProps) {
  const [showPicker, setShowPicker] = useState(false);

  function handleChange(event: DateTimePickerEvent, selectedDate?: Date) {
    // No Android o picker fecha sozinho após a escolha; no iOS fica embutido.
    if (Platform.OS === "android") {
      setShowPicker(false);
    }
    if (event.type === "set" && selectedDate) {
      onChange(selectedDate);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <Pressable
        style={[styles.field, !!error && styles.fieldError]}
        onPress={() => setShowPicker(true)}
        accessibilityRole="button"
      >
        <Feather name="calendar" size={16} color={colors.textSecondary} />
        <Text style={styles.fieldText}>{formatDate(value)}</Text>
      </Pressable>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      {showPicker ? (
        <DateTimePicker
          value={value}
          mode="date"
          display={Platform.OS === "ios" ? "inline" : "default"}
          onChange={handleChange}
          locale="pt-BR"
        />
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
  },
  errorText: {
    ...typography.bodySm,
    color: colors.danger,
    marginTop: spacing.xxs,
  },
});
