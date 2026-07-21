import { StyleSheet, Platform } from 'react-native';
import colors from '../../../../../theme/colors';

const shadowStyle = Platform.select({
  ios: {
    shadowColor: colors.shadowCard,
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
    color: colors.textButton,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  loadingContainer: {
    paddingVertical: 60,
    alignItems: 'center',
  },

  // === Estado de la caja (abierta) ===
  sessionCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadowStyle,
  },
  sessionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  sessionRowLast: {
    borderBottomWidth: 0,
  },
  sessionLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  sessionValue: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },

  // === Lista de gastos de la sesión ===
  expenseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  expenseItemLast: {
    borderBottomWidth: 0,
  },
  expenseItemDescription: {
    fontSize: 14,
    color: colors.textPrimary,
    flex: 1,
    paddingRight: 8,
  },
  expenseItemAmount: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.danger,
  },
  emptyText: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingVertical: 12,
  },

  secondaryButton: {
    borderRadius: 14,
    height: 54,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  secondaryButtonText: {
    color: colors.textSecondary,
    fontSize: 15,
    fontWeight: '700',
  },
  dangerButton: {
    backgroundColor: colors.danger,
  },
  dangerButtonText: {
    color: colors.textButton,
  },

  // === Modal de cierre de caja ===
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
    maxWidth: 420,
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
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  resultLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  resultValue: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  differenceValuePositive: {
    color: colors.success,
  },
  differenceValueNegative: {
    color: colors.danger,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
});