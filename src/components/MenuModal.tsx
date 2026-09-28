import React from "react";
import { Feather } from "@expo/vector-icons";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  type GestureResponderEvent,
} from "react-native";
import { colors, radius, spacing, typography } from "../theme";
import type { HamburgerMenuRoute } from "../navigation/types";

type FeatherIconName = keyof typeof Feather.glyphMap;

interface MenuItem {
  route: HamburgerMenuRoute;
  label: string;
  icon: FeatherIconName;
}

const menuItems: MenuItem[] = [
  { route: "Statement", label: "Extrato", icon: "list" },
  { route: "Reports", label: "Relatórios", icon: "bar-chart-2" },
  { route: "Goals", label: "Metas", icon: "target" },
  { route: "Accounts", label: "Contas", icon: "credit-card" },
];

interface MenuModalProps {
  visible: boolean;
  onClose: () => void;
  onNavigate: (route: HamburgerMenuRoute) => void;
}

/**
 * Menu hambúrguer com as telas secundárias (Extrato, Relatórios, Metas,
 * Contas) que não ficam na tab bar. Implementado como um modal deslizante
 * lateral simples (sem Drawer Navigator) para não exigir
 * react-native-reanimated / react-native-gesture-handler apenas para isso.
 */
export function MenuModal({ visible, onClose, onNavigate }: MenuModalProps) {
  function stopPropagation(event: GestureResponderEvent) {
    event.stopPropagation();
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.panel} onPress={stopPropagation}>
          <View style={styles.header}>
            <Text style={styles.title}>Menu</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Fechar menu"
              hitSlop={12}
              onPress={onClose}
            >
              <Feather name="x" size={22} color={colors.textPrimary} />
            </Pressable>
          </View>

          {menuItems.map((item) => (
            <Pressable
              key={item.route}
              accessibilityRole="button"
              style={({ pressed }) => [
                styles.item,
                pressed && styles.itemPressed,
              ]}
              onPress={() => onNavigate(item.route)}
            >
              <Feather name={item.icon} size={20} color={colors.textPrimary} />
              <Text style={styles.itemLabel}>{item.label}</Text>
              <Feather
                name="chevron-right"
                size={18}
                color={colors.textSecondary}
              />
            </Pressable>
          ))}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: "flex-end",
  },
  panel: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },
  title: {
    ...typography.titleLg,
    color: colors.textPrimary,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  itemPressed: {
    opacity: 0.6,
  },
  itemLabel: {
    ...typography.bodyLg,
    color: colors.textPrimary,
    flex: 1,
  },
});
