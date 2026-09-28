import React, { useEffect, useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { Button } from "./Button";
import { DateField } from "./DateField";
import { Input } from "./Input";
import { colors, radius, spacing, typography } from "../theme";
import { parseCurrencyInput, formatCurrency } from "../utils/formatters";

interface GoalModalProps {
  visible: boolean;
  onSave: (data: {
    nome: string;
    valorObjetivo: number;
    dataLimite?: string | null;
    descricao?: string;
  }) => Promise<void>;
  onClose: () => void;
}

export function GoalModal({ visible, onSave, onClose }: GoalModalProps) {
  const [nome, setNome] = useState("");
  const [valorText, setValorText] = useState("");
  const [dataLimite, setDataLimite] = useState<Date | undefined>(undefined);
  const [descricao, setDescricao] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (visible) {
      setNome("");
      setValorText("");
      setDataLimite(undefined);
      setDescricao("");
      setErrors({});
    }
  }, [visible]);

  function validate(): boolean {
    const nextErrors: Record<string, string> = {};
    if (!nome.trim()) nextErrors.nome = "Informe o nome da meta.";
    const valor = parseCurrencyInput(valorText);
    if (!valor || valor <= 0) {
      nextErrors.valorText = "Informe um valor objetivo válido.";
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSave() {
    if (!validate()) return;
    setSaving(true);
    try {
      await onSave({
        nome: nome.trim(),
        valorObjetivo: parseCurrencyInput(valorText),
        dataLimite: dataLimite ? dataLimite.toISOString() : null,
        descricao: descricao.trim() || undefined,
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
          <Text style={styles.title}>Nova Meta Financeira</Text>

          <Input
            label="Nome da Meta"
            placeholder="Ex.: Viagem, Reserva, Carro"
            value={nome}
            onChangeText={setNome}
            error={errors.nome}
          />

          <Input
            label="Valor Objetivo"
            placeholder="R$ 0,00"
            keyboardType="decimal-pad"
            value={valorText}
            onChangeText={setValorText}
            error={errors.valorText}
            helperText={
              valorText ? formatCurrency(parseCurrencyInput(valorText)) : undefined
            }
          />

          <DateField
            label="Data Limite (Opcional)"
            value={dataLimite ?? new Date()}
            onChange={setDataLimite}
          />

          <Input
            label="Descrição (Opcional)"
            placeholder="Ex.: Economia para férias em dezembro"
            value={descricao}
            onChangeText={setDescricao}
          />

          <View style={styles.actions}>
            <Button
              label="Cancelar"
              variant="secondary"
              onPress={onClose}
              loading={saving}
            />
            <Button label="Criar Meta" onPress={handleSave} loading={saving} />
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
    marginBottom: spacing.xs,
  },
  actions: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
});
