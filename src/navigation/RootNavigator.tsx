import React, { createContext, useContext, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import {
  NavigationContainer,
  useNavigation,
  useNavigationContainerRef,
} from "@react-navigation/native";
import {
  createNativeStackNavigator,
  type NativeStackNavigationProp,
} from "@react-navigation/native-stack";
import { colors } from "../theme";
import { MenuModal, SyncStatusBar } from "../components";
import { AuthProvider, useAuth } from "../contexts/AuthContext";
import { SyncProvider } from "../contexts/SyncContext";
import { AuthNavigator } from "./AuthNavigator";
import { MainTabNavigator } from "./MainTabNavigator";
import { IncomeFormScreen } from "../screens/income/IncomeFormScreen";
import { ExpenseFormScreen } from "../screens/expenses/ExpenseFormScreen";
import { RecurringExpensesScreen } from "../screens/recurringExpenses/RecurringExpensesScreen";
import { RecurringExpenseFormScreen } from "../screens/recurringExpenses/RecurringExpenseFormScreen";
import { StatementScreen } from "../screens/statement/StatementScreen";
import { ReportsScreen } from "../screens/reports/ReportsScreen";
import { GoalsScreen } from "../screens/goals/GoalsScreen";
import { AccountsScreen } from "../screens/accounts/AccountsScreen";
import { SettingsScreen } from "../screens/settings/SettingsScreen";
import type { HamburgerMenuRoute, RootStackParamList } from "./types";

const Stack = createNativeStackNavigator<RootStackParamList>();

/** Permite que o botão hambúrguer (no header) abra o menu controlado por RootNavigator. */
const MenuVisibilityContext = createContext<{ openMenu: () => void } | undefined>(
  undefined
);

function useMenuVisibility() {
  const ctx = useContext(MenuVisibilityContext);
  if (!ctx) {
    throw new Error(
      "useMenuVisibility deve ser usado dentro do RootNavigator"
    );
  }
  return ctx;
}

/** Botão que abra o menu hambúrguer (Extrato, Relatórios, Metas, Contas). */
function HamburgerHeaderButton() {
  const { openMenu } = useMenuVisibility();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Abrir menu"
      hitSlop={12}
      onPress={openMenu}
    >
      <Feather name="menu" size={22} color={colors.textPrimary} />
    </Pressable>
  );
}

/** Botão de acesso à área secundária (Configurações/Perfil), no header do tab principal. */
function SettingsHeaderButton() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Abrir configurações"
      hitSlop={12}
      onPress={() => navigation.navigate("Settings")}
    >
      <Feather name="settings" size={22} color={colors.textPrimary} />
    </Pressable>
  );
}

const secondaryScreenOptions = {
  headerStyle: { backgroundColor: colors.background },
  headerShadowVisible: false,
} as const;

function AppContent() {
  const { user, loading } = useAuth();
  const [menuVisible, setMenuVisible] = useState(false);
  const navigationRef = useNavigationContainerRef<RootStackParamList>();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  if (!user) {
    return (
      <NavigationContainer>
        <AuthNavigator />
      </NavigationContainer>
    );
  }

  function handleMenuNavigate(route: HamburgerMenuRoute) {
    setMenuVisible(false);
    navigationRef.navigate(route);
  }

  return (
    <MenuVisibilityContext.Provider
      value={{ openMenu: () => setMenuVisible(true) }}
    >
      <View style={styles.flex}>
        <SyncStatusBar />
        <NavigationContainer ref={navigationRef}>
          <Stack.Navigator>
            <Stack.Screen
              name="Main"
              component={MainTabNavigator}
              options={{
                headerTitle: "",
                headerShadowVisible: false,
                headerStyle: { backgroundColor: colors.background },
                headerLeft: () => <HamburgerHeaderButton />,
                headerRight: () => <SettingsHeaderButton />,
              }}
            />
            <Stack.Screen
              name="Statement"
              component={StatementScreen}
              options={{ title: "Extrato", ...secondaryScreenOptions }}
            />
            <Stack.Screen
              name="IncomeForm"
              component={IncomeFormScreen}
              options={{
                presentation: "modal",
                title: "Nova receita",
                ...secondaryScreenOptions,
              }}
            />
            <Stack.Screen
              name="ExpenseForm"
              component={ExpenseFormScreen}
              options={{
                presentation: "modal",
                title: "Nova despesa",
                ...secondaryScreenOptions,
              }}
            />
            <Stack.Screen
              name="RecurringExpenses"
              component={RecurringExpensesScreen}
              options={{ title: "Despesas recorrentes", ...secondaryScreenOptions }}
            />
            <Stack.Screen
              name="RecurringExpenseForm"
              component={RecurringExpenseFormScreen}
              options={{
                presentation: "modal",
                title: "Nova despesa recorrente",
                ...secondaryScreenOptions,
              }}
            />
            <Stack.Screen
              name="Reports"
              component={ReportsScreen}
              options={{ title: "Relatórios", ...secondaryScreenOptions }}
            />
            <Stack.Screen
              name="Goals"
              component={GoalsScreen}
              options={{ title: "Metas", ...secondaryScreenOptions }}
            />
            <Stack.Screen
              name="Accounts"
              component={AccountsScreen}
              options={{ title: "Contas", ...secondaryScreenOptions }}
            />
            <Stack.Screen
              name="Settings"
              component={SettingsScreen}
              options={{ title: "Configurações", ...secondaryScreenOptions }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </View>

      <MenuModal
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        onNavigate={handleMenuNavigate}
      />
    </MenuVisibilityContext.Provider>
  );
}

export function RootNavigator() {
  return (
    <AuthProvider>
      <SyncProvider>
        <AppContent />
      </SyncProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
  },
});
