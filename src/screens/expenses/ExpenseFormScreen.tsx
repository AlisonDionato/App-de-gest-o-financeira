import React, { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RouteProp } from "@react-navigation/native";
import {
  Button,
  DateField,
  Input,
  SelectField,
  SwitchField,
  type SelectOption,
} from "../../components";
import { colors, spacing } from "../../theme";
import { useCategorias } from "../../hooks/useCategorias";
import { useContas } from "../../hooks/useContas";
import {
  createDespesa,
  deleteDespesa,
  getDespesa,
  updateDespesa,
} from "../../services/expenses.service";
import { parseCurrencyInput, formatCurrency } from "../../utils/formatters";
import type { RootStackParamList } from "../../navigation/types";

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "ExpenseForm">;
type ScreenRoute = RouteProp<RootStackParamList, "ExpenseForm">;

/** Formulário de criação/edição de despesa (seções 6 e 7 — com indicador de cartão de crédito). */
export function ExpenseFormScreen() {
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
  const [data, setData] = useState(new Date());
  const [cartaoCredito, setCartaoCredito] = useState(false);
  const [observacao, setObservacao] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [loadingRecord, setLoadingRecord] = useState(isEditing);

  useEffect(() => {
    navigation.setOptions({ title: isEditing ? "Editar despesa" : "Nova despesa" });
  }, [navigation, isEditing]);

  // Pré-seleciona a única conta disponível (ex.: "Carteira" padrão), se houver.
  useEffect(() => {
    if (!isEditing && !contaId && contas.length > 0) {
      setContaId(contas[0].id);
    }
  }, [contas, contaId, isEditing]);

  useEffect(() => {
    if (!editingId) return;
    getDespesa(editingId).then((despesa) => {
      if (despesa) {
        setDescricao(despesa.descricao);
        setValorText(String(despesa.valor).replace(".", ","));
        setCategoriaId(despesa.categoriaId);
        setContaId(despesa.contaId);
        setData(new Date(despesa.data));
        setCartaoCredito(despesa.cartaoCredito);
        setObservacao(despesa.observacao ?? "");
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
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSave() {
    if (!validate() || !categoriaId || !contaId) return;
    setSaving(true);
    try {
      const payload = {
        descricao: descricao.trim(),
        valor: parseCurrencyInput(valorText),
        categoriaId,
        contaId,
        data: data.toISOString(),
        cartaoCredito,
        observacao: observacao.trim() || undefined,
      };
      if (isEditing && editingId) {
        await updateDespesa(editingId, payload);
      } else {
        await createDespesa(payload);
      }
      navigation.goBack();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!editingId) return;
    setSaving(true);
    try {
      await deleteDespesa(editingId);
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
          <Input
            label="Descrição"
            placeholder="Ex.: Mercado"
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
          <DateField label="Data" value={data} onChange={setData} />
          <SwitchField
            label="Despesa no cartão de crédito?"
            value={cartaoCredito}
            onChange={setCartaoCredito}
            helperText="Usado para segmentar relatórios de gastos no cartão."
          />
          <Input
            label="Observação (opcional)"
            placeholder="Alguma anotação sobre esta despesa"
            value={observacao}
            onChangeText={setObservacao}
            multiline
          />

          <Button label="Salvar" onPress={handleSave} loading={saving} />

          {isEditing ? (
            <Button
              label="Excluir despesa"
              variant="danger"
              onPress={handleDelete}
              loading={saving}
            />
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
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
});
