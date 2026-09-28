import React, { useCallback, useState } from "react";
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import { Card } from "../../components";
import {
  getReportData,
  type PeriodFilter,
  type ReportData,
} from "../../services/reports.service";
import { colors, radius, spacing, typography } from "../../theme";
import { formatCurrency } from "../../utils/formatters";

type FeatherIconName = keyof typeof Feather.glyphMap;

const periodFilters: Array<{ id: PeriodFilter; label: string }> = [
  { id: "this_month", label: "Este mês" },
  { id: "last_month", label: "Mês anterior" },
  { id: "last_3_months", label: "Últimos 3 meses" },
  { id: "last_6_months", label: "Últimos 6 meses" },
  { id: "this_year", label: "Este ano" },
];

const INITIAL_DATA: ReportData = {
  totalReceitas: 0,
  totalDespesas: 0,
  saldo: 0,
  gastosNoCartao: 0,
  gastosForaCartao: 0,
  despesasRecorrentes: 0,
  despesasAvulsas: 0,
  categoriasDespesa: [],
  cartaoPorCategoria: [],
};

/** Módulo de Relatórios e Gráficos (seção 15 e Etapa 9). */
export function ReportsScreen() {
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodFilter>("this_month");
  const [data, setData] = useState<ReportData>(INITIAL_DATA);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const report = await getReportData(selectedPeriod);
      setData(report);
    } finally {
      setLoading(false);
    }
  }, [selectedPeriod]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  async function handleRefresh() {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }

  const maxCompare = Math.max(data.totalReceitas, data.totalDespesas, 1);
  const receitaBarPct = Math.min(100, Math.round((data.totalReceitas / maxCompare) * 100));
  const despesaBarPct = Math.min(100, Math.round((data.totalDespesas / maxCompare) * 100));

  const totalCartao = data.gastosNoCartao + data.gastosForaCartao || 1;
  const cartaoPct = Math.round((data.gastosNoCartao / totalCartao) * 100);

  const totalRecorrentes = data.despesasRecorrentes + data.despesasAvulsas || 1;
  const recorrentePct = Math.round((data.despesasRecorrentes / totalRecorrentes) * 100);

  return (
    <SafeAreaView style={styles.safeArea} edges={["bottom", "left", "right"]}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <Text style={styles.title}>Relatórios Financeiros</Text>

        {/* Filtros de Período em Chips horizontais */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsRow}
        >
          {periodFilters.map((p) => {
            const isSelected = p.id === selectedPeriod;
            return (
              <Pressable
                key={p.id}
                style={[styles.chip, isSelected && styles.chipActive]}
                onPress={() => setSelectedPeriod(p.id)}
              >
                <Text
                  style={[styles.chipText, isSelected && styles.chipTextActive]}
                >
                  {p.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* 1. Receitas x Despesas */}
        <Card>
          <View style={styles.cardHeaderRow}>
            <Feather name="bar-chart-2" size={18} color={colors.primary} />
            <Text style={styles.cardTitle}>Receitas vs Despesas</Text>
          </View>

          <View style={styles.chartMetricRow}>
            <View style={styles.metricColumn}>
              <Text style={styles.metricLabel}>Receitas</Text>
              <Text style={[styles.metricValue, { color: colors.income }]}>
                {formatCurrency(data.totalReceitas)}
              </Text>
            </View>
            <View style={styles.metricColumnRight}>
              <Text style={styles.metricLabel}>Despesas</Text>
              <Text style={[styles.metricValue, { color: colors.expense }]}>
                {formatCurrency(data.totalDespesas)}
              </Text>
            </View>
          </View>

          {/* Bar Chart Comparativo */}
          <View style={styles.barChartContainer}>
            <View style={styles.barWrapper}>
              <View
                style={[
                  styles.barFill,
                  { width: `${receitaBarPct}%`, backgroundColor: colors.income },
                ]}
              />
            </View>
            <View style={styles.barWrapper}>
              <View
                style={[
                  styles.barFill,
                  { width: `${despesaBarPct}%`, backgroundColor: colors.expense },
                ]}
              />
            </View>
          </View>

          <View style={styles.saldoRow}>
            <Text style={styles.saldoLabel}>Resultado no período:</Text>
            <Text
              style={[
                styles.saldoValue,
                { color: data.saldo >= 0 ? colors.income : colors.expense },
              ]}
            >
              {formatCurrency(data.saldo)}
            </Text>
          </View>
        </Card>

        {/* 2. Despesas por Categoria */}
        <Card>
          <View style={styles.cardHeaderRow}>
            <Feather name="pie-chart" size={18} color={colors.primary} />
            <Text style={styles.cardTitle}>Despesas por Categoria</Text>
          </View>

          {data.categoriasDespesa.length === 0 ? (
            <Text style={styles.emptyText}>
              Nenhuma despesa registrada neste período.
            </Text>
          ) : (
            <View style={styles.categoryList}>
              {data.categoriasDespesa.map((item) => (
                <View key={item.categoriaId} style={styles.categoryItem}>
                  <View style={styles.categoryHeader}>
                    <View style={styles.categoryNameWrapper}>
                      <View
                        style={[
                          styles.categoryDot,
                          { backgroundColor: item.cor },
                        ]}
                      />
                      <Text style={styles.categoryName}>{item.nome}</Text>
                    </View>
                    <Text style={styles.categoryValue}>
                      {formatCurrency(item.total)} ({item.percentual}%)
                    </Text>
                  </View>
                  <View style={styles.categoryTrack}>
                    <View
                      style={[
                        styles.categoryFill,
                        {
                          width: `${item.percentual}%`,
                          backgroundColor: item.cor,
                        },
                      ]}
                    />
                  </View>
                </View>
              ))}
            </View>
          )}
        </Card>

        {/* 3. Gastos no Cartão de Crédito */}
        <Card>
          <View style={styles.cardHeaderRow}>
            <Feather name="credit-card" size={18} color={colors.creditCard} />
            <Text style={styles.cardTitle}>Gastos no Cartão de Crédito</Text>
          </View>

          <View style={styles.metricRow}>
            <Text style={styles.metricLabel}>Total gasto no cartão:</Text>
            <Text style={[styles.metricValue, { color: colors.creditCard }]}>
              {formatCurrency(data.gastosNoCartao)}
            </Text>
          </View>

          <View style={styles.progressSection}>
            <View style={styles.progressLabelRow}>
              <Text style={styles.progressSubText}>
                No Cartão: {cartaoPct}%
              </Text>
              <Text style={styles.progressSubText}>
                Fora do Cartão: {100 - cartaoPct}%
              </Text>
            </View>
            <View style={styles.track}>
              <View
                style={[
                  styles.fill,
                  {
                    width: `${cartaoPct}%`,
                    backgroundColor: colors.creditCard,
                  },
                ]}
              />
            </View>
          </View>

          {data.cartaoPorCategoria.length > 0 ? (
            <View style={styles.subList}>
              <Text style={styles.subListTitle}>Categorias no cartão:</Text>
              {data.cartaoPorCategoria.map((cat) => (
                <View key={cat.categoriaId} style={styles.subItem}>
                  <Text style={styles.subItemName}>{cat.nome}</Text>
                  <Text style={styles.subItemValue}>
                    {formatCurrency(cat.total)} ({cat.percentual}%)
                  </Text>
                </View>
              ))}
            </View>
          ) : null}
        </Card>

        {/* 4. Despesas Recorrentes vs Variáveis */}
        <Card>
          <View style={styles.cardHeaderRow}>
            <Feather name="repeat" size={18} color={colors.primary} />
            <Text style={styles.cardTitle}>Despesas Recorrentes vs Avulsas</Text>
          </View>

          <View style={styles.metricRow}>
            <Text style={styles.metricLabel}>Total de recorrentes:</Text>
            <Text style={styles.metricValue}>
              {formatCurrency(data.despesasRecorrentes)} ({recorrentePct}%)
            </Text>
          </View>

          <View style={styles.track}>
            <View
              style={[
                styles.fill,
                {
                  width: `${recorrentePct}%`,
                  backgroundColor: colors.primary,
                },
              ]}
            />
          </View>
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
    paddingBottom: spacing.xxl,
  },
  title: {
    ...typography.displayMd,
    color: colors.textPrimary,
    marginBottom: spacing.xxs,
  },
  chipsRow: {
    gap: spacing.xs,
    paddingRight: spacing.md,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    ...typography.bodyMd,
    color: colors.textSecondary,
  },
  chipTextActive: {
    color: colors.textInverse,
    fontWeight: "600",
  },
  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  cardTitle: {
    ...typography.titleLg,
    color: colors.textPrimary,
  },
  chartMetricRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.xs,
  },
  metricColumn: {
    flex: 1,
  },
  metricColumnRight: {
    flex: 1,
    alignItems: "flex-end",
  },
  metricLabel: {
    ...typography.bodySm,
    color: colors.textSecondary,
  },
  metricValue: {
    ...typography.titleLg,
    marginTop: 2,
  },
  barChartContainer: {
    gap: 6,
    marginVertical: spacing.xs,
  },
  barWrapper: {
    height: 12,
    backgroundColor: colors.divider,
    borderRadius: radius.full,
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    borderRadius: radius.full,
  },
  saldoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: spacing.sm,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  saldoLabel: {
    ...typography.titleMd,
    color: colors.textPrimary,
  },
  saldoValue: {
    ...typography.titleLg,
  },
  categoryList: {
    gap: spacing.sm,
  },
  categoryItem: {},
  categoryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  categoryNameWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  categoryDot: {
    width: 10,
    height: 10,
    borderRadius: radius.full,
  },
  categoryName: {
    ...typography.bodyMd,
    color: colors.textPrimary,
  },
  categoryValue: {
    ...typography.bodySm,
    color: colors.textSecondary,
  },
  categoryTrack: {
    height: 8,
    borderRadius: radius.full,
    backgroundColor: colors.divider,
    overflow: "hidden",
  },
  categoryFill: {
    height: "100%",
    borderRadius: radius.full,
  },
  metricRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  progressSection: {
    marginVertical: spacing.xs,
  },
  progressLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  progressSubText: {
    ...typography.bodySm,
    color: colors.textSecondary,
  },
  track: {
    height: 8,
    borderRadius: radius.full,
    backgroundColor: colors.divider,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: radius.full,
  },
  subList: {
    marginTop: spacing.sm,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    gap: 4,
  },
  subListTitle: {
    ...typography.bodySm,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  subItem: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  subItemName: {
    ...typography.bodyMd,
    color: colors.textPrimary,
  },
  subItemValue: {
    ...typography.bodySm,
    color: colors.textSecondary,
  },
  emptyText: {
    ...typography.bodyMd,
    color: colors.textSecondary,
  },
});
