import React, { useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type { CompositeNavigationProp } from "@react-navigation/native";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import { Card, ConfirmModal, Fab, TransactionListItem } from "../../components";
import { colors, radius, spacing, typography } from "../../theme";
import { formatCurrency } from "../../utils/formatters";
import { useDespesas } from "../../hooks/useDespesas";
import { useCategorias } from "../../hooks/useCategorias";
import { useDespesasRecorrentes } from "../../hooks/useDespesasRecorrentes";
import { deleteDespesa } from "../../services/expenses.service";
import type { MainTabParamList, RootStackParamList } from "../../navigation/types";

type ExpensesScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, "Expenses">,
  NativeStackNavigationProp<RootStackParamList>
>;

/** Módulo de Despesas (seção 6): listagem, criação, edição e exclusão. */
export function ExpensesScreen() {
  const navigation = useNavigation<ExpensesScreenNavigationProp>();
  const { despesas, reload } = useDespesas();
  const { categorias } = useCategorias("despesa");
  const { recorrentes, reload: reloadRecorrentes } = useDespesasRecorrentes();
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      reload();
      reloadRecorrentes();
    }, [reload, reloadRecorrentes])
  );

  const categoriaById = useMemo(
    () => new Map(categorias.map((c) => [c.id, c])),
    [categorias]
  );

  const total = despesas.reduce((sum, d) => sum + d.valor, 0);
  const totalCartao = despesas
    .filter((d) => d.cartaoCredito)
    .reduce((sum, d) => sum + d.valor, 0);
  const recorrentesAtivas = recorrentes.filter((r) => r.ativa === "ativa");
  const totalRecorrentes = recorrentesAtivas.reduce((sum, r) => sum + r.valor, 0);

  async function handleConfirmDelete() {
    if (!pendingDeleteId) return;
    setDeleting(true);
    try {
      await deleteDespesa(pendingDeleteId);
      setPendingDeleteId(null);
      await reload();
    } finally {
      setDeleting(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["bottom", "left", "right"]}>
      <FlatList
        data={despesas}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.title}>Despesas</Text>
            <View style={styles.row}>
              <Card style={styles.halfCard}>
                <Text style={styles.totalLabel}>Total no período</Text>
                <Text style={styles.totalValue}>{formatCurrency(total)}</Text>
              </Card>
              <Card style={styles.halfCard}>
                <View style={styles.cardHeaderRow}>
                  <Feather name="credit-card" size={14} color={colors.creditCard} />
                  <Text style={styles.cardCreditLabel}>No cartão</Text>
                </View>
                <Text style={styles.cardCreditValue}>{formatCurrency(totalCartao)}</Text>
              </Card>
            </View>

            <Pressable
              onPress={() => navigation.navigate("RecurringExpenses")}
              style={({ pressed }) => [pressed && styles.recurringCardPressed]}
            >
              <Card style={styles.recurringCard}>
                <View style={styles.recurringCardLeft}>
                  <View style={styles.recurringIconWrapper}>
                    <Feather name="repeat" size={16} color={colors.primary} />
                  </View>
                  <View>
                    <Text style={styles.recurringTitle}>Despesas recorrentes</Text>
                    <Text style={styles.recurringSubtitle}>
                      {recorrentesAtivas.length}{" "}
                      {recorrentesAtivas.length === 1 ? "ativa" : "ativas"} •{" "}
                      {formatCurrency(totalRecorrentes)}/mês
                    </Text>
                  </View>
                </View>
                <Feather name="chevron-right" size={18} color={colors.textSecondary} />
              </Card>
            </Pressable>
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
              tipo="despesa"
              cartaoCredito={item.cartaoCredito}
              onPress={() => navigation.navigate("ExpenseForm", { id: item.id })}
            />
          );
        }}
        ListEmptyComponent={
          <Card>
            <Text style={styles.emptyText}>
              Nenhuma despesa cadastrada ainda. Toque no "+" para adicionar a
              primeira.
            </Text>
          </Card>
        }
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />

      <Fab
        accessibilityLabel="Adicionar despesa"
        onPress={() => navigation.navigate("ExpenseForm")}
      />

      <ConfirmModal
        visible={!!pendingDeleteId}
        title="Excluir despesa"
        message="Esta ação não pode ser desfeita. Deseja excluir esta despesa?"
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
  row: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  halfCard: {
    flex: 1,
    backgroundColor: colors.expenseLight,
    borderColor: colors.expenseLight,
  },
  totalLabel: {
    ...typography.bodyMd,
    color: colors.expense,
  },
  totalValue: {
    ...typography.titleLg,
    color: colors.expense,
    marginTop: 2,
  },
  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  cardCreditLabel: {
    ...typography.bodyMd,
    color: colors.creditCard,
  },
  cardCreditValue: {
    ...typography.titleLg,
    color: colors.creditCard,
    marginTop: 2,
  },
  recurringCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  recurringCardPressed: {
    opacity: 0.7,
  },
  recurringCardLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  recurringIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primaryLight,
  },
  recurringTitle: {
    ...typography.bodyLg,
    color: colors.textPrimary,
  },
  recurringSubtitle: {
    ...typography.bodySm,
    color: colors.textSecondary,
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
