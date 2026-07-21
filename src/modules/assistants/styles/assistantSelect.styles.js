import { StyleSheet, Platform } from 'react-native';
import colors from '../../../theme/colors';

const shadowStyle = Platform.select({
  ios: {
    shadowColor: colors.shadowCard,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
  },
  android: {
    elevation: 3,
  },
});

export default StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  exitLinkButton: {
    flexDirection: 'row',
    alignSelf: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 28,
    marginBottom: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  exitLinkText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 48,
    flexGrow: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
  },

  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  emptyText: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 21,
  },

  /* ===================== Tarjetas grandes de asistente ===================== */
  card: {
    backgroundColor: colors.card,
    borderRadius: 20,
    paddingVertical: 24,
    paddingHorizontal: 20,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    ...shadowStyle,
  },
  cardAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  cardAvatarText: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.textButton,
  },
  cardTextContainer: {
    flex: 1,
  },
  cardName: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  cardAccess: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },

  /* ===================== Modal de PIN ===================== */
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalContent: {
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 28,
    width: '100%',
    maxWidth: 420,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 24,
  },

  pinDotsRow: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 24,
  },
  pinDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  pinDotFilled: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  pinDotError: {
    backgroundColor: colors.danger,
    borderColor: colors.danger,
  },

  errorText: {
    fontSize: 13,
    color: colors.danger,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },

  keypad: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  keypadKey: {
    width: '30%',
    aspectRatio: 1.5,
    margin: '1.5%',
    borderRadius: 14,
    backgroundColor: colors.cardSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keypadKeyDisabled: {
    opacity: 0.4,
  },
  keypadKeyText: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
  },

  cancelLink: {
    marginTop: 20,
  },
  cancelLinkText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },

  verifyingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 24,
  },
});
