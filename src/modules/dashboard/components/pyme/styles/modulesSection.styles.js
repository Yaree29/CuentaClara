import { StyleSheet } from "react-native";
import colors from "../../../../../theme/colors"; // Ajusta la ruta relativa a la carpeta de tu tema

export default StyleSheet.create({
  // === CONTENEDOR SECCIÓN ===
  container: {
    marginBottom: 16,
  },

  // === GRID DE MÓDULOS ===
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -6,
    paddingVertical: 4,
  },
  moduleItem: {
    width: "33.33%", // Muestra 3 módulos por fila
    alignItems: "center",
    paddingHorizontal: 6,
    paddingVertical: 10,
  },

  // === CONTENEDOR DEL ÍCONO ===
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.cardSecondary,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  icon: {
    fontSize: 20,
  },

  // === TEXTOS Y ESTADO ===
  name: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textPrimary,
    textAlign: "center",
    marginBottom: 2,
  },
  status: {
    fontSize: 11,
    fontWeight: "500",
    color: colors.textMuted,
    textAlign: "center",
  },
});