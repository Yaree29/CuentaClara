import { StyleSheet } from "react-native";

export default StyleSheet.create({
  // === CONTENEDOR SECCIÓN ===
  container: {
    marginBottom: 16,
  },

  // === GRID DE RESUMEN (2 COLUMNAS) ===
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -6, // Compensa el padding de las columnas
  },
  column: {
    width: "50%",
    paddingHorizontal: 6,
    marginBottom: 12,
  },
});