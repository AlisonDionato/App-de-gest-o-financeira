import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { colors, radius, spacing, typography } from "../theme";
import { formatCurrency, formatDateShort } from "../utils/formatters";
import { Badge } from "./Badge";

interface TransactionListItemProps {
  descricao: string;
  categoriaNome: string;
  categoriaIcon?: keyof typeof Feather.glyphMap;
  categoriaCor?: string;
  data: string; // ISO
  valor: number;
  tipo: "receita" | "despesa";
  cartaoCredito?: boolean;
  onPress?: () => void;
}

/** Item de lista usado em Receitas, Despesas e Extrato — diferenciação visual entre entrada/saída. */
export function TransactionListItem({
  descricao,
  categoriaNome,
  categoriaIcon,
  categoriaCor,
  data,
  valor,
  tipo,
  cartaoCredito,
  onPress,
}: TransactionListItemProps) {
  const isIncome = tipo === "receita";

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
    >
      <View
        style={[
          styles.iconWrapper,
          { backgroundColor: categoriaCor ? categoriaCor + "22" : colors.surfaceAlt },
        ]}
      >
        <Feather
          name={categoriaIcon ?? (isIncome ? "arrow-down-circle" : "arrow-up-circle")}
          size={18}
          color={categoriaCor ?? (isIncome ? colors.income : colors.expense)}
        />
      </View>

      <View style={styles.info}>
        <Text style={styles.descricao} numberOfLines={1}>
          {descricao}
        </Text>
        <View style={styles.metaRow}>
          <Text style={styles.metaText}>{categoriaNome}</Text>
          <Text style={styles.metaDot}>•</Text>
          <Text style={styles.metaText}>{formatDateShort(new Date(data))}</Text>
          {cartaoCredito ? (
            <View style={styles.badgeWrapper}>
              <Badge label="Cartão" tone="creditCard" />
            </View>
          ) : null}
        </View>
      </View>

      <Text style={[styles.valor, { color: isIncome ? colors.income : colors.expense }]}>
        {isIncome ? "+ " : "- "}
        {formatCurrency(Math.abs(valor))}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.sm,
  },
  pressed: {
    opacity: 0.6,
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.sm,
  },
  info: {
    flex: 1,
    marginRight: spacing.xs,
  },
  descricao: {
    ...typography.bodyLg,
    color: colors.textPrimary,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
    flexWrap: "wrap",
  },
  metaText: {
    ...typography.bodySm,
    color: colors.textSecondary,
  },
  metaDot: {
    ...typography.bodySm,
    color: colors.textSecondary,
    marginHorizontal: 4,
  },
  badgeWrapper: {
    marginLeft: spacing.xs,
  },
  valor: {
    ...typography.titleMd,
  },
});
