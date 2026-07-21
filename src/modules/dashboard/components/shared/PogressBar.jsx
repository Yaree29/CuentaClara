/**
 * ProgressBar.jsx
 *
 * Barra visual de progreso.
 *
 * Usada por:
 * - GoalProgressCard
 * - Indicadores KPI
 * - Metas del Dashboard
 *
 * Solo representa el progreso recibido.
 */

import React from "react";
import { View } from "react-native";

import styles from "./styles/pogressBar.styles";

const ProgressBar = ({
  progress = 0,
  height = 8,
  status = "normal",
}) => {
  /**
   * Asegura un porcentaje válido.
   */
  const percentage = Math.min(
    Math.max(Number(progress) || 0, 0),
    100
  );

  /**
   * Verifica que exista el estilo
   * correspondiente al estado.
   */
  const statusStyle =
    styles[status] || styles.normal;

  return (
    <View
      style={[
        styles.container,
        { height },
      ]}
    >
      <View
        style={[
          styles.fill,
          statusStyle,
          {
            width: `${percentage}%`,
          },
        ]}
      />
    </View>
  );
};

export default ProgressBar;