import React, { useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import { AccountModal, Badge, Card, ConfirmModal, Fab } from "../../components";
import { useContas } from "../../hooks/useContas";
import {
  createConta,
  deleteConta,
  updateConta,
} from "../../services/accounts.service";
import { colors, radius, spacing, typography } from "../../theme";
import { formatCurrency } from "../../utils/formatters";
import type { Conta, ContaTipo } from "../../types";

type FeatherIconName = keyof typeof Feather.glyphMap;

const contaIcon: Record<ContaTipo, FeatherIconName> = {
  corrente: "credit-card",
  poupanca: "archive",
  carteira: "dollar-sign",
  banco_digital: "smartphone",
  investimento: "trending-up",
};

const contaTipoLabel: Record<ContaTipo, string> = {
  corrente: "Conta Corrente",
  poupanca: "Poupança",
  carteira: "Carteira",
  banco_digital: "Banco Digital",
  investimento: "Investimentos",
};

/** Módulo de Contas Financeiras (seção 10 e Etapa 6). */
export function AccountsScreen() {
  const { contas, reload } = useContas();

  const [modalVisible, setModalVisible] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Conta | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      reload();
    }, [reload])
  );

  const totalSaldo = contas.reduce((sum, c) => sum + c.saldoAtual, 0);

  async function handleSaveAccount(data: {
    nome: string;
    tipo: ContaTipo;
    saldoInicial: number;
  }) {
    if (editingAccount) {
      await updateConta(editingAccount.id, {
        nome: data.nome,
        tipo: data.tipo,
      });
    } else {
      await createConta(data);
    }
    await reload();
  }

  async function handleConfirmDelete() {
    if (!deletingId) return;
    setDeleting(true);
    try {
      await deleteConta(deletingId);
      setDeletingId(null);
      await reload();
    } finally {
      setDeleting(false);
    }
  }

  function handleOpenCreate() {
    setEditingAccount(null);
    setModalVisible(true);
  }

  function handleOpenEdit(account: Conta) {
    setEditingAccount(account);
    setModalVisible(true);
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["bottom", "left", "right"]}>
      <FlatList
        data={contas}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.title}>Contas Financeiras</Text>
            <Card style={styles.totalCard}>
              <Text style={styles.totalLabel}>Saldo total acumulado</Text>
              <Text
                style={[
                  styles.totalValue,
                  { color: totalSaldo >= 0 ? colors.income : colors.expense },
                ]}
              >
                {formatCurrency(totalSaldo)}
              </Text>
            </Card>
          </View>
        }
        renderItem={({ item }) => (
          <Card style={styles.accountCard}>
            <View style={styles.cardHeader}>
              <View style={styles.iconWrapper}>
                <Feather
                  name={contaIcon[item.tipo] ?? "credit-card"}
                  size={20}
                  color={colors.primary}
                />
              </View>
              <View style={styles.info}>
                <Text style={styles.accountName}>{item.nome}</Text>
                <View style={styles.badgeRow}>
                  <Badge
                    label={contaTipoLabel[item.tipo] ?? item.tipo}
                    tone="neutral"
                  />
                </View>
              </View>
              <View style={styles.cardActions}>
                <Pressable
                  hitSlop={8}
                  onPress={() => handleOpenEdit(item)}
                  style={styles.actionButton}
                >
                  <Feather name="edit-2" size={18} color={colors.textSecondary} />
                </Pressable>
                {contas.length > 1 ? (
                  <Pressable
                    hitSlop={8}
                    onPress={() => setDeletingId(item.id)}
                    style={styles.actionButton}
                  >
                    <Feather name="trash-2" size={18} color={colors.expense} />
                  </Pressable>
                ) : null}
              </View>
            </View>

            <View style={styles.balanceRow}>
              <View>
                <Text style={styles.balanceLabel}>Saldo atual</Text>
                <Text
                  style={[
                    styles.balanceValue,
                    { color: item.saldoAtual >= 0 ? colors.income : colors.expense },
                  ]}
                >
                  {formatCurrency(item.saldoAtual)}
                </Text>
              </View>
              <View style={styles.initialBalanceView}>
                <Text style={styles.balanceLabel}>Saldo inicial</Text>
                <Text style={styles.initialBalanceValue}>
                  {formatCurrency(item.saldoInicial)}
                </Text>
              </View>
            </View>
          </Card>
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />

      <Fab
        accessibilityLabel="Adicionar nova conta"
        onPress={handleOpenCreate}
      />

      <AccountModal
        visible={modalVisible}
        editingAccount={editingAccount}
        onSave={handleSaveAccount}
        onClose={() => setModalVisible(false)}
      />

      <ConfirmModal
        visible={!!deletingId}
        title="Excluir conta"
        message="Deseja excluir esta conta? Esta ação não afetará o histórico de transações já realizadas."
        destructive
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingId(null)}
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
    marginBottom: spacing.md,
    gap: spacing.xs,
  },
  title: {
    ...typography.displayMd,
    color: colors.textPrimary,
  },
  totalCard: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primaryLight,
  },
  totalLabel: {
    ...typography.bodyMd,
    color: colors.primary,
  },
  totalValue: {
    ...typography.titleLg,
    fontSize: 24,
    marginTop: 2,
  },
  accountCard: {
    gap: spacing.sm,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.sm,
  },
  info: {
    flex: 1,
  },
  accountName: {
    ...typography.titleLg,
    color: colors.textPrimary,
  },
  badgeRow: {
    marginTop: 2,
    flexDirection: "row",
  },
  cardActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  actionButton: {
    padding: 4,
  },
  balanceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  balanceLabel: {
    ...typography.bodySm,
    color: colors.textSecondary,
  },
  balanceValue: {
    ...typography.titleLg,
    marginTop: 2,
  },
  initialBalanceView: {
    alignItems: "flex-end",
  },
  initialBalanceValue: {
    ...typography.bodyLg,
    color: colors.textPrimary,
    marginTop: 2,
  },
  separator: {
    height: spacing.xs,
  },
});
