import { StyleSheet } from "react-native";
import colors from "../../../../../theme/colors"; // Ajusta la ruta relativa a la carpeta de tu tema

export default StyleSheet.create({
  // === CONTENEDOR PRINCIPAL ===
  container: {
    marginBottom: 16,
  },

  // === CONTENIDO GENERAL ===
  content: {
    paddingVertical: 4,
  },

  // === FILA CLAVE-VALOR (ROW) ===
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
  },

  // Divisor entre filas (se omite en el último elemento)
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },

  // === ETIQUETA / CAMPO ===
  label: {
    fontSize: 14,
    color: colors.rowLabel,
    fontWeight: "500",
  },

  // === VALOR DEL CAMPO ===
  value: {
    fontSize: 14,
    color: colors.rowValue,
    fontWeight: "600",
    textAlign: "right",
    flexShrink: 1,
    marginLeft: 16,
  },
});