import { StyleSheet } from "react-native";
import colors from "../../../../../theme/colors"; // Ajusta la ruta relativa según la estructura de tu proyecto

export default StyleSheet.create({
  // === CONTENEDOR SECCIÓN ===
  container: {
    marginBottom: 16,
  },

  // === ITEM DE ACTIVIDAD (FILA) ===
  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },

  // Divisor opcional entre ítems (se omite en el último)
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },

  // === CONTENEDOR DEL ÍCONO ===
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: colors.cardSecondary,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  icon: {
    fontSize: 18,
  },

  // === CONTENIDO DE TEXTO ===
  content: {
    flex: 1,
    justifyContent: "center",
    marginRight: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textPrimary,
    marginBottom: 2,
  },
  description: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },

  // === HORA / TIEMPO REGISTRADO ===
  time: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: "500",
  },
});