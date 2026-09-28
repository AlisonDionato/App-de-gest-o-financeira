import React, { useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import { Card, TransactionListItem } from "../../components";
import { colors, radius, spacing, typography } from "../../theme";
import { useReceitas } from "../../hooks/useReceitas";
import { useDespesas } from "../../hooks/useDespesas";
import { useCategorias } from "../../hooks/useCategorias";
import type { RootStackParamList } from "../../navigation/types";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

type MovimentoTipo = "todas" | "receita" | "despesa";
type CartaoFiltro = "todos" | "cartao" | "fora";

interface MovimentoUnificado {
  id: string;
  tipo: "receita" | "despesa";
  descricao: string;
  categoriaId: string;
  data: string;
  valor: number;
  cartaoCredito?: boolean;
}

/**
 * Extrato financeiro (seção 11): combina receitas e despesas em uma única
 * lista, com filtros por tipo e cartão de crédito. Filtros por categoria e
 * conta ficam para um próximo refinamento (a lista já traz essa informação
 * por item; os seletores adicionais podem ser plugados aqui sem mudar a
 * estrutura).
 */
export function StatementScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { receitas, reload: reloadReceitas } = useReceitas();
  const { despesas, reload: reloadDespesas } = useDespesas();
  const { categorias: categoriasReceita } = useCategorias("receita");
  const { categorias: categoriasDespesa } = useCategorias("despesa");

  const [tipoFiltro, setTipoFiltro] = useState<MovimentoTipo>("todas");
  const [cartaoFiltro, setCartaoFiltro] = useState<CartaoFiltro>("todos");

  useFocusEffect(
    React.useCallback(() => {
      reloadReceitas();
      reloadDespesas();
    }, [reloadReceitas, reloadDespesas])
  );

  const categoriaById = useMemo(() => {
    const map = new Map<string, { nome: string; icone: string; cor: string }>();
    [...categoriasReceita, ...categoriasDespesa].forEach((c) =>
      map.set(c.id, { nome: c.nome, icone: c.icone, cor: c.cor })
    );
    return map;
  }, [categoriasReceita, categoriasDespesa]);

  const movimentos: MovimentoUnificado[] = useMemo(() => {
    const todasReceitas: MovimentoUnificado[] = receitas.map((r) => ({
      id: r.id,
      tipo: "receita",
      descricao: r.descricao,
      categoriaId: r.categoriaId,
      data: r.data,
      valor: r.valor,
    }));
    const todasDespesas: MovimentoUnificado[] = despesas.map((d) => ({
      id: d.id,
      tipo: "despesa",
      descricao: d.descricao,
      categoriaId: d.categoriaId,
      data: d.data,
      valor: d.valor,
      cartaoCredito: d.cartaoCredito,
    }));

    return [...todasReceitas, ...todasDespesas]
      .filter((m) => tipoFiltro === "todas" || m.tipo === tipoFiltro)
      .filter((m) => {
        if (cartaoFiltro === "todos") return true;
        if (m.tipo === "receita") return false; // filtro de cartão só se aplica a despesas
        return cartaoFiltro === "cartao" ? !!m.cartaoCredito : !m.cartaoCredito;
      })
      .sort((a, b) => (a.data < b.data ? 1 : -1));
  }, [receitas, despesas, tipoFiltro, cartaoFiltro]);

  function openItem(m: MovimentoUnificado) {
    if (m.tipo === "receita") {
      navigation.navigate("IncomeForm", { id: m.id });
    } else {
      navigation.navigate("ExpenseForm", { id: m.id });
    }
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["bottom", "left", "right"]}>
      <View style={styles.filtersRow}>
        <FilterChip
          label="Todas"
          active={tipoFiltro === "todas"}
          onPress={() => setTipoFiltro("todas")}
        />
        <FilterChip
          label="Receitas"
          active={tipoFiltro === "receita"}
          onPress={() => setTipoFiltro("receita")}
        />
        <FilterChip
          label="Despesas"
          active={tipoFiltro === "despesa"}
          onPress={() => setTipoFiltro("despesa")}
        />
      </View>
      <View style={styles.filtersRow}>
        <FilterChip
          label="Cartão e não cartão"
          active={cartaoFiltro === "todos"}
          onPress={() => setCartaoFiltro("todos")}
          icon="filter"
        />
        <FilterChip
          label="Só cartão"
          active={cartaoFiltro === "cartao"}
          onPress={() => setCartaoFiltro("cartao")}
          icon="credit-card"
        />
        <FilterChip
          label="Fora do cartão"
          active={cartaoFiltro === "fora"}
          onPress={() => setCartaoFiltro("fora")}
        />
      </View>

      <FlatList
        data={movimentos}
        keyExtractor={(item) => `${item.tipo}-${item.id}`}
        contentContainerStyle={styles.listContent}
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
              tipo={item.tipo}
              cartaoCredito={item.cartaoCredito}
              onPress={() => openItem(item)}
            />
          );
        }}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyText}>
              Nenhuma movimentação encontrada para os filtros selecionados.
            </Text>
          </Card>
        }
      />
    </SafeAreaView>
  );
}

interface FilterChipProps {
  label: string;
  active: boolean;
  onPress: () => void;
  icon?: keyof typeof Feather.glyphMap;
}

function FilterChip({ label, active, onPress, icon }: FilterChipProps) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, active && styles.chipActive]}
      accessibilityRole="button"
    >
      {icon ? (
        <Feather
          name={icon}
          size={12}
          color={active ? colors.textInverse : colors.textSecondary}
          style={styles.chipIcon}
        />
      ) : null}
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  filtersRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xs,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    backgroundColor: colors.surface,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipIcon: {
    marginRight: 4,
  },
  chipText: {
    ...typography.bodySm,
    color: colors.textSecondary,
  },
  chipTextActive: {
    color: colors.textInverse,
  },
  listContent: {
    padding: spacing.md,
    flexGrow: 1,
  },
  separator: {
    height: 1,
    backgroundColor: colors.divider,
  },
  emptyCard: {
    marginTop: spacing.sm,
  },
  emptyText: {
    ...typography.bodyMd,
    color: colors.textSecondary,
  },
});
