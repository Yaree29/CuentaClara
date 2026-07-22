import { StyleSheet } from 'react-native';
import colors from '../../../theme/colors';

export default StyleSheet.create({
  container: {
    width: '100%',
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 6,
  },
  form: {
    width: '100%',
    gap: 18,
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
  // Contenedor del campo de contraseña: relativo para poder anclar el ícono
  // de mostrar/ocultar a la derecha, superpuesto sobre el TextInput.
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
  forgotPasswordLink: {
    alignSelf: 'flex-end',
    marginTop: -6,
  },
  forgotPasswordText: {
    color: colors.textLink,
    fontSize: 13,
    fontWeight: '600',
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 28,
    alignItems: 'center',
    marginTop: 4,
  },
  buttonDisabled: {
    backgroundColor: colors.disabledButton,
  },
  buttonText: {
    color: colors.textButton,
    fontSize: 16,
    fontWeight: '700',
  },
  biometricSection: {
    marginTop: 4,
    alignItems: 'center',
  },
  helloText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  biometricButton: {
    width: '100%',
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 28,
    alignItems: 'center',
  },
  biometricButtonText: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '700',
  },
  errorText: {
    color: colors.textError,
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
  },
  registerLink: {
    marginTop: 28,
    alignItems: 'center',
  },
  registerLinkText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  registerLinkTextBold: {
    color: colors.textLink,
    fontWeight: '700',
  },
});
