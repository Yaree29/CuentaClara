/**
 * FinanceSection.jsx
 *
 * Sección financiera del Dashboard PYME.
 *
 * Compatible con la nueva estructura del dashboardEngine.
 */

import React from "react";
import { View, Text } from "react-native";

import SectionHeader from "../shared/SectionHeader";
import SummaryCard from "../shared/SummaryCard";
import DashboardCard from "../shared/DashboardCard";

import styles from "./styles/financeSection.styles";

const FinanceSection = ({
  data = {},
  currency = "USD",
  onPress,
}) => {
  const {
    sales = 0,
    expenses = 0,
    balance = 0,
    movements = 0,
    lastMovement,
  } = data;

  return (
    <View style={styles.container}>
      <SectionHeader
        title="Finanzas"
        subtitle="Resumen financiero del negocio"
        actionLabel={onPress ? "Ver detalles" : undefined}
        onActionPress={onPress}
      />

      <View style={styles.grid}>
        <View style={styles.column}>
          <SummaryCard
            title="Ingresos"
            value={sales}
            type="currency"
            currency={currency}
            variant="success"
          />
        </View>

        <View style={styles.column}>
          <SummaryCard
            title="Gastos"
            value={expenses}
            type="currency"
            currency={currency}
            variant="warning"
          />
        </View>

        <View style={styles.column}>
          <SummaryCard
            title="Balance"
            value={balance}
            type="currency"
            currency={currency}
            variant={balance >= 0 ? "success" : "danger"}
          />
        </View>

        <View style={styles.column}>
          <SummaryCard
            title="Movimientos"
            value={movements}
            subtitle="Registrados"
          />
        </View>
      </View>

      {!!lastMovement && (
        <DashboardCard title="Último movimiento">
          <View style={styles.lastMovement}>
            <Text>{lastMovement}</Text>
          </View>
        </DashboardCard>
      )}
    </View>
  );
};

export default FinanceSection;