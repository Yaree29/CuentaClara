/**
 * QuickActions.jsx
 *
 * Acciones rápidas del Dashboard PYME.
 *
 * Recibe las acciones construidas por
 * dashboardEngine/buildQuickActions().
 *
 * Cada acción debe tener:
 * - id
 * - title
 * - subtitle
 * - icon (HeroIcon)
 * - color
 * - route
 * - onPress (opcional)
 */

import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

import DashboardCard from "./DashboardCard";

import styles from "./styles/quickAction.styles";

const QuickActions = ({
  title = "Acciones rápidas",
  actions = [],
}) => {
  const navigation = useNavigation();

  // Mismo patrón defensivo que goToTab() en InformalDashboard.jsx: si la
  // acción no trae onPress propio, navega por su `route` (+`params` si
  // trae); si esa route no existe todavía en ningún navigator (ver
  // engine/quickActions.js), se captura el error en vez de romper la app.
  const handlePress = (action) => {
    if (action.onPress) {
      action.onPress();
      return;
    }
    if (!action.route) return;
    try {
      navigation.navigate(action.route, action.params);
    } catch (e) {
      console.warn(`[QuickActions] ruta "${action.route}" no disponible:`, e?.message);
    }
  };

  return (
    <DashboardCard title={title}>
      <View style={styles.container}>
        {actions.map((action) => {
          const Icon = action.icon;

          return (
            <TouchableOpacity
              key={action.id}
              style={styles.action}
              activeOpacity={0.7}
              onPress={() => handlePress(action)}
            >
              <View style={styles.iconContainer}>
                {Icon && (
                  <Icon
                    size={24}
                    color={action.color}
                  />
                )}
              </View>

              <View style={styles.textContainer}>
                <Text
                  style={styles.label}
                  numberOfLines={1}
                >
                  {action.title}
                </Text>

                {action.subtitle ? (
                  <Text
                    style={styles.subtitle}
                    numberOfLines={2}
                  >
                    {action.subtitle}
                  </Text>
                ) : null}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </DashboardCard>
  );
};

export default QuickActions;