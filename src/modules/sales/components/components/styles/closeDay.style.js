import { StyleSheet, Platform } from 'react-native';
import colors from '../../../../../theme/colors';

const shadowStyle = Platform.select({
  ios: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
  },
  android: {
    elevation: 2,
  },
});

export default StyleSheet.create({
  content: {
    padding: 16,
    paddingBottom: 120,
    backgroundColor: colors.background,
  },

  productsSectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 16,
    letterSpacing: -0.2,
  },

  generalRegisterCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadowStyle,
  },

  generalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 6,
    marginTop: 8,
  },

  generalInput: {
    height: 50,
    backgroundColor: colors.background,
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 16,
  },

  // Estilos faltantes para los campos de solo lectura en tu JSX
  readOnlyInput: {
    height: 50,
    backgroundColor: colors.border, // Un tono ligeramente gris/deshabilitado para contrastar
    borderRadius: 12,
    paddingHorizontal: 16,
    justifyContent: 'center',
    marginBottom: 16,
    opacity: 0.8,
  },

  readOnlyValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },

  saveButton: {
    backgroundColor: colors.primary,
    height: 54,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    ...shadowStyle,
  },

  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});