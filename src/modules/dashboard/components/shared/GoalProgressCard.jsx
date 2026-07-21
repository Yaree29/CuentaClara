/**
 * GoalProgressCard.jsx
 *
 * Tarjeta para mostrar el progreso
 * de una meta del Dashboard PYME.
 *
 * Recibe la información procesada
 * desde el dashboardEngine.
 */

import React from "react";
import { View, Text } from "react-native";

import DashboardCard from "./DashboardCard";
import ProgressBar from "./PogressBar";

import { buildProgressData } from "../../helpers/progress";
import { formatMoney } from "../../helpers/currency";

import styles from "./styles/goalProgressCard.styles";

const GoalProgressCard = ({
  title = "Meta",
  current = 0,
  target = 0,
  percentage,
  label,
  type = "number",
  currency = "USD",
  icon,
  variant = "default",
}) => {
  /**
   * Construye la información del progreso.
   * Si el porcentaje viene desde el motor,
   * se utiliza; de lo contrario se calcula.
   */
  const progress = buildProgressData({
    current,
    target,
    percentage,
    label: label || title,
  });

  /**
   * Formatea valores monetarios.
   */
  const formatValue = (value) => {
    if (type === "currency") {
      return formatMoney(Number(value || 0), currency);
    }

    return value;
  };

  return (
    <DashboardCard
      title={title}
      icon={icon}
      variant={variant}
    >
      <View style={styles.container}>
        <View style={styles.values}>
          <Text style={styles.current}>
            {formatValue(progress.current)}
          </Text>

          <Text style={styles.target}>
            / {formatValue(progress.target)}
          </Text>
        </View>

        <ProgressBar
          progress={progress.percentage}
          status={progress.status}
        />

        <View style={styles.footer}>
          <Text style={styles.percentage}>
            {progress.percentage.toFixed(0)}%
          </Text>

          <Text style={styles.status}>
            {progress.statusLabel}
          </Text>
        </View>

        {progress.remaining > 0 && (
          <Text style={styles.remaining}>
            Faltan{" "}
            {formatValue(progress.remaining)}{" "}
            para alcanzar la meta
          </Text>
        )}

        {progress.exceeded > 0 && (
          <Text style={styles.completed}>
            Meta superada por{" "}
            {formatValue(progress.exceeded)}
          </Text>
        )}
      </View>
    </DashboardCard>
  );
};

export default GoalProgressCard;