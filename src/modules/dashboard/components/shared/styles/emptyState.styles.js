import { StyleSheet } from "react-native";
import colors from "../../../../../theme/colors"; // Ajusta la ruta según tu estructura de carpetas

export default StyleSheet.create({
  // === CONTENEDOR PRINCIPAL ===
  container: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 32,
    paddingHorizontal: 24,
  },

  // === ÍCONO ===
  icon: {
    fontSize: 48,
    marginBottom: 12,
    textAlign: "center",
  },

  // === TEXTOS ===
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textPrimary,
    textAlign: "center",
    marginBottom: 6,
  },
  message: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 20,
    maxWidth: 280, // Evita que los mensajes largos se expandan demasiado horizontalmente
  },

  // === BOTÓN DE ACCIÓN ===
  button: {
    marginTop: 20,
    backgroundColor: colors.buttonPrimary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.buttonPrimaryText,
  },
});