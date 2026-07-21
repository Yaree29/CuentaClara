/**
 * AlertsSection.jsx
 *
 * Sección de alertas del Dashboard PYME.
 *
 * Muestra:
 *
 * - Inventario bajo
 * - Metas pendientes
 * - Alertas financieras
 * - Avisos del sistema
 *
 * No calcula alertas.
 * Solo organiza y presenta información.
 */

import React from "react";
import { View } from "react-native";

import SectionHeader from "../shared/SectionHeader";
import AlertCard from "../shared/AlertCard";
import EmptyState from "../shared/EmptyState";

import styles from "./styles/alertSection.style";

const AlertsSection = ({
  alerts = [],
  title = "Alertas del negocio",
  onAlertPress,
  onViewAll,
}) => {
  return (
    <View style={styles.container}>
      <SectionHeader
        title={title}
        subtitle="Requieren atención"
        actionLabel={onViewAll ? "Ver todas" : undefined}
        onActionPress={onViewAll}
      />

      {alerts.length > 0 ? (
        <AlertCard alerts={alerts} onPress={onAlertPress} />
      ) : (
        <EmptyState
          icon="✅"
          title="Todo está correcto"
          message="No existen alertas pendientes para tu negocio"
        />
      )}
    </View>
  );
};

export default AlertsSection;