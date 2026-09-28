/**
 * Paleta de cores do aplicativo.
 * Tons neutros para uma interface minimalista, com cores semânticas
 * para receita (verde), despesa (vermelho) e alertas.
 */
export const colors = {
  // Fundo e superfícies
  background: "#F7F8FA",
  surface: "#FFFFFF",
  surfaceAlt: "#F1F3F6",

  // Texto
  textPrimary: "#0F172A",
  textSecondary: "#64748B",
  textInverse: "#FFFFFF",
  textDisabled: "#94A3B8",

  // Marca
  primary: "#2563EB",
  primaryDark: "#1D4ED8",
  primaryLight: "#DBEAFE",

  // Semânticas financeiras
  income: "#16A34A",
  incomeLight: "#DCFCE7",
  expense: "#DC2626",
  expenseLight: "#FEE2E2",
  creditCard: "#7C3AED",
  creditCardLight: "#EDE9FE",

  // Estados
  success: "#16A34A",
  warning: "#D97706",
  warningLight: "#FEF3C7",
  danger: "#DC2626",
  dangerLight: "#FEE2E2",

  // Utilitários
  border: "#E2E8F0",
  divider: "#EDF1F5",
  overlay: "rgba(15, 23, 42, 0.45)",

  // Status de conexão
  online: "#16A34A",
  offline: "#DC2626",
  syncing: "#D97706",
} as const;

export type ColorToken = keyof typeof colors;
