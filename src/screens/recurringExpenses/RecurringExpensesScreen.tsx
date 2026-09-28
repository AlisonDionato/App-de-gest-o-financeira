import React, { useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Card, Fab, RecurringExpenseListItem } from "../../components";
import { colors, spacing, typography } from "../../theme";
import { useDespesasRecorrentes } from "../../hooks/useDespesasRecorrentes";
import type { RootStackParamList } from "../../navigation/types";

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "RecurringExpenses">;

/**
 * Lista das regras de despesas recorrentes (seção 8). A geração das
 * ocorrências mensais/semanais/anuais acontece automaticamente em segundo
 * plano (ver `recurringExpenses.service.ts`); esta tela só gerencia as
 * regras (criar, editar, pausar, retomar, encerrar, excluir).
 */
export function RecurringExpensesScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { recorrentes, reload } = useDespesasRecorrentes();
  const [refreshKey, setRefreshKey] = useState(0);

  useFocusEffect(
    React.useCallback(() => {
      reload();
    }, [reload, refreshKey])
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={["bottom", "left", "right"]}>
      <FlatList
        data={recorrentes}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
        renderItem={({ item }) => (
          <RecurringExpenseListItem
            descricao={item.descricao}
            valor={item.valor}
            periodicidade={item.periodicidade}
            diaVencimento={item.diaVencimento}
            status={item.ativa}
            cartaoCredito={item.cartaoCredito}
            onPress={() =>
              navigation.navigate("RecurringExpenseForm", { id: item.id })
            }
          />
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <Card>
            <Text style={styles.emptyText}>
              Nenhuma despesa recorrente cadastrada. Toque no "+" para criar a
              primeira (ex.: aluguel, internet, academia).
            </Text>
          </Card>
        }
      />

      <Fab
        accessibilityLabel="Adicionar despesa recorrente"
        onPress={() => navigation.navigate("RecurringExpenseForm")}
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
  separator: {
    height: 1,
    backgroundColor: colors.divider,
  },
  emptyText: {
    ...typography.bodyMd,
    color: colors.textSecondary,
  },
});
