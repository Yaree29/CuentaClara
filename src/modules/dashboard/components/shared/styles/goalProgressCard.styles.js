import { StyleSheet } from "react-native";
import colors from "../../../../../theme/colors"; // Ajusta la ruta según tu estructura de carpetas

export default StyleSheet.create({
  // === CONTENEDOR PRINCIPAL ===
  container: {
    gap: 10,
  },

  // === VALORES (ACTUAL / OBJETIVO) ===
  values: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  current: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  target: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: "500",
    marginLeft: 4,
  },

  // === FOOTER DEL PROGRESO ===
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 2,
  },
  percentage: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.primary,
  },
  status: {
    fontSize: 12,
    fontWeight: "500",
    color: colors.textSecondary,
  },

  // === MENSAJES INFORMATIVOS DE META ===
  remaining: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
    fontStyle: "italic",
  },
  completed: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.textSuccess,
    marginTop: 4,
  },
});