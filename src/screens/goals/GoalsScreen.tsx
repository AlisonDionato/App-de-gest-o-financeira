import React, { useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import {
  Button,
  Card,
  ConfirmModal,
  ContributionModal,
  Fab,
  GoalModal,
} from "../../components";
import { useMetas } from "../../hooks/useMetas";
import {
  addContribuicao,
  createMeta,
  deleteMeta,
} from "../../services/goals.service";
import { colors, radius, spacing, typography } from "../../theme";
import { formatCurrency, formatDate } from "../../utils/formatters";
import type { Meta } from "../../types";

/** Módulo de Metas Financeiras (seção 13 e Etapa 7). */
export function GoalsScreen() {
  const { metas, reload } = useMetas();

  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [selectedGoalForContrib, setSelectedGoalForContrib] = useState<Meta | null>(
    null
  );
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      reload();
    }, [reload])
  );

  async function handleCreateGoal(data: {
    nome: string;
    valorObjetivo: number;
    dataLimite?: string | null;
    descricao?: string;
  }) {
    await createMeta(data);
    await reload();
  }

  async function handleAddContribution(data: {
    valor: number;
    observacao?: string;
  }) {
    if (!selectedGoalForContrib) return;
    await addContribuicao({
      metaId: selectedGoalForContrib.id,
      valor: data.valor,
      data: new Date().toISOString(),
      observacao: data.observacao,
    });
    setSelectedGoalForContrib(null);
    await reload();
  }

  async function handleConfirmDelete() {
    if (!deletingId) return;
    setDeleting(true);
    try {
      await deleteMeta(deletingId);
      setDeletingId(null);
      await reload();
    } finally {
      setDeleting(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["bottom", "left", "right"]}>
      <FlatList
        data={metas}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.title}>Metas Financeiras</Text>
            <Text style={styles.subtitle}>
              Acompanhe seu progresso e atinja seus objetivos financeiros.
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const progress = Math.min(
            100,
            Math.round((item.valorAtual / item.valorObjetivo) * 100) || 0
          );

          return (
            <Card style={styles.goalCard}>
              <View style={styles.cardHeader}>
                <View style={styles.titleWrapper}>
                  <Text style={styles.goalName}>{item.nome}</Text>
                  {item.descricao ? (
                    <Text style={styles.goalDescription}>{item.descricao}</Text>
                  ) : null}
                </View>
                <Pressable
                  hitSlop={8}
                  onPress={() => setDeletingId(item.id)}
                  style={styles.deleteButton}
                >
                  <Feather name="trash-2" size={18} color={colors.expense} />
                </Pressable>
              </View>

              <View style={styles.progressHeader}>
                <Text style={styles.progressText}>
                  {formatCurrency(item.valorAtual)} / {formatCurrency(item.valorObjetivo)}
                </Text>
                <Text style={styles.percentageText}>{progress}%</Text>
              </View>

              {/* Barra de Progresso Visual */}
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

              {item.dataLimite ? (
                <Text style={styles.deadlineText}>
                  Data limite: {formatDate(new Date(item.dataLimite))}
                </Text>
              ) : null}

              <View style={styles.cardFooter}>
                <Button
                  label="+ Contribuir"
                  variant="secondary"
                  onPress={() => setSelectedGoalForContrib(item)}
                />
              </View>
            </Card>
          );
        }}
        ListEmptyComponent={
          <Card>
            <Text style={styles.emptyText}>
              Nenhuma meta cadastrada ainda. Toque no "+" para criar sua primeira
              meta (ex.: Viagem, Reserva de Emergência, Carro).
            </Text>
          </Card>
        }
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />

      <Fab
        accessibilityLabel="Adicionar nova meta"
        onPress={() => setCreateModalVisible(true)}
      />

      <GoalModal
        visible={createModalVisible}
        onSave={handleCreateGoal}
        onClose={() => setCreateModalVisible(false)}
      />

      <ContributionModal
        visible={!!selectedGoalForContrib}
        goalTitle={selectedGoalForContrib?.nome ?? ""}
        onSave={handleAddContribution}
        onClose={() => setSelectedGoalForContrib(null)}
      />

      <ConfirmModal
        visible={!!deletingId}
        title="Excluir meta"
        message="Deseja excluir esta meta e todas as suas contribuições associadas?"
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
  subtitle: {
    ...typography.bodyMd,
    color: colors.textSecondary,
  },
  goalCard: {
    gap: spacing.xs,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  titleWrapper: {
    flex: 1,
    marginRight: spacing.xs,
  },
  goalName: {
    ...typography.titleLg,
    color: colors.textPrimary,
  },
  goalDescription: {
    ...typography.bodySm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  deleteButton: {
    padding: 4,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: spacing.xs,
  },
  progressText: {
    ...typography.titleMd,
    color: colors.textPrimary,
  },
  percentageText: {
    ...typography.titleLg,
    color: colors.primary,
  },
  progressBarTrack: {
    height: 10,
    borderRadius: radius.full,
    backgroundColor: colors.divider,
    overflow: "hidden",
    marginVertical: 4,
  },
  progressBarFill: {
    height: "100%",
    borderRadius: radius.full,
  },
  deadlineText: {
    ...typography.bodySm,
    color: colors.textSecondary,
  },
  cardFooter: {
    marginTop: spacing.xs,
  },
  emptyText: {
    ...typography.bodyMd,
    color: colors.textSecondary,
  },
  separator: {
    height: spacing.sm,
  },
});
