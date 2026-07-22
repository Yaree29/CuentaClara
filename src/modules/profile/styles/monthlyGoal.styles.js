import { StyleSheet } from 'react-native';
import colors from '../../../theme/colors';

export default StyleSheet.create({
  hint: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
    marginBottom: 14,
  },

  // Prefijo de moneda pegado al campo, para que quede claro que es un importe
  // aunque el input solo acepte dígitos.
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.inputBackground,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: 12,
    paddingHorizontal: 14,
  },
  currencyPrefix: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textSecondary,
    marginRight: 6,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
  },

  note: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 10,
  },

  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonDisabled: {
    backgroundColor: colors.disabledButton,
  },
  saveButtonText: {
    color: colors.textWhite,
    fontSize: 15,
    fontWeight: '700',
  },

  removeButton: {
    alignItems: 'center',
    paddingVertical: 14,
    marginTop: 4,
  },
  removeButtonText: {
    color: colors.danger,
    fontSize: 14,
    fontWeight: '700',
  },
});
