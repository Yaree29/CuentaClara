import { StyleSheet } from 'react-native';
import colors from '../../../theme/colors';

export default StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 32,
    backgroundColor: colors.background, // Integra el fondo general gris/beige suave (#F5F5F0)
  },

  closeButton: {
    position: 'absolute',
    top: 48,
    right: 20,
    zIndex: 10,
    backgroundColor: colors.borderLight, // Fondo sutil para el botón de cierre
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },

  closeText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },

  title: {
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '800',
    color: colors.textPrimary,
    marginTop: 48,
    marginBottom: 28,
    letterSpacing: -0.4,
  },

  input: {
    backgroundColor: colors.inputBackground, // Blanco puro (#FFFFFF) para contrastar con el fondo
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    fontSize: 15,
    color: colors.textPrimary,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    // Sombra muy ligera para dar sensación de profundidad al escribir
    shadowColor: colors.shadowCard,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },

  button: {
    backgroundColor: colors.buttonPrimary, // #0F2747 (Azul oscuro principal de tu sistema)
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    // Sombra para destacar el botón principal
    shadowColor: colors.shadowCard,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },

  buttonText: {
    color: colors.buttonPrimaryText, // Texto blanco (#FFFFFF)
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});