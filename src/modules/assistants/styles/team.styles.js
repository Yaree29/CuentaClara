import { StyleSheet } from 'react-native';
import colors from '../../../theme/colors';

export default StyleSheet.create({
  banner: {
    marginHorizontal: 16,
    marginTop: 16,
    padding: 14,
    borderRadius: 12,
    backgroundColor: colors.warning + '15',
    borderWidth: 1,
    borderColor: colors.warning + '40',
  },
  bannerText: {
    fontSize: 12,
    color: colors.textPrimary,
    lineHeight: 17,
  },

  addButton: {
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonDisabled: {
    backgroundColor: colors.disabledButton,
  },
  addButtonText: {
    color: colors.textButton,
    fontSize: 15,
    fontWeight: '700',
  },

  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },

  badge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
    marginRight: 8,
  },
  badgeActive: {
    backgroundColor: colors.successLight,
  },
  badgeBlocked: {
    backgroundColor: colors.danger + '15',
  },
  badgeTextActive: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.successDark,
  },
  badgeTextBlocked: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.danger,
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  /* ===================== Selector de tipo de acceso ===================== */
  segmentedControl: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
    marginBottom: 4,
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentButtonActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10',
  },
  segmentButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  segmentButtonTextActive: {
    color: colors.primary,
  },

  /* ===================== Formularios / modales ===================== */
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 500,
    maxHeight: '85%',
  },
  modalTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 16,
    lineHeight: 18,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 6,
    marginTop: 14,
  },
  textInput: {
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.textPrimary,
    backgroundColor: colors.inputBackground,
  },

  summaryBox: {
    backgroundColor: colors.cardSecondary,
    borderRadius: 12,
    padding: 14,
    marginTop: 18,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
  },

  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: colors.border,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkboxLabel: {
    flex: 1,
    fontSize: 13,
    color: colors.textPrimary,
  },

  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 22,
  },
  modalButton: {
    flex: 1,
    height: 50,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalButtonPrimary: {
    textAlign: 'center',
    backgroundColor: colors.primary,
    flexDirection: 'row',     
    alignItems: 'center',     
    justifyContent: 'center', 
    gap: 8,
  },
  modalButtonDisabled: {
    backgroundColor: colors.disabledButton,
  },
  modalButtonSecondary: {
    backgroundColor: colors.buttonSecondary,
  },
  modalButtonDanger: {
    backgroundColor: colors.danger + '15',
  },
  modalButtonTextPrimary: {
    color: colors.textButton,
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
buttonIcon: {
  marginRight: 8,
},
  modalButtonTextSecondary: {
    color: colors.buttonSecondaryText,
    fontSize: 15,
    fontWeight: '700',
  },
  modalButtonTextDanger: {
    color: colors.danger,
    fontSize: 15,
    fontWeight: '700',
  },

  /* ===================== PIN generado ===================== */
  pinDisplay: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 20,
    alignItems: 'center',
    marginTop: 14,
  },
  pinDigits: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.textButton,
    letterSpacing: 8,
  },
  pinHint: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 12,
    lineHeight: 17,
  },

  linkText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
    textAlign: 'center',
    marginTop: 16,
  },

  errorText: {
    fontSize: 12,
    color: colors.danger,
    marginTop: 6,
  },
});
