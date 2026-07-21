import { StyleSheet } from "react-native";
import colors from "../../../../../theme/colors"; // Ajusta la ruta a tu archivo de colores

export default StyleSheet.create({
  // === CONTENIDO ===
  content: {
    gap: 8,
  },

  // === VALOR PRINCIPAL ===
  value: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  compactValue: {
    fontSize: 20,
  },

  // === INDICADOR DE CRECIMIENTO (GROWTH) ===
  growthContainer: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 6,
  },
  growth: {
    fontSize: 13,
    fontWeight: "700",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    overflow: "hidden", // Requerido para bordes redondeados en componentes Text en iOS
  },
  positive: {
    color: colors.successDark,
    backgroundColor: colors.successLight,
  },
  negative: {
    color: colors.logoutText,
    backgroundColor: colors.logoutBackground,
  },
  growthLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: "500",
  },
});