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

import DashboardCard from "./DashboardCard";

import styles from "./styles/quickAction.styles";

const QuickActions = ({
  title = "Acciones rápidas",
  actions = [],
}) => {
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
              onPress={action.onPress}
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