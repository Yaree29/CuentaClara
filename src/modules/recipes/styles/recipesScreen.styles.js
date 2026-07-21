import { StyleSheet } from 'react-native';
import colors from '../../../theme/colors';

export default StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 12,
    // 120: estándar del proyecto para que el contenido no quede tapado por
    // el tab bar (height:72 en MainNavigator.jsx) sin importar cuánto crezca.
    paddingBottom: 120,
  },
  hero: {
    backgroundColor: colors.card,
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
  },
  heroKicker: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  heroTitle: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: '900',
    marginTop: 6,
    lineHeight: 26,
  },
  heroSubtitle: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 8,
    lineHeight: 19,
  },
  section: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionHeaderText: { flex: 1, paddingRight: 8 },
  sectionKicker: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 17,
    fontWeight: '800',
    marginTop: 2,
  },
  sectionSubtitle: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 3,
  },
  addButton: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  addButtonText: {
    color: colors.textWhite,
    fontSize: 12,
    fontWeight: '800',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  rowLast: {
    borderBottomWidth: 0,
    paddingBottom: 0,
  },
  rowLeft: {
    flex: 1,
    paddingRight: 12,
  },
  rowName: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '800',
  },
  rowMeta: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  rowValue: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '900',
  },
  rowValueMuted: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
  },
  editButton: {
    backgroundColor: colors.primary + '15',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  editButtonText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  dangerButton: {
    backgroundColor: colors.danger + '15',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  dangerButtonText: {
    color: colors.danger,
    fontSize: 12,
    fontWeight: '700',
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: 13,
    textAlign: 'center',
    paddingVertical: 12,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  primaryButtonDisabled: {
    backgroundColor: colors.disabledButton,
  },
  primaryButtonText: {
    color: colors.textWhite,
    fontSize: 14,
    fontWeight: '800',
  },
  secondaryButton: {
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  secondaryButtonText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '700',
  },

  /* ===================== Tarjeta de receta ===================== */
  recipeCard: {
    backgroundColor: colors.cardSecondary,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  recipeCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  recipeCardTitle: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '800',
  },
  recipeCardSubtitle: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  recipeCardCost: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '900',
    textAlign: 'right',
  },
  recipeCardCostLabel: {
    color: colors.textMuted,
    fontSize: 11,
    textAlign: 'right',
  },

  /* ===================== Chips / selector de producto ===================== */
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  chipActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '15',
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  chipTextActive: {
    color: colors.primary,
  },

  /* ===================== Ingredientes en el formulario ===================== */
  ingredientCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  ingredientCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  ingredientBadge: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.primary,
  },
  removeText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.danger,
  },
  quantityRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  quantityField: { flex: 1.4 },
  unitField: { flex: 1 },

  /* ===================== Modal ===================== */
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
  fullScreenModal: {
    flex: 1,
    backgroundColor: colors.background,
  },
  fullScreenHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  fullScreenTitle: {
    color: colors.textPrimary,
    fontSize: 19,
    fontWeight: '900',
  },
  closeText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '700',
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
    backgroundColor: colors.primary,
  },
  modalButtonDisabled: {
    backgroundColor: colors.disabledButton,
  },
  modalButtonSecondary: {
    backgroundColor: colors.buttonSecondary,
  },
  modalButtonTextPrimary: {
    color: colors.textButton,
    fontSize: 15,
    fontWeight: '600',
  },
  modalButtonTextSecondary: {
    color: colors.buttonSecondaryText,
    fontSize: 15,
    fontWeight: '700',
  },
  errorText: {
    fontSize: 12,
    color: colors.danger,
    marginTop: 8,
  },

  /* ===================== Rentabilidad ===================== */
  profitCard: {
    backgroundColor: colors.successLight,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.success,
  },
  profitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  profitLabel: {
    color: colors.textSuccess,
    fontSize: 13,
  },
  profitValue: {
    color: colors.textSuccess,
    fontSize: 13,
    fontWeight: '800',
  },
  limitationText: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 8,
    fontStyle: 'italic',
    lineHeight: 17,
  },
});
