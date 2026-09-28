import React, { useMemo, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type { CompositeNavigationProp } from "@react-navigation/native";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import { Card, ConfirmModal, Fab, TransactionListItem } from "../../components";
import { colors, spacing, typography } from "../../theme";
import { formatCurrency } from "../../utils/formatters";
import { useReceitas } from "../../hooks/useReceitas";
import { useCategorias } from "../../hooks/useCategorias";
import { deleteReceita } from "../../services/incomes.service";
import type { MainTabParamList, RootStackParamList } from "../../navigation/types";

type IncomeScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, "Income">,
  NativeStackNavigationProp<RootStackParamList>
>;

/** Módulo de Receitas (seção 5): listagem, criação, edição e exclusão. */
export function IncomeScreen() {
  const navigation = useNavigation<IncomeScreenNavigationProp>();
  const { receitas, reload } = useReceitas();
  const { categorias } = useCategorias("receita");
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      reload();
    }, [reload])
  );

  const categoriaById = useMemo(
    () => new Map(categorias.map((c) => [c.id, c])),
    [categorias]
  );

  const total = receitas.reduce((sum, r) => sum + r.valor, 0);

  async function handleConfirmDelete() {
    if (!pendingDeleteId) return;
    setDeleting(true);
    try {
      await deleteReceita(pendingDeleteId);
      setPendingDeleteId(null);
      await reload();
    } finally {
      setDeleting(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["bottom", "left", "right"]}>
      <FlatList
        data={receitas}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.title}>Receitas</Text>
            <Card style={styles.totalCard}>
              <Text style={styles.totalLabel}>Total no período</Text>
              <Text style={styles.totalValue}>{formatCurrency(total)}</Text>
            </Card>
          </View>
        }
        renderItem={({ item }) => {
          const categoria = categoriaById.get(item.categoriaId);
          return (
            <TransactionListItem
              descricao={item.descricao}
              categoriaNome={categoria?.nome ?? "Sem categoria"}
              categoriaIcon={categoria?.icone as keyof typeof Feather.glyphMap}
              categoriaCor={categoria?.cor}
              data={item.data}
              valor={item.valor}
              tipo="receita"
              onPress={() => navigation.navigate("IncomeForm", { id: item.id })}
            />
          );
        }}
        ListEmptyComponent={
          <Card>
            <Text style={styles.emptyText}>
              Nenhuma receita cadastrada ainda. Toque no "+" para adicionar a
              primeira.
            </Text>
          </Card>
        }
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />

      <Fab
        accessibilityLabel="Adicionar receita"
        onPress={() => navigation.navigate("IncomeForm")}
      />

      <ConfirmModal
        visible={!!pendingDeleteId}
        title="Excluir receita"
        message="Esta ação não pode ser desfeita. Deseja excluir esta receita?"
        destructive
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setPendingDeleteId(null)}
      />
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
    paddingBottom: spacing.xxl,
    flexGrow: 1,
  },
  header: {
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  title: {
    ...typography.displayMd,
    color: colors.textPrimary,
  },
  totalCard: {
    backgroundColor: colors.incomeLight,
    borderColor: colors.incomeLight,
  },
  totalLabel: {
    ...typography.bodyMd,
    color: colors.income,
  },
  totalValue: {
    ...typography.titleLg,
    color: colors.income,
    marginTop: 2,
  },
  emptyText: {
    ...typography.bodyMd,
    color: colors.textSecondary,
  },
  separator: {
    height: 1,
    backgroundColor: colors.divider,
  },
});
