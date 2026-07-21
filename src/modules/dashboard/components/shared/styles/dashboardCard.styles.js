import { StyleSheet, Platform } from "react-native";
import colors from "../../../../../theme/colors"; // Ajusta la ruta a tu archivo de colores

export default StyleSheet.create({
  // === CONTENEDOR BASE ===
  container: {
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 0, // El espaciado ahora lo maneja el 'gap' del 'summaryGrid'
    overflow: "hidden",

    // Sombra sutil para iOS y Android
    ...Platform.select({
      ios: {
        shadowColor: colors.shadowCard,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },

  // Modificador para abarcar el ancho completo
  fullWidth: {
    marginHorizontal: 0,
    borderRadius: 0,
    borderLeftWidth: 0,
    borderRightWidth: 0,
  },

  // === VARIANTES DE TARJETA ===
  default: {
    borderColor: colors.border,
  },
  warning: {
    borderColor: colors.warning,
    borderTopWidth: 3, // Resalta la tarjeta con una barra superior de advertencia
  },
  danger: {
    borderColor: colors.danger,
    borderTopWidth: 3,
  },
  success: {
    borderColor: colors.success,
    borderTopWidth: 3,
  },
  info: {
    borderColor: colors.info,
    borderTopWidth: 3,
  },

  // === ENCABEZADO (HEADER) ===
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    marginRight: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  action: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textLink,
    marginLeft: 10,
  },
  textContainer: {
    flex: 1,
  },

  // === CONTENIDO ===
  content: {
    padding: 16,
  },
  noPadding: {
    padding: 0,
  },
});