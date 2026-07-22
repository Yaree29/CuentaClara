import { StyleSheet } from 'react-native';
import colors from '../../../theme/colors';

export default StyleSheet.create({
  /* ===================== Contenedor de pantalla (hub y modal de formulario) ===================== */
  // Mismo estándar de scroll bajo el tab bar que el resto de PYME (Dashboard,
  // Recetas): paddingBottom 120 para que el último bloque no quede tapado.

  hubScreen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  hubContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 120,
  },
  formContent: {
    paddingBottom: 24,
  },

  section: {
    marginBottom: 24,
  },
  label: {
    paddingLeft: 10,
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
  },
  rowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  addText: {
    paddingRight: 10,
    textAlign: 'center',
    color: colors.primary,
    fontWeight: 'bold',
  },
  errorText: {
    color: colors.danger,
    fontSize: 13,
    paddingHorizontal: 10,
    marginBottom: 8,
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 13,
    paddingHorizontal: 10,
    marginBottom: 8,
  },
  inventoryList: {
    gap: 8,
  },
  inventoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
  },
  inventoryName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  inventoryMeta: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  itemRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  mainButton: {
    backgroundColor: colors.primary,
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 30,
  },
  disabledButton: {
    backgroundColor: colors.disabledButton,
  },
  mainButtonText: {
    color: colors.textButton,
    fontSize: 16,
    fontWeight: 'bold',
  },

  /* =====================================================================
     Hub de MiRUC — mismo lenguaje visual que el Dashboard PYME rediseñado:
     tarjeta hero oscura (colors.primary, radio16, sombra colors.shadowCard)
     para la acción principal + grid de tarjetas blancas estilo Acciones
     Rápidas (colors.quickButtonBackground/Border, iconContainer circular
     colors.salesBadgeBackground) para los accesos secundarios.
     ===================================================================== */
  heroCta: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: colors.shadowCard,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  heroCtaIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  heroCtaText: {
    flex: 1,
  },
  heroCtaTitle: {
    color: colors.textWhite,
    fontSize: 17,
    fontWeight: 'bold',
  },
  heroCtaSubtitle: {
    color: colors.secondary,
    fontSize: 13,
    marginTop: 2,
  },

  actionsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  actionTile: {
    flex: 1,
    backgroundColor: colors.quickButtonBackground,
    borderWidth: 1,
    borderColor: colors.quickButtonBorder,
    borderRadius: 14,
    padding: 14,
  },
  actionIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.salesBadgeBackground,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  actionTileTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  actionTileSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },

  disclaimerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    paddingHorizontal: 4,
  },
  disclaimerText: {
    flex: 1,
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 17,
  },

  /* =====================================================================
     Modal de formulario (Generar Comprobante) — mismo patrón ya usado en
     Informal para el comprobante de venta (salesInformal.jsx: Modal
     transparent + animationType="fade", styles.modalOverlay/noteModal en
     salesInformal.style.js): overlay centrado (no un modal top-anchored a
     pantalla completa) con tarjeta de esquinas redondeadas en las 4
     puntas — no un bottom sheet ni un slide-desde-arriba nuevo.
     ===================================================================== */
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 500,
    maxHeight: '85%',
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalHeaderTitle: {
    color: colors.primary,
    fontSize: 20,
    fontWeight: '700',
  },
  modalCloseIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseIconText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textSecondary,
  },

  /* ===================== Estilos antes inline en BillingScreen.jsx ===================== */
  customerNameFlex: {
    flex: 1,
  },
  inputSpaced: {
    marginBottom: 8,
  },
  itemInputDesc: {
    flex: 2,
  },
  itemInputPrice: {
    flex: 1,
    marginLeft: 10,
  },
  itemInputQuantity: {
    flex: 0.7,
    marginLeft: 10,
  },
  removeItemDisabled: {
    opacity: 0.5,
  },
  inlineLoader: {
    marginVertical: 10,
  },
});
