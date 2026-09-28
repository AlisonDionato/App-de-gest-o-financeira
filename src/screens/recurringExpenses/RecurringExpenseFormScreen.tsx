import React, { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RouteProp } from "@react-navigation/native";
import {
  Badge,
  Button,
  ConfirmModal,
  DateField,
  Input,
  RecurringScopeModal,
  SelectField,
  SwitchField,
  type SelectOption,
} from "../../components";
import { colors, spacing, typography } from "../../theme";
import { useCategorias } from "../../hooks/useCategorias";
import { useContas } from "../../hooks/useContas";
import {
  createDespesaRecorrente,
  deleteDespesaRecorrente,
  editDespesaRecorrente,
  encerrarDespesaRecorrente,
  getDespesaRecorrente,
  pausarDespesaRecorrente,
  retomarDespesaRecorrente,
} from "../../services/recurringExpenses.service";
import { parseCurrencyInput, formatCurrency } from "../../utils/formatters";
import type {
  Periodicidade,
  RecorrenteStatus,
  RecurringEditScope,
} from "../../types";
import type { RootStackParamList } from "../../navigation/types";

type NavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "RecurringExpenseForm"
>;
type ScreenRoute = RouteProp<RootStackParamList, "RecurringExpenseForm">;

const periodicidadeOptions: SelectOption[] = [
  { id: "mensal", label: "Mensal" },
  { id: "semanal", label: "Semanal" },
  { id: "anual", label: "Anual" },
];

