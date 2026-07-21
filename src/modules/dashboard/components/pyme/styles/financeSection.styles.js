import { StyleSheet } from "react-native";
import colors from "../../../../../theme/colors"; // Ajusta la ruta relativa a tu carpeta de temas

export default StyleSheet.create({
  // === CONTENEDOR SECCIÓN ===
  container: {
    marginBottom: 16,
  },

  // === GRID DE TARJETAS (2 COLUMNAS) ===
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -6, // Compensa el padding de las columnas
    marginBottom: 8,
  },
  column: {
    width: "50%",
    paddingHorizontal: 6,
    marginBottom: 12,
  },

  // === CONTENEDOR ÚLTIMO MOVIMIENTO ===
  lastMovement: {
    paddingVertical: 8,
  },
  lastMovementText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});