import type { NavigatorScreenParams } from "@react-navigation/native";

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

/**
 * Rotas do tab principal: as 3 funções centrais do app, sempre visíveis.
 * As demais telas (Extrato, Relatórios, Metas, Contas) ficam na stack raiz,
 * acessíveis pelo menu hambúrguer (ver MenuModal).
 */
export type MainTabParamList = {
  Dashboard: undefined; // Saldo
  Income: undefined;
  Expenses: undefined;
};

/**
 * Rotas da stack raiz quando o usuário está autenticado.
 */
export type RootStackParamList = {
  Main: NavigatorScreenParams<MainTabParamList>;
  IncomeForm: { id?: string } | undefined;
  ExpenseForm: { id?: string } | undefined;
  RecurringExpenses: undefined;
  RecurringExpenseForm: { id?: string } | undefined;
  Statement: undefined;
  Reports: undefined;
  Goals: undefined;
  Accounts: undefined;
  Settings: undefined;
};

/** Rotas do menu hambúrguer, na ordem em que devem ser exibidas. */
export type HamburgerMenuRoute = "Statement" | "Reports" | "Goals" | "Accounts";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
