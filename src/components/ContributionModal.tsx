import React, { useEffect, useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { Button } from "./Button";
import { Input } from "./Input";
import { colors, radius, spacing, typography } from "../theme";
import { parseCurrencyInput, formatCurrency } from "../utils/formatters";

interface ContributionModalProps {
  visible: boolean;
  goalTitle: string;
  onSave: (data: { valor: number; observacao?: string }) => Promise<void>;
  onClose: () => void;
}

export function ContributionModal({
  visible,
  goalTitle,
  onSave,
  onClose,
}: ContributionModalProps) {
  const [valorText, setValorText] = useState("");
  const [observacao, setObservacao] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (visible) {
      setValorText("");
      setObservacao("");
      setError(null);
    }
  }, [visible]);

  async function handleSave() {
    const valor = parseCurrencyInput(valorText);
    if (!valor || valor <= 0) {
      setError("Informe um valor maior que zero.");
      return;
    }
    setError(null);
    setSaving(true);
    try {
      await onSave({
        valor,
        observacao: observacao.trim() || undefined,
      });
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <Text style={styles.title}>Adicionar Contribuição</Text>
          <Text style={styles.subtitle}>Meta: {goalTitle}</Text>

          <Input
            label="Valor da Contribuição"
            placeholder="R$ 0,00"
            keyboardType="decimal-pad"
            value={valorText}
            onChangeText={setValorText}
            error={error ?? undefined}
            helperText={
              valorText ? formatCurrency(parseCurrencyInput(valorText)) : undefined
            }
          />

          <Input
            label="Observação (Opcional)"
            placeholder="Ex.: Aporte do salário"
            value={observacao}
            onChangeText={setObservacao}
          />

          <View style={styles.actions}>
            <Button
              label="Cancelar"
              variant="secondary"
              onPress={onClose}
              loading={saving}
            />
            <Button label="Adicionar" onPress={handleSave} loading={saving} />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: "center",
    padding: spacing.md,
  },
  sheet: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.sm,
  },
  title: {
    ...typography.titleLg,
    color: colors.textPrimary,
  },
  subtitle: {
    ...typography.bodyMd,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  actions: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
});
