import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { colors, radius, spacing, typography } from "../theme";
import { formatCurrency } from "../utils/formatters";
import { Badge, type BadgeTone } from "./Badge";
import type { RecorrenteStatus } from "../types";

const statusLabel: Record<RecorrenteStatus, string> = {
  ativa: "Ativa",
  pausada: "Pausada",
  encerrada: "Encerrada",
};

const statusTone: Record<RecorrenteStatus, BadgeTone> = {
  ativa: "success",
  pausada: "warning",
  encerrada: "neutral",
};

const periodicidadeLabel: Record<string, string> = {
  semanal: "Semanal",
  mensal: "Mensal",
  anual: "Anual",
};

interface RecurringExpenseListItemProps {
  descricao: string;
  valor: number;
  periodicidade: string;
  diaVencimento: number;
  status: RecorrenteStatus;
  cartaoCredito: boolean;
  onPress: () => void;
}

export function RecurringExpenseListItem({
  descricao,
  valor,
  periodicidade,
  diaVencimento,
  status,
  cartaoCredito,
  onPress,
}: RecurringExpenseListItemProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
    >
      <View style={styles.iconWrapper}>
        <Feather name="repeat" size={18} color={colors.primary} />
      </View>

      <View style={styles.info}>
        <Text style={styles.descricao} numberOfLines={1}>
          {descricao}
        </Text>
        <View style={styles.metaRow}>
          <Text style={styles.metaText}>
            {periodicidadeLabel[periodicidade] ?? periodicidade} • dia {diaVencimento}
          </Text>
          {cartaoCredito ? (
            <View style={styles.badgeWrapper}>
              <Badge label="Cartão" tone="creditCard" />
            </View>
          ) : null}
          <View style={styles.badgeWrapper}>
            <Badge label={statusLabel[status]} tone={statusTone[status]} />
          </View>
        </View>
      </View>

      <Text style={styles.valor}>{formatCurrency(valor)}</Text>
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
    backgroundColor: colors.primaryLight,
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
    flexWrap: "wrap",
    marginTop: 2,
    gap: 4,
  },
  metaText: {
    ...typography.bodySm,
    color: colors.textSecondary,
  },
  badgeWrapper: {
    marginLeft: 2,
  },
  valor: {
    ...typography.titleMd,
    color: colors.textPrimary,
  },
});
