/**
 * ActivitySection.jsx
 *
 * Sección de actividad reciente
 * del Dashboard PYME.
 *
 * Compatible con la nueva estructura
 * del dashboardEngine.
 */

import React from "react";
import { View, Text } from "react-native";

import SectionHeader from "../shared/SectionHeader";
import DashboardCard from "../shared/DashboardCard";
import EmptyState from "../shared/EmptyState";

import styles from "./styles/activitySection.styles";

const ActivitySection = ({
  activities = [],
  activity = null,
  title = "Actividad reciente",
  limit = 5,
  onViewAll,
}) => {
  /**
   * Compatibilidad con el nuevo dashboardEngine.
   *
   * Si viene un arreglo de actividades se utiliza.
   * Si únicamente viene el objeto "activity",
   * se genera un resumen automáticamente.
   */
  let activityList = activities;

  if (
    activityList.length === 0 &&
    activity
  ) {
    activityList = [
      {
        id: "sales",
        type: "sale",
        title: "Ventas registradas",
        description: `${activity.sales ?? 0} ventas realizadas`,
      },
      {
        id: "expenses",
        type: "expense",
        title: "Gastos registrados",
        description: `${activity.expenses ?? 0} gastos registrados`,
      },
      {
        id: "movements",
        type: "movement",
        title: "Movimientos",
        description: `${activity.movements ?? 0} movimientos registrados`,
      },
    ];
  }

  const visibleActivities = activityList.slice(0, limit);

  const getActivityIcon = (type) => {
    switch (type) {
      case "sale":
        return "🛒";

      case "expense":
        return "💸";

      case "payment":
        return "💰";

      case "inventory":
        return "📦";

      case "movement":
        return "📊";

      default:
        return "📌";
    }
  };

  return (
    <View style={styles.container}>
      <SectionHeader
        title={title}
        subtitle="Últimos movimientos registrados"
        actionLabel={onViewAll ? "Ver todo" : undefined}
        onActionPress={onViewAll}
      />

      {visibleActivities.length > 0 ? (
        <DashboardCard>
          <View>
            {visibleActivities.map((activity, index) => (
              <View
                key={activity.id || index}
                style={[
                  styles.item,
                  index < visibleActivities.length - 1 &&
                    styles.divider,
                ]}
              >
                <View style={styles.iconContainer}>
                  <Text style={styles.icon}>
                    {getActivityIcon(activity.type)}
                  </Text>
                </View>

                <View style={styles.content}>
                  <Text style={styles.title}>
                    {activity.title}
                  </Text>

                  {!!activity.description && (
                    <Text style={styles.description}>
                      {activity.description}
                    </Text>
                  )}
                </View>

                {!!activity.time && (
                  <Text style={styles.time}>
                    {activity.time}
                  </Text>
                )}
              </View>
            ))}
          </View>
        </DashboardCard>
      ) : (
        <EmptyState
          icon="📋"
          title="Sin actividad reciente"
          message="Las operaciones del negocio aparecerán aquí"
        />
      )}
    </View>
  );
};

export default ActivitySection;