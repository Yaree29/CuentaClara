/**
 * DashboardCard.jsx
 *
 * Componente base para tarjetas del Dashboard.
 *
 * Usado por:
 * - SummaryCard
 * - AlertCard
 * - GoalProgressCard
 * - QuickActions
 *
 * Este componente NO maneja lógica de negocio.
 * Solo controla estructura visual.
 */

import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
} from "react-native";

import colors from "../../../../theme/colors";
import styles from "./styles/dashboardCard.styles";

const DashboardCard = ({
  title,
  subtitle,
  icon: Icon,
  children,
  action,
  onActionPress,
  variant = "default",
  fullWidth = false,
  padding = true,
}) => {
  return (
    <View
      style={[
        styles.container,
        fullWidth && styles.fullWidth,
        styles[variant],
      ]}
    >
      {(title || Icon || action) && (
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            {Icon && (
              <View style={styles.iconContainer}>
                <Icon
                  size={22}
                  color={colors.primary}
                />
              </View>
            )}

            <View style={styles.textContainer}>
              {title && (
                <Text
                  style={styles.title}
                  numberOfLines={1}
                >
                  {title}
                </Text>
              )}

              {subtitle && (
                <Text
                  style={styles.subtitle}
                  numberOfLines={1}
                >
                  {subtitle}
                </Text>
              )}
            </View>
          </View>

          {action && (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={onActionPress}
            >
              <Text style={styles.action}>
                {action}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      <View
        style={[
          styles.content,
          !padding && styles.noPadding,
        ]}
      >
        {children}
      </View>
    </View>
  );
};

export default DashboardCard;