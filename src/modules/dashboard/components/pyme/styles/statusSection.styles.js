import { StyleSheet } from "react-native";
import colors from "../../../../../theme/colors"; // Ajusta la ruta a tu archivo de colores

export default StyleSheet.create({
  // === CONTENEDOR SECCIÓN ===
  container: {
    marginBottom: 16,
  },

  // === CONTENIDO GENERAL ===
  content: {
    paddingVertical: 4,
  },

  // === FILA (ROW) ===
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
  },

  // Separador opcional entre elementos
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },

  // === LADO IZQUIERDO (ÍCONO + ETIQUETA) ===
  left: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  icon: {
    fontSize: 14,
    marginRight: 10,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.rowLabel,
  },

  // === VALOR DEL ESTADO ===
  value: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.rowValue,
    textAlign: "right",
    textTransform: "capitalize",
    flexShrink: 1,
    marginLeft: 12,
  },
});