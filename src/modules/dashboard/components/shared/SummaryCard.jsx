/**
 * SummaryCard.jsx
 *
 * Tarjeta para mostrar indicadores principales
 * del Dashboard PYME.
 */

import React from "react";
import { View, Text } from "react-native";
import DashboardCard from "./DashboardCard";
import { formatMoney } from "../../helpers/currency";
import { getGrowthLabel } from "../../helpers/dashboardHelpers";
import styles from "./styles/summaryCard.styles";

const SummaryCard = ({
  title = "",
  value = 0,
  currency = "USD",
  icon,
  subtitle,
  growth,
  type = "number",
  variant = "default",
  compact = false,
}) => {

  const safeValue = Number(value) || 0;
  const safeGrowth = Number(growth) || 0;

  const renderValue = () => {
    if (type === "currency") {
      return formatMoney(safeValue, currency);
    }
    if (type === "percentage") {
      return `${safeValue}%`;
    }
    return safeValue.toString();
  };

  return (
    <DashboardCard
      title={title}
      subtitle={subtitle}
      icon={icon}
      variant={variant}
    >
      <View style={styles.content}>
        <Text
          style={[
            styles.value,
            compact && styles.compactValue
          ]}
        >
          {renderValue()}
        </Text>
        {growth !== undefined && growth !== null && (
          <View style={styles.growthContainer}>
            <Text
              style={[
                styles.growth,
                safeGrowth >= 0
                  ? styles.positive
                  : styles.negative,
              ]}
            >
              {
                safeGrowth >= 0
                  ? `↑ ${safeGrowth}%`
                  : `↓ ${Math.abs(safeGrowth)}%`
              }
            </Text>
            <Text style={styles.growthLabel}>
              {getGrowthLabel(safeGrowth)}
            </Text>
          </View>
        )}
      </View>
    </DashboardCard>
  );
};
export default SummaryCard;