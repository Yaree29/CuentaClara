/**
 * ModulesSection.jsx
 *
 * Sección que muestra los módulos activos
 * del negocio PYME.
 *
 * Compatible con la nueva estructura del dashboardEngine.
 */

import React from "react";
import { View, Text } from "react-native";

import SectionHeader from "../shared/SectionHeader";
import DashboardCard from "../shared/DashboardCard";
import EmptyState from "../shared/EmptyState";

import styles from "./styles/modulesSection.styles";

const ModulesSection = ({
  modules = [],
  title = "Módulos activos",
}) => {
  return (
    <View style={styles.container}>
      <SectionHeader
        title={title}
        subtitle="Funciones disponibles para tu negocio"
      />

      {modules.length === 0 ? (
        <EmptyState
          icon="🧩"
          title="Sin módulos disponibles"
          message="No hay funcionalidades activas configuradas"
        />
      ) : (
        <DashboardCard>
          <View style={styles.grid}>
            {modules.map((module, index) => {
              const Icon = module.icon;

              return (
                <View
                  key={module.id || index}
                  style={styles.moduleItem}
                >
                  <View style={styles.iconContainer}>
                    {Icon ? (
                      <Icon
                        size={26}
                        color="#2563EB"
                      />
                    ) : (
                      <Text style={styles.icon}>⚙️</Text>
                    )}
                  </View>

                  <Text style={styles.name}>
                    {module.title || module.name}
                  </Text>

                  <Text style={styles.status}>
                    {module.enabled === false
                      ? "Inactivo"
                      : "Activo"}
                  </Text>
                </View>
              );
            })}
          </View>
        </DashboardCard>
      )}
    </View>
  );
};

export default ModulesSection;