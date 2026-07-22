import { StyleSheet } from 'react-native';
import colors from '../../../theme/colors';

export default StyleSheet.create({
  widget: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  kicker: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '800',
    marginTop: 2,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 3,
    lineHeight: 18,
  },
  inputLabel: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    backgroundColor: colors.backgroundSecondary,
    color: colors.textPrimary,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
  },
  manualRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  manualInput: {
    flex: 1,
  },
  searchIconButton: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  scanButton: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 0,
  },
  buttonDisabled: {
    backgroundColor: colors.disabledButton,
  },
  buttonText: {
    color: colors.textWhite,
    fontSize: 14,
    fontWeight: '800',
  },
  resultCard: {
    marginTop: 16,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: 14,
  },
  resultLabel: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  resultName: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '800',
    marginTop: 4,
  },
  resultMeta: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 3,
  },
  resultStock: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '700',
    marginTop: 8,
  },
});
