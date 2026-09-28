import React from "react";
import { Feather } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { colors } from "../theme";
import { DashboardScreen } from "../screens/dashboard/DashboardScreen";
import { ExpensesScreen } from "../screens/expenses/ExpensesScreen";
import { IncomeScreen } from "../screens/income/IncomeScreen";
import type { MainTabParamList } from "./types";

const Tab = createBottomTabNavigator<MainTabParamList>();

type FeatherIconName = keyof typeof Feather.glyphMap;

// Ícones escolhidos para remeter ao sentido de cada função:
// Saldo -> carteira; Receitas -> entrada (seta para baixo); Despesas -> saída (seta para cima).
const tabIcons: Record<keyof MainTabParamList, FeatherIconName> = {
  Dashboard: "credit-card",
  Income: "arrow-down-circle",
  Expenses: "arrow-up-circle",
};

const tabLabels: Record<keyof MainTabParamList, string> = {
  Dashboard: "Saldo",
  Income: "Receitas",
  Expenses: "Despesas",
};

/**
 * Navegação principal: apenas as 3 funções centrais do app (Saldo,
 * Receitas, Despesas), sempre visíveis na tab bar. As demais telas
 * (Extrato, Relatórios, Metas, Contas) ficam no menu hambúrguer,
 * acessível pelo header (ver RootNavigator + MenuModal).
 */
export function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
        },
        tabBarLabel: tabLabels[route.name as keyof MainTabParamList],
        tabBarIcon: ({ color, size }) => (
          <Feather
            name={tabIcons[route.name as keyof MainTabParamList]}
            color={color}
            size={size}
          />
        ),
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Income" component={IncomeScreen} />
      <Tab.Screen name="Expenses" component={ExpensesScreen} />
    </Tab.Navigator>
  );
}
