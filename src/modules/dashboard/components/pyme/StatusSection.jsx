/**
 * StatusSection.jsx
 *
 * Sección de estado general del negocio.
 *
 * Compatible con la nueva estructura
 * del dashboardEngine.
 */

import React from "react";
import { View, Text } from "react-native";

import SectionHeader from "../shared/SectionHeader";
import DashboardCard from "../shared/DashboardCard";
import EmptyState from "../shared/EmptyState";

import styles from "./styles/statusSection.styles";

const StatusSection = ({
  status = {},
  title = "Estado del negocio",
}) => {
  const getStatusIcon = (value) => {
    switch (value) {
      case "active":
        return "🟢";

      case "warning":
        return "🟡";

      case "inactive":
        return "🔴";

      default:
        return "⚪";
    }
  };

  const hasStatus =
    Object.keys(status).length > 0;

  const statusItems = [
    {
      label: "Estado",
      value:
        status.status === "active"
          ? "Activo"
          : "Inactivo",
      icon: getStatusIcon(status.status),
    },
    {
      label: "Módulos activos",
      value: String(status.totalModules ?? 0),
      icon: "🧩",
    },
    {
      label: "Descripción",
      value:
        status.description ||
        "Sin descripción",
      icon: "ℹ️",
    },
  ];

  return (
    <View style={styles.container}>
      <SectionHeader
        title={title}
        subtitle="Estado actual de la plataforma"
      />

      {hasStatus ? (
        <DashboardCard title={status.title}>
          <View style={styles.content}>
            {statusItems.map((item, index) => (
              <View
                key={item.label}
                style={[
                  styles.row,
                  index < statusItems.length - 1 &&
                    styles.divider,
                ]}
              >
                <View style={styles.left}>
                  <Text style={styles.icon}>
                    {item.icon}
                  </Text>

                  <Text style={styles.label}>
                    {item.label}
                  </Text>
                </View>

                <Text style={styles.value}>
                  {item.value}
                </Text>
              </View>
            ))}
          </View>
        </DashboardCard>
      ) : (
        <EmptyState
          icon="📡"
          title="Sin estado disponible"
          message="No se pudo obtener información del sistema"
        />
      )}
    </View>
  );
};

export default StatusSection;