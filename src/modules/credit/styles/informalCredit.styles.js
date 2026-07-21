import { StyleSheet } from 'react-native';
import colors from '../../../theme/colors';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  /* --- Cabecera y Buscador --- */
  headerWrapper: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },

  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    borderWidth: 1,
    borderColor: colors.border,
  },

  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 15,
    color: colors.textPrimary,
  },

  /* --- Categorías de Ordenamiento --- */
  categoryScroll: {
    marginTop: 10,
    marginBottom: 8,
  },

  categoryScrollContent: {
    gap: 8,
    paddingRight: 16,
  },

  categoryPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },

  categoryPillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },

  categoryPillText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },

  categoryPillTextActive: {
    color: colors.textButton,
  },

  /* --- Resumen rápido --- */
  summaryBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: colors.primary + '08',
  },

  summaryText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '600',
  },

  summaryTotal: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '700',
  },

  /* --- Lista de Fiados --- */
  listContainer: {
    padding: 16,
    paddingBottom: 100,
  },

  /* --- Empty state --- */
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },

  emptyStateTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 12,
  },

  emptyStateText: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 4,
  },

  /* --- Tarjeta de Crédito --- */
  creditCard: {
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.shadowCard,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },

  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },

  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },

  avatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textButton,
  },

  cardHeaderInfo: {
    flex: 1,
  },

  clientName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 3,
  },

  /* --- Status Badge --- */
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },

  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },

  /* --- Menú tres puntos --- */
  menuBtn: {
    padding: 4,
  },

  menuOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 99,
  },

  contextMenu: {
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 6,
    marginBottom: 8,
    shadowColor: colors.shadowCard,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    zIndex: 100,
  },

  contextMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    gap: 10,
  },

  contextMenuText: {
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: '500',
  },

  /* --- Items text --- */
  itemsText: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 8,
    lineHeight: 18,
  },

  /* --- Note preview --- */
  notePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.background,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 10,
  },

  notePreviewText: {
    fontSize: 12,
    color: colors.textMuted,
    flex: 1,
    fontStyle: 'italic',
  },

  /* --- Deuda info row --- */
  debtInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 6,
  },

  debtLabel: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '500',
  },

  debtAmount: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.danger,
  },

  paidInfo: {
    alignItems: 'flex-end',
  },

  paidLabel: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '500',
  },

  paidAmount: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.success,
  },

  /* --- Progress bar --- */
  progressBarContainer: {
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    marginTop: 4,
    overflow: 'hidden',
  },

  progressBar: {
    height: 4,
    backgroundColor: colors.success,
    borderRadius: 2,
  },

  /* --- Botón Flotante (FAB) --- */
  fabContainer: {
    position: 'absolute',
    bottom: 20,
    right: 16,
  },

  fabButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },

  /* --- Modales Comunes --- */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },

  modalContent: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
  },

  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },

  formGroup: { marginBottom: 16 },

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

  primaryBtn: {
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'center',
  },

  primaryBtnText: {
    color: colors.textButton,
    fontSize: 16,
    fontWeight: 'bold',
  },

  /* --- Píldoras de Productos (Selector) --- */
  quickAddScroll: { marginVertical: 8, maxHeight: 35 },
  quickAddPill: {
    backgroundColor: colors.primary + '15',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.primary + '30',
  },
  quickAddPillText: { fontSize: 12, color: colors.primary, fontWeight: '600' },

  /* --- Ajuste de Phone Input --- */
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    height: 48,
  },
  phonePrefix: { fontSize: 15, color: colors.textSecondary, fontWeight: '600', marginRight: 4 },
  phoneInput: { flex: 1, fontSize: 15, color: colors.textPrimary },

  /* --- Modal de Pago: Info del cliente --- */
  paymentClientInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
  },

  paymentAvatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },

  paymentAvatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textButton,
  },

  paymentClientName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },

  paymentDebtLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },

  /* --- Modal de Detalle --- */
  detailClientSection: {
    alignItems: 'center',
    marginBottom: 20,
  },

  detailAvatarCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },

  detailAvatarText: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textButton,
  },

  detailClientName: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary,
  },

  detailPhone: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 4,
  },

  detailFinanceRow: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
  },

  detailFinanceItem: {
    flex: 1,
    alignItems: 'center',
  },

  detailFinanceDivider: {
    width: 1,
    height: 30,
    backgroundColor: colors.border,
  },

  detailFinanceLabel: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '600',
    marginBottom: 4,
  },

  detailFinanceValue: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
  },

  detailSection: {
    marginBottom: 16,
  },

  detailSectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textSecondary,
    marginBottom: 8,
  },

  detailItemsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  detailItemPill: {
    backgroundColor: colors.primary + '10',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.primary + '20',
  },

  detailItemText: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '600',
  },

  detailNoteText: {
    fontSize: 14,
    color: colors.textPrimary,
    lineHeight: 20,
    fontStyle: 'italic',
    backgroundColor: colors.background,
    padding: 12,
    borderRadius: 10,
  },

  detailEmptyPayments: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    paddingVertical: 16,
    fontStyle: 'italic',
  },

  detailPaymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },

  detailPaymentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  detailPaymentAmount: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },

  detailPaymentMethod: {
    fontSize: 12,
    color: colors.textMuted,
  },

  detailPaymentDate: {
    fontSize: 12,
    color: colors.textSecondary,
  },

  /* --- Modal de Nota --- */
  noteClientLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 12,
  },
});
