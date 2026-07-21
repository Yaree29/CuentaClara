import { StyleSheet } from "react-native";
import colors from "../../../../../theme/colors"; // Ajusta la ruta a tu archivo de colores

export default StyleSheet.create({
  // === CONTENEDOR EN RETÍCULA (GRID) ===
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12, // Espaciado uniforme entre botones
  },

  // === BOTÓN DE ACCIÓN ===
  action: {
    flex: 1,
    minWidth: "45%", // Garantiza 2 columnas responsivas por fila
    backgroundColor: colors.quickButtonBackground,
    borderWidth: 1,
    borderColor: colors.quickButtonBorder,
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  // === CONTENEDOR DE ÍCONO ===
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.salesBadgeBackground,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  icon: {
    fontSize: 20,
  },

  // === ETIQUETA / TEXTO ===
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textPrimary,
    textAlign: "center",
  },
});