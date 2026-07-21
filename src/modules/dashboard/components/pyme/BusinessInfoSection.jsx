/**
 * BusinessInfoSection.jsx
 *
 * Sección de información del negocio PYME.
 *
 * Compatible con la nueva estructura
 * del dashboardEngine.
 */

import React from "react";
import { View, Text } from "react-native";

import SectionHeader from "../shared/SectionHeader";
import DashboardCard from "../shared/DashboardCard";
import EmptyState from "../shared/EmptyState";

import styles from "./styles/businessInfoSection.styles";

const BusinessInfoSection = ({
  business = {},
  title = "Información del negocio",
  onEdit,
}) => {
  const information = [
    {
      label: "Nombre",
      value: business.name || "No configurado",
    },
    {
      label: "Categoría",
      value: business.category || "General",
    },
    {
      label: "Rol",
      value: business.role || "Administrador",
    },
    {
      label: "Módulos activos",
      value: String(business.modules ?? 0),
    },
  ];

  const hasBusiness =
    Object.keys(business).length > 0;

  return (
    <View style={styles.container}>
      <SectionHeader
        title={title}
        subtitle="Datos principales del negocio"
        actionLabel={onEdit ? "Editar" : undefined}
        onActionPress={onEdit}
      />

      {hasBusiness ? (
        <DashboardCard>
          <View style={styles.content}>
            {information.map((item, index) => (
              <View
                key={item.label}
                style={[
                  styles.row,
                  index < information.length - 1 &&
                    styles.divider,
                ]}
              >
                <Text style={styles.label}>
                  {item.label}
                </Text>

                <Text style={styles.value}>
                  {item.value}
                </Text>
              </View>
            ))}
          </View>
        </DashboardCard>
      ) : (
        <EmptyState
          icon="🏢"
          title="Sin información del negocio"
          message="Completa la configuración empresarial para visualizar estos datos"
        />
      )}
    </View>
  );
};

export default BusinessInfoSection;