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
    // 24 no alcanzaba a despejar el tab bar (height:72 en MainNavigator.jsx)
    // en Modo Asistente, donde esta pantalla vive como tab (assistantInventory)
    // — botones quedaban tapados. 120 es la convención ya usada en el resto
    // de pantallas PYME bajo el tab bar (salesPyme.style.js, closeDay.style.js).
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
  summaryRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  summaryLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
  },
  summaryValue: {
    color: colors.primary,
    fontSize: 24,
    fontWeight: '900',
    marginTop: 6,
  },
  loadingContainer: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  flagsSection: {
    marginBottom: 16,
  },
  flagsSectionTitle: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  flagCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 10,
  },
  flagCardTitle: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '800',
  },
  flagCardDescription: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 3,
    lineHeight: 17,
  },

  /* ===================== Sección genérica con header (título + acción) ===================== */
  sectionBlock: {
    marginBottom: 16,
  },
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  sectionActionText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 13,
    paddingVertical: 8,
  },

  /* ===================== Lista de productos (CRUD) ===================== */
  productListCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 8,
  },
  productListInfo: {
    flex: 1,
    paddingRight: 8,
  },
  productListName: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
  productListMeta: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  editIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.cardSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* ===================== FAB "+ Agregar Producto" (mismo patrón que InformalInventory) ===================== */
  fabContainer: {
    position: 'absolute',
    bottom: 24,
    right: 20,
  },
  fabButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.shadowCard,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },

  /* ===================== Mermas — acceso funcional (reemplaza el placeholder) ===================== */
  actionCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  actionCardText: {
    flex: 1,
    paddingRight: 12,
  },
  actionCardTitle: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '800',
  },
  actionCardDescription: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 3,
    lineHeight: 17,
  },
  actionCardButton: {
    backgroundColor: colors.danger + '15',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  actionCardButtonText: {
    color: colors.danger,
    fontSize: 12,
    fontWeight: '800',
  },

  /* ===================== Caducidad — "Productos por vencer" (reemplaza el placeholder) ===================== */
  expiringCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  expiringRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  expiringRowLast: {
    borderBottomWidth: 0,
    paddingBottom: 0,
  },
  expiringName: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '700',
  },
  expiringDate: {
    fontSize: 12,
    fontWeight: '700',
  },
  expiringDateWarning: {
    color: colors.warning,
  },
  expiringDateDanger: {
    color: colors.danger,
  },

  /* ===================== Modal "Registrar Merma" — mismo patrón bottom-sheet que ProductFormModal ===================== */
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 16,
  },
  modalCloseText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  formGroup: {
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 6,
  },
  formInput: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    height: 48,
    color: colors.textPrimary,
  },
  inputError: {
    borderColor: colors.danger,
    borderWidth: 1.5,
    backgroundColor: colors.danger + '08',
  },
  errorText: {
    color: colors.danger,
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
  },
  productChipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  productChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  productChipActive: {
    borderColor: colors.danger,
    backgroundColor: colors.danger + '15',
  },
  productChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  productChipTextActive: {
    color: colors.danger,
  },
  saveBtn: {
    backgroundColor: colors.danger,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  saveBtnDisabled: {
    opacity: 0.5,
  },
  saveBtnText: {
    color: colors.textButton,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
