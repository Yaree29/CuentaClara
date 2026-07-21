/**
 * GoalsSection.jsx
 *
 * Sección de metas del Dashboard PYME.
 *
 * Muestra:
 *
 * - Objetivos de ventas
 * - Crecimiento
 * - Metas operativas
 *
 * No calcula progreso.
 * Recibe datos procesados.
 */

import React from "react";
import { View } from "react-native";

import SectionHeader from "../shared/SectionHeader";
import GoalProgressCard from "../shared/GoalProgressCard";
import EmptyState from "../shared/EmptyState";

import styles from "./styles/goalSection.styles";

const GoalsSection = ({
  goals = [],
  title = "Metas del negocio",
  currency = "USD",
  onGoalPress,
}) => {
  return (
    <View style={styles.container}>
      <SectionHeader title={title} subtitle="Seguimiento de objetivos" />

      {goals.length > 0 ? (
        <View style={styles.list}>
          {goals.map((goal, index) => (
            <GoalProgressCard
              key={goal.id || index}
              title={goal.title}
              current={goal.current}
              target={goal.target}
              type={goal.type || "number"}
              currency={currency}
              variant={goal.variant || "default"}
            />
          ))}
        </View>
      ) : (
        <EmptyState
          icon="🎯"
          title="No hay metas configuradas"
          message="Configura objetivos para medir el crecimiento de tu negocio"
        />
      )}
    </View>
  );
};

export default GoalsSection;