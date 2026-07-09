import { StyleSheet } from 'react-native';
import colors from '../../../theme/colors';

export default StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
  },
  logo: {
    width: 96,
    height: 96,
    resizeMode: 'contain',
    marginBottom: 8,
  },
  brandTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 24,
    textAlign: 'center',
  },
  form: {
    width: '100%',
    gap: 16,
  },
  input: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    borderRadius: 10,
    fontSize: 16,
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
    marginBottom: 8,
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
    marginTop: -4,
  },
  forgotPasswordText: {
    color: colors.textLink,
    fontSize: 14,
    fontWeight: '600',
  },
  button: {
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    backgroundColor: colors.disabledButton,
  },
  buttonText: {
    color: colors.textButton,
    fontSize: 16,
    fontWeight: '600',
  },
  biometricSection: {
    marginTop: 8,
    alignItems: 'center',
  },
  helloText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  biometricButton: {
    width: '100%',
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.primary,
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  biometricButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    color: colors.textError,
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
  },
  registerLink: {
    marginTop: 24,
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
