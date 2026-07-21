/**
 * AlertCard.jsx
 *
 * Tarjeta para mostrar una alerta del Dashboard PYME.
 *
 * Recibe una sola alerta por props.
 */

import React from "react";
import { View, Text, TouchableOpacity } from "react-native";

import DashboardCard from "./DashboardCard";

import styles from "./styles/alertCard.styles";

const AlertCard = ({
  title = "Alerta",
  description = "",
  severity = "warning",
  module,
  icon,
  onPress,
}) => {
  const getSeverityColor = () => {
    switch (severity) {
      case "danger":
      case "error":
        return styles.danger;

      case "success":
        return styles.success;

      case "info":
        return styles.info;

      case "warning":
      default:
        return styles.warning;
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={onPress ? 0.7 : 1}
      onPress={onPress}
    >
      <DashboardCard
        title={title}
        subtitle={module}
        icon={icon}
        variant="warning"
      >
        <View style={styles.container}>
          <Text style={styles.description}>
            {description || "Sin descripción"}
          </Text>

          <View
            style={[
              styles.badge,
              getSeverityColor(),
            ]}
          >
            <Text style={styles.badgeText}>
              {severity.toUpperCase()}
            </Text>
          </View>
        </View>
      </DashboardCard>
    </TouchableOpacity>
  );
};

export default AlertCard;