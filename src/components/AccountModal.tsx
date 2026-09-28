import React, { useEffect, useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { Button } from "./Button";
import { Input } from "./Input";
import { SelectField, type SelectOption } from "./SelectField";
import { colors, radius, spacing, typography } from "../theme";
import { parseCurrencyInput, formatCurrency } from "../utils/formatters";
import type { Conta, ContaTipo } from "../types";

const contaTipoOptions: SelectOption[] = [
  { id: "corrente", label: "Conta Corrente", icon: "credit-card" },
  { id: "poupanca", label: "Poupança", icon: "archive" },
  { id: "carteira", label: "Carteira (Dinheiro)", icon: "dollar-sign" },
  { id: "banco_digital", label: "Banco Digital", icon: "smartphone" },
  { id: "investimento", label: "Investimentos", icon: "trending-up" },
];

interface AccountModalProps {
  visible: boolean;
  editingAccount?: Conta | null;
  onSave: (data: { nome: string; tipo: ContaTipo; saldoInicial: number }) => Promise<void>;
  onClose: () => void;
}

export function AccountModal({
  visible,
  editingAccount,
  onSave,
  onClose,
}: AccountModalProps) {
  const isEditing = !!editingAccount;
  const [nome, setNome] = useState("");
  const [tipo, setTipo] = useState<ContaTipo>("corrente");
  const [saldoText, setSaldoText] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editingAccount) {
      setNome(editingAccount.nome);
      setTipo(editingAccount.tipo);
      setSaldoText(String(editingAccount.saldoInicial).replace(".", ","));
    } else {
      setNome("");
      setTipo("corrente");
      setSaldoText("0");
    }
    setErrors({});
  }, [editingAccount, visible]);

  function validate(): boolean {
    const nextErrors: Record<string, string> = {};
    if (!nome.trim()) nextErrors.nome = "Informe o nome da conta.";
    if (!tipo) nextErrors.tipo = "Selecione o tipo de conta.";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSave() {
    if (!validate()) return;
    setSaving(true);
    try {
      const saldoInicial = parseCurrencyInput(saldoText);
      await onSave({
        nome: nome.trim(),
        tipo,
        saldoInicial,
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
          <Text style={styles.title}>
            {isEditing ? "Editar Conta" : "Nova Conta"}
          </Text>

          <Input
            label="Nome da Conta"
            placeholder="Ex.: Nubank, Itaú, Carteira"
            value={nome}
            onChangeText={setNome}
            error={errors.nome}
          />

          <SelectField
            label="Tipo de Conta"
            value={tipo}
            options={contaTipoOptions}
            onChange={(val) => setTipo(val as ContaTipo)}
            error={errors.tipo}
          />

          {!isEditing ? (
            <Input
              label="Saldo Inicial"
              placeholder="R$ 0,00"
              keyboardType="decimal-pad"
              value={saldoText}
              onChangeText={setSaldoText}
              helperText={
                saldoText ? formatCurrency(parseCurrencyInput(saldoText)) : undefined
              }
            />
          ) : null}

          <View style={styles.actions}>
            <Button
              label="Cancelar"
              variant="secondary"
              onPress={onClose}
              loading={saving}
            />
            <Button label="Salvar" onPress={handleSave} loading={saving} />
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
