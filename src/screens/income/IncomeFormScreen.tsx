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
  type SelectOption,
} from "../../components";
import { colors, spacing, typography } from "../../theme";
import { useCategorias } from "../../hooks/useCategorias";
import {
  createReceita,
  deleteReceita,
  getReceita,
  updateReceita,
} from "../../services/incomes.service";
import { parseCurrencyInput, formatCurrency } from "../../utils/formatters";
import type { RootStackParamList } from "../../navigation/types";

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "IncomeForm">;
type ScreenRoute = RouteProp<RootStackParamList, "IncomeForm">;

/** Formulário de criação/edição de receita (seção 5). */
export function IncomeFormScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ScreenRoute>();
  const editingId = route.params?.id;
  const isEditing = !!editingId;

  const { categorias } = useCategorias("receita");
  const categoriaOptions: SelectOption[] = categorias.map((c) => ({
    id: c.id,
    label: c.nome,
    icon: c.icone as SelectOption["icon"],
    color: c.cor,
  }));

  const [descricao, setDescricao] = useState("");
  const [valorText, setValorText] = useState("");
  const [categoriaId, setCategoriaId] = useState<string | null>(null);
  const [data, setData] = useState(new Date());
  const [observacao, setObservacao] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [loadingRecord, setLoadingRecord] = useState(isEditing);

  useEffect(() => {
    navigation.setOptions({ title: isEditing ? "Editar receita" : "Nova receita" });
  }, [navigation, isEditing]);

  useEffect(() => {
    if (!editingId) return;
    getReceita(editingId).then((receita) => {
      if (receita) {
        setDescricao(receita.descricao);
        setValorText(String(receita.valor).replace(".", ","));
        setCategoriaId(receita.categoriaId);
        setData(new Date(receita.data));
        setObservacao(receita.observacao ?? "");
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
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSave() {
    if (!validate() || !categoriaId) return;
    setSaving(true);
    try {
      const payload = {
        descricao: descricao.trim(),
        valor: parseCurrencyInput(valorText),
        categoriaId,
        data: data.toISOString(),
        tipo: "extra" as const,
        observacao: observacao.trim() || undefined,
      };
      if (isEditing && editingId) {
        await updateReceita(editingId, payload);
      } else {
        await createReceita(payload);
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
      await deleteReceita(editingId);
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
            placeholder="Ex.: Freelance projeto X"
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
          <DateField label="Data" value={data} onChange={setData} />
          <Input
            label="Observação (opcional)"
            placeholder="Alguma anotação sobre esta receita"
            value={observacao}
            onChangeText={setObservacao}
            multiline
          />

          <Button label="Salvar" onPress={handleSave} loading={saving} />

          {isEditing ? (
            <Button
              label="Excluir receita"
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
