import React, { useCallback, useMemo, useState } from "react";
import { RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import { Card, TransactionListItem } from "../../components";
import { colors, radius, spacing, typography } from "../../theme";
import { formatCurrency } from "../../utils/formatters";
import { getBalanceSummary, type BalanceSummary } from "../../services/balance.service";
import { useReceitas } from "../../hooks/useReceitas";
import { useDespesas } from "../../hooks/useDespesas";
import { useCategorias } from "../../hooks/useCategorias";
import { useMetas } from "../../hooks/useMetas";

const EMPTY_SUMMARY: BalanceSummary = {
  salario: 0,
  outrasReceitas: 0,
  totalReceitas: 0,
  despesas: 0,
  despesasRecorrentes: 0,
  gastosCartao: 0,
  saldoDisponivel: 0,
};

/** Tela inicial (seção 14): saldo, receitas, despesas, metas e últimas movimentações. */
export function DashboardScreen() {
  const [summary, setSummary] = useState<BalanceSummary>(EMPTY_SUMMARY);
  const [refreshing, setRefreshing] = useState(false);
  const { receitas, reload: reloadReceitas } = useReceitas();
  const { despesas, reload: reloadDespesas } = useDespesas();
  const { metas, reload: reloadMetas } = useMetas();
  const { categorias: categoriasReceita } = useCategorias("receita");
  const { categorias: categoriasDespesa } = useCategorias("despesa");

  const loadAll = useCallback(async () => {
    const [balance] = await Promise.all([
      getBalanceSummary(),
      reloadReceitas(),
      reloadDespesas(),
      reloadMetas(),
    ]);
    setSummary(balance);
  }, [reloadReceitas, reloadDespesas, reloadMetas]);

  useFocusEffect(
    useCallback(() => {
      loadAll();
    }, [loadAll])
  );

  async function handleRefresh() {
    setRefreshing(true);
    await loadAll();
    setRefreshing(false);
  }

  const categoriaById = useMemo(() => {
    const map = new Map<string, { nome: string; icone: string; cor: string }>();
    [...categoriasReceita, ...categoriasDespesa].forEach((c) =>
      map.set(c.id, { nome: c.nome, icone: c.icone, cor: c.cor })
    );
    return map;
  }, [categoriasReceita, categoriasDespesa]);

  const ultimasMovimentacoes = useMemo(() => {
    const todas = [
      ...receitas.map((r) => ({ ...r, tipo: "receita" as const })),
      ...despesas.map((d) => ({ ...d, tipo: "despesa" as const })),
    ];
    return todas.sort((a, b) => (a.data < b.data ? 1 : -1)).slice(0, 5);
  }, [receitas, despesas]);

  const saldoPositivo = summary.saldoDisponivel >= 0;

  return (
    <SafeAreaView style={styles.safeArea} edges={["bottom", "left", "right"]}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <Text style={styles.title}>Saldo</Text>

        <Card
          style={[
            styles.balanceCard,
            { backgroundColor: saldoPositivo ? colors.primary : colors.danger },
          ]}
        >
          <Text style={styles.balanceLabel}>Saldo disponível</Text>
          <Text style={styles.balanceValue}>
            {formatCurrency(summary.saldoDisponivel)}
          </Text>
        </Card>

        <View style={styles.row}>
          <Card style={styles.halfCard}>
            <Text style={styles.metricLabel}>Receitas</Text>
            <Text style={[styles.metricValue, { color: colors.income }]}>
              {formatCurrency(summary.totalReceitas)}
            </Text>
            <Text style={styles.metricSubLabel}>
              Salário: {formatCurrency(summary.salario)}
            </Text>
          </Card>
          <Card style={styles.halfCard}>
            <Text style={styles.metricLabel}>Despesas</Text>
            <Text style={[styles.metricValue, { color: colors.expense }]}>
              {formatCurrency(summary.despesas)}
            </Text>
            <Text style={styles.metricSubLabel}>
              Recorrentes: {formatCurrency(summary.despesasRecorrentes)}
            </Text>
          </Card>
        </View>

        <Card>
          <View style={styles.cardHeaderRow}>
            <Feather name="credit-card" size={16} color={colors.creditCard} />
            <Text style={styles.sectionTitle}>Gastos no cartão</Text>
          </View>
          <Text style={[styles.metricValue, { color: colors.creditCard }]}>
            {formatCurrency(summary.gastosCartao)}
          </Text>
        </Card>

        {/* Seção de Metas em Andamento */}
        {metas.length > 0 ? (
          <Card>
            <View style={styles.cardHeaderRow}>
              <Feather name="target" size={16} color={colors.primary} />
              <Text style={styles.sectionTitle}>Metas em andamento</Text>
            </View>
            <View style={styles.metasList}>
              {metas.slice(0, 3).map((meta) => {
                const progress = Math.min(
                  100,
                  Math.round((meta.valorAtual / meta.valorObjetivo) * 100) || 0
                );
                return (
                  <View key={meta.id} style={styles.metaItem}>
                    <View style={styles.metaHeader}>
                      <Text style={styles.metaName}>{meta.nome}</Text>
                      <Text style={styles.metaValue}>
                        {formatCurrency(meta.valorAtual)} / {formatCurrency(meta.valorObjetivo)} ({progress}%)
                      </Text>
                    </View>
                    <View style={styles.progressBarTrack}>
                      <View
                        style={[
                          styles.progressBarFill,
                          {
                            width: `${progress}%`,
                            backgroundColor:
                              progress >= 100 ? colors.income : colors.primary,
                          },
                        ]}
                      />
                    </View>
                  </View>
                );
              })}
            </View>
          </Card>
        ) : null}

        <Card>
          <Text style={styles.sectionTitle}>Últimas movimentações</Text>
          {ultimasMovimentacoes.length === 0 ? (
            <Text style={styles.placeholderText}>
              Nenhuma movimentação cadastrada ainda.
            </Text>
          ) : (
            ultimasMovimentacoes.map((item, index) => {
              const categoria = categoriaById.get(item.categoriaId);
              return (
                <View key={`${item.tipo}-${item.id}`}>
                  <TransactionListItem
                    descricao={item.descricao}
                    categoriaNome={categoria?.nome ?? "Sem categoria"}
                    categoriaIcon={categoria?.icone as keyof typeof Feather.glyphMap}
                    categoriaCor={categoria?.cor}
                    data={item.data}
                    valor={item.valor}
                    tipo={item.tipo}
                    cartaoCredito={
                      item.tipo === "despesa" ? item.cartaoCredito : undefined
                    }
                  />
                  {index < ultimasMovimentacoes.length - 1 ? (
                    <View style={styles.separator} />
                  ) : null}
                </View>
              );
            })
          )}
        </Card>
      </ScrollView>
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
    gap: spacing.md,
  },
  title: {
    ...typography.displayMd,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  balanceCard: {
    borderWidth: 0,
  },
  balanceLabel: {
    ...typography.bodyMd,
    color: colors.textInverse,
    opacity: 0.85,
  },
  balanceValue: {
    ...typography.displayLg,
    color: colors.textInverse,
    marginTop: spacing.xxs,
  },
  row: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  halfCard: {
    flex: 1,
  },
  metricLabel: {
    ...typography.bodyMd,
    color: colors.textSecondary,
  },
  metricValue: {
    ...typography.titleLg,
    color: colors.textPrimary,
    marginTop: spacing.xxs,
  },
  metricSubLabel: {
    ...typography.bodySm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 2,
  },
  sectionTitle: {
    ...typography.titleMd,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  metasList: {
    gap: spacing.xs,
  },
  metaItem: {
    marginTop: 2,
  },
  metaHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  metaName: {
    ...typography.bodyLg,
    color: colors.textPrimary,
  },
  metaValue: {
    ...typography.bodySm,
    color: colors.textSecondary,
  },
  progressBarTrack: {
    height: 6,
    borderRadius: radius.full,
    backgroundColor: colors.divider,
    overflow: "hidden",
    marginTop: 4,
  },
  progressBarFill: {
    height: "100%",
    borderRadius: radius.full,
  },
  placeholderText: {
    ...typography.bodyMd,
    color: colors.textSecondary,
  },
  separator: {
    height: 1,
    backgroundColor: colors.divider,
  },
});
