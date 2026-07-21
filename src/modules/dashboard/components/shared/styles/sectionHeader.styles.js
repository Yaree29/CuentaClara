import { StyleSheet } from "react-native";
import colors from "../../../../../theme/colors"; // Ajusta la ruta a tu archivo de colores

export default StyleSheet.create({
  // === CONTENEDOR PRINCIPAL ===
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  // Espaciado inferior condicional
  marginBottom: {
    marginBottom: 12,
  },

  // === SECCIÓN IZQUIERDA (ÍCONO + TEXTOS) ===
  leftContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    marginRight: 10,
    justifyContent: "center",
    alignItems: "center",
  },

  // === TEXTOS ===
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.sectionTitle,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },

  // === ACCIÓN / BOTÓN DERECHO ===
  action: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textLink,
    marginLeft: 12,
  },
});