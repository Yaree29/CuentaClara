import { StyleSheet } from "react-native";
import colors from "../../../../../theme/colors"; // Ajusta la ruta a tu archivo de colores

export default StyleSheet.create({
  // === CONTENEDOR BASE (RIEL) ===
  container: {
    width: "100%",
    backgroundColor: colors.borderLight, // Fondo suave para el riel
    borderRadius: 999, // Bordes completamente redondeados (pill style)
    overflow: "hidden",
  },

  // === RELLENO GENERAL ===
  fill: {
    height: "100%",
    borderRadius: 999,
  },

  // === VARIANTES DE ESTADO (STATUS) ===
  normal: {
    backgroundColor: colors.primary, // Color institucional principal
  },
  success: {
    backgroundColor: colors.success, // Meta completada / estado positivo
  },
  warning: {
    backgroundColor: colors.warning, // Cerca del límite o alerta
  },
  danger: {
    backgroundColor: colors.danger, // Desviación grave o peligro
  },
  info: {
    backgroundColor: colors.info, // Informativo / secundario
  },
});