import { StyleSheet } from 'react-native';
import  colors  from '../../../theme/colors';

export default StyleSheet.create({
  container: {
    width: '100%',
    paddingBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 6,
  },
  form: {
    gap: 16,
  },
  input: {
    backgroundColor: colors.cardSecondary,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    fontSize: 15,
    color: colors.textPrimary,
  },
  inputError: {
    borderColor: colors.textError,
    borderWidth: 2,
  },
  // Contenedor del campo de contraseña: relativo para anclar el ícono de
  // mostrar/ocultar a la derecha, superpuesto sobre el TextInput.
  passwordWrapper: {
    position: 'relative',
    justifyContent: 'center',
  },
  passwordInput: {
    paddingRight: 48, // espacio para que el texto no quede debajo del ícono
  },
  eyeButton: {
    position: 'absolute',
    right: 8,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  errorMessage: {
    color: colors.textError,
    fontSize: 12,
    marginTop: 4,
  },
  helperText: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 4,
    marginBottom: 8,
  },
  strongPassword: {
    color: '#10b981',
    fontWeight: '600',
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 28,
    alignItems: 'center',
    marginTop: 4,
  },
  buttonText: {
    color: colors.textButton,
    fontSize: 16,
    fontWeight: '700',
  },
  buttonOutline: {
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 28,
    alignItems: 'center',
    marginTop: 4,
  },
  buttonOutlineText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '700',
  },
  link: {
    marginTop: 24,
    alignItems: 'center',
  },
  linkText: {
    color: colors.textLink,
    fontSize: 14,
    fontWeight: '600',
  },
  sectionCard: {
    backgroundColor: colors.cardSecondary,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 4,
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  rowLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    flex: 1,
    paddingRight: 8,
  },
  smallBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    minWidth: 50,
    alignItems: 'center',
    backgroundColor: colors.card,
  },
  smallBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  smallBtnText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: 'bold',
  },
  smallBtnTextActive: {
    color: colors.textButton,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  dropdownList: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    marginTop: -8,
    overflow: 'hidden',
    backgroundColor: colors.card,
  },
  dropdownItem: {
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
});