/** Formulário de criação/edição de despesa recorrente (seção 8). */
export function RecurringExpenseFormScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ScreenRoute>();
  const editingId = route.params?.id;
  const isEditing = !!editingId;

  const { categorias } = useCategorias("despesa");
  const { contas } = useContas();

  const categoriaOptions: SelectOption[] = categorias.map((c) => ({
    id: c.id,
    label: c.nome,
    icon: c.icone as SelectOption["icon"],
    color: c.cor,
  }));
  const contaOptions: SelectOption[] = contas.map((c) => ({
    id: c.id,
    label: c.nome,
    icon: "credit-card",
  }));

  const [descricao, setDescricao] = useState("");
  const [valorText, setValorText] = useState("");
  const [categoriaId, setCategoriaId] = useState<string | null>(null);
  const [contaId, setContaId] = useState<string | null>(null);
  const [dataInicio, setDataInicio] = useState(new Date());
  const [periodicidade, setPeriodicidade] = useState<Periodicidade>("mensal");
  const [diaVencimento, setDiaVencimento] = useState("5");
  const [cartaoCredito, setCartaoCredito] = useState(false);
  const [status, setStatus] = useState<RecorrenteStatus>("ativa");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [loadingRecord, setLoadingRecord] = useState(isEditing);
  const [pendingPatch, setPendingPatch] = useState<Record<string, unknown> | null>(
    null
  );
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  useEffect(() => {
    navigation.setOptions({
      title: isEditing ? "Editar despesa recorrente" : "Nova despesa recorrente",
    });
  }, [navigation, isEditing]);

  useEffect(() => {
    if (!isEditing && !contaId && contas.length > 0) {
      setContaId(contas[0].id);
    }
  }, [contas, contaId, isEditing]);

  useEffect(() => {
    if (!editingId) return;
    getDespesaRecorrente(editingId).then((regra) => {
      if (regra) {
        setDescricao(regra.descricao);
        setValorText(String(regra.valor).replace(".", ","));
        setCategoriaId(regra.categoriaId);
        setContaId(regra.contaId);
        setDataInicio(new Date(regra.dataInicio));
        setPeriodicidade(regra.periodicidade);
        setDiaVencimento(String(regra.diaVencimento));
        setCartaoCredito(regra.cartaoCredito);
        setStatus(regra.ativa);
      }
      setLoadingRecord(false);
    });
  }, [editingId]);

  function validate(): boolean {
    const nextErrors: Record<string, string> = {};
    if (!descricao.trim()) nextErrors.descricao = "Informe uma descrição.";
    const valor = parseCurrencyInput(valorText);
    if (!valor || valor <= 0) nextErrors.valor = "Informe um valor maior que zero.";
    if (!categoriaId) nextErrors.categoriaId = "Selecione uma categoria.";
    if (!contaId) nextErrors.contaId = "Selecione uma conta.";
    const dia = Number(diaVencimento);
    if (!dia || dia < 1 || dia > 31) {
      nextErrors.diaVencimento = "Informe um dia válido (1 a 31).";
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function buildPayload() {
    return {
      descricao: descricao.trim(),
      valor: parseCurrencyInput(valorText),
      categoriaId: categoriaId as string,
      contaId: contaId as string,
      dataInicio: dataInicio.toISOString(),
      periodicidade,
      diaVencimento: Number(diaVencimento),
      cartaoCredito,
    };
  }

  async function handleSave() {
    if (!validate() || !categoriaId || !contaId) return;

    if (isEditing) {
      // A seção 8 exige perguntar o escopo antes de aplicar a alteração.
      setPendingPatch(buildPayload());
      return;
    }

    setSaving(true);
    try {
      await createDespesaRecorrente(buildPayload());
      navigation.goBack();
    } finally {
      setSaving(false);
    }
  }

  async function handleConfirmScope(scope: RecurringEditScope) {
    if (!editingId || !pendingPatch) return;
    setSaving(true);
    try {
      await editDespesaRecorrente(editingId, pendingPatch, scope);
      setPendingPatch(null);
      navigation.goBack();
    } finally {
      setSaving(false);
    }
  }

  async function handlePausar() {
    if (!editingId) return;
    setSaving(true);
    try {
      await pausarDespesaRecorrente(editingId);
      setStatus("pausada");
    } finally {
      setSaving(false);
    }
  }

  async function handleRetomar() {
    if (!editingId) return;
    setSaving(true);
    try {
      await retomarDespesaRecorrente(editingId);
      setStatus("ativa");
    } finally {
      setSaving(false);
    }
  }

  async function handleEncerrar() {
    if (!editingId) return;
    setSaving(true);
    try {
      await encerrarDespesaRecorrente(editingId);
      setStatus("encerrada");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!editingId) return;
    setSaving(true);
    try {
      await deleteDespesaRecorrente(editingId);
      setConfirmingDelete(false);
      navigation.goBack();
    } finally {
      setSaving(false);
    }
  }

  if (loadingRecord) return null;

  return (
    <SafeAreaView style={styles.safeArea} edges={["bottom", "left", "right"]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {isEditing ? (
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>Status:</Text>
              <Badge
                label={
                  status === "ativa" ? "Ativa" : status === "pausada" ? "Pausada" : "Encerrada"
                }
                tone={status === "ativa" ? "success" : status === "pausada" ? "warning" : "neutral"}
              />
            </View>
          ) : null}

          <Input
            label="Descrição"
            placeholder="Ex.: Aluguel"
            value={descricao}
            onChangeText={setDescricao}
            error={errors.descricao}
          />
          <Input
            label="Valor"
            placeholder="R$ 0,00"
            keyboardType="decimal-pad"
            value={valorText}
            onChangeText={setValorText}
            error={errors.valor}
            helperText={
              valorText ? formatCurrency(parseCurrencyInput(valorText)) : undefined
            }
          />
          <SelectField
            label="Categoria"
            placeholder="Selecionar categoria"
            value={categoriaId}
            options={categoriaOptions}
            onChange={setCategoriaId}
            error={errors.categoriaId}
          />
          <SelectField
            label="Conta"
            placeholder="Selecionar conta"
            value={contaId}
            options={contaOptions}
            onChange={setContaId}
            error={errors.contaId}
          />
          <SelectField
            label="Periodicidade"
            value={periodicidade}
            options={periodicidadeOptions}
            onChange={(id) => setPeriodicidade(id as Periodicidade)}
          />
          <Input
            label={
              periodicidade === "semanal"
                ? "Dia da semana (1 = domingo ... 7 = sábado)"
                : "Dia de vencimento"
            }
            placeholder="Ex.: 5"
            keyboardType="number-pad"
            value={diaVencimento}
            onChangeText={setDiaVencimento}
            error={errors.diaVencimento}
          />
          {!isEditing ? (
            <DateField label="Data de início" value={dataInicio} onChange={setDataInicio} />
          ) : null}
          <SwitchField
            label="Despesa no cartão de crédito?"
            value={cartaoCredito}
            onChange={setCartaoCredito}
          />

          <Button label="Salvar" onPress={handleSave} loading={saving} />

          {isEditing ? (
            <View style={styles.statusActions}>
              {status === "ativa" ? (
                <Button label="Pausar" variant="secondary" onPress={handlePausar} loading={saving} />
              ) : status === "pausada" ? (
                <Button label="Retomar" variant="secondary" onPress={handleRetomar} loading={saving} />
              ) : null}
              {status !== "encerrada" ? (
                <Button
                  label="Encerrar recorrência"
                  variant="secondary"
                  onPress={handleEncerrar}
                  loading={saving}
                />
              ) : null}
              <Button
                label="Excluir despesa recorrente"
                variant="danger"
                onPress={() => setConfirmingDelete(true)}
                loading={saving}
              />
            </View>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>

      <RecurringScopeModal
        visible={!!pendingPatch}
        onSelect={handleConfirmScope}
        onCancel={() => setPendingPatch(null)}
      />

      <ConfirmModal
        visible={confirmingDelete}
        title="Excluir despesa recorrente"
        message="A regra será removida e deixará de gerar novos lançamentos. As despesas já geradas por ela continuam no seu histórico."
        destructive
        loading={saving}
        onConfirm={handleDelete}
        onCancel={() => setConfirmingDelete(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
    gap: spacing.xs,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  statusLabel: {
    ...typography.bodyMd,
    color: colors.textSecondary,
  },
  statusActions: {
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
});
