import { StyleSheet } from "react-native";
import colors from "../../../../../theme/colors"; // Ajusta la ruta relativa a tu carpeta de colores

export default StyleSheet.create({
  // === ESTADO VACÍO ===
  empty: {
    paddingVertical: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyIcon: {
    fontSize: 28,
    color: colors.success,
    marginBottom: 6,
    fontWeight: "bold",
  },
  emptyText: {
    fontSize: 14,
    color: colors.emptyText,
    textAlign: "center",
    fontWeight: "500",
  },

  // === LISTA DE ALERTAS ===
  alertItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },

  // Contenedor del ícono emoji
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: colors.cardSecondary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  icon: {
    fontSize: 18,
  },

  // Contenedor de información de la alerta
  textContainer: {
    flex: 1,
    justifyContent: "center",
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textPrimary,
    marginBottom: 2,
  },
  alertMessage: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
});