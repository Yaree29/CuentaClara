// Archivo: accounting.styles.js
import { StyleSheet, Platform } from 'react-native';
import colors from '../../../../../theme/colors';

const shadowStyle = Platform.select({
  ios: {
    shadowColor: colors.shadowCard,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
  },
  android: {
    elevation: 2,
  },
});

export default StyleSheet.create({
  content: {
    padding: 16,
    paddingBottom: 150,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 16,
    marginTop: 10,
    letterSpacing: -0.3,
  },

  /* =====================
      TARJETAS DE USUARIO
  ===================== */
  userCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadowStyle,
  },

  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: 12,
  },

  userName: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textPrimary,
  },

  userRole: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textSecondary,
    marginTop: 2,
  },

  userMoney: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
  },

  userStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },

  userInfoText: {
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: '500',
  },

  viewMoreText: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '600',
  },

  /* =====================
      MODAL DE DETALLES
  ===================== */
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    maxWidth: 500,
  },

  modalContent: {
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 500,
    maxHeight: '80%',
  },

  modalTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 16,
    letterSpacing: -0.2,
  },

  modalScroll: {
    marginBottom: 20,
  },

  emptyContainer: {
    paddingVertical: 32,
    alignItems: 'center',
  },

  emptyText: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
  },

  /* =====================
      TARJETAS DE VENTA (DENTRO DEL MODAL)
  ===================== */
  saleCard: {
    backgroundColor: colors.background,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },

  saleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: 8,
    marginBottom: 8,
  },

  saleId: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },

  saleTotal: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.success,
  },

  saleProductsList: {
    gap: 4,
  },

  productItem: {
    fontSize: 14,
    color: colors.textPrimary,
  },

  productQty: {
    fontWeight: '600',
    color: colors.textSecondary,
  },

  /* =====================
      BOTÓN DE ACCIÓN
  ===================== */
  closeButton: {
    backgroundColor: colors.primary,
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadowStyle,
  },

  closeButtonText: {
    color: colors.textButton,
    fontSize: 16,
    fontWeight: '700',
  },
});