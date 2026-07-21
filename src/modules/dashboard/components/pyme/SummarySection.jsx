/**
 * SummarySection.jsx
 *
 * Sección de resumen general del negocio PYME.
 *
 * Contiene indicadores principales:
 *
 * - Ventas del día
 * - Ingresos
 * - Productos vendidos
 * - Clientes
 *
 * Utiliza:
 *
 * - SectionHeader
 * - SummaryCard
 *
 * No realiza cálculos.
 * Solo organiza información.
 */

import React from "react";
import { View } from "react-native";

import SectionHeader from "../shared/SectionHeader";
import SummaryCard from "../shared/SummaryCard";

import styles from "./styles/summarySection.styles";

const SummarySection = ({ data = {}, currency = "USD", onPress }) => {
  return (
    <View style={styles.container}>
      <SectionHeader
        title="Resumen del negocio"
        subtitle="Estado actual de la operación"
        actionLabel={onPress ? "Ver más" : undefined}
        onActionPress={onPress}
      />

      <View style={styles.grid}>
        <View style={styles.column}>
          <SummaryCard
            title="Ventas del día"
            value={data.sales || 0}
            type="currency"
            currency={currency}
            growth={data.salesGrowth}
          />
        </View>

        <View style={styles.column}>
          <SummaryCard
            title="Ingresos"
            value={data.income || 0}
            type="currency"
            currency={currency}
            growth={data.incomeGrowth}
          />
        </View>

        <View style={styles.column}>
          <SummaryCard
            title="Productos vendidos"
            value={data.productsSold || 0}
            subtitle="Hoy"
          />
        </View>

        <View style={styles.column}>
          <SummaryCard
            title="Clientes"
            value={data.customers || 0}
            subtitle="Registrados"
          />
        </View>
      </View>
    </View>
  );
};

export default SummarySection;