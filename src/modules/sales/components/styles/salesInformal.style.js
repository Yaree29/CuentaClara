import { StyleSheet } from 'react-native';
import colors from '../../../../theme/colors';

export default StyleSheet.create({
  /* =========================
     HEADER
  ========================== */
  header: {
    height: 100,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.tabBorder,
    backgroundColor: colors.card,
  },

  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
    textAlign: 'center',
  },

 /* =========================
     Foto de perfl
  ========================== */
  headerDocButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#10445c',
    justifyContent: 'center',
    alignItems: 'center',
  },

  docIcon: {
    width: 14,
    height: 18,
    backgroundColor: colors.card,
    borderRadius: 2,
  },

  /* =========================
     CONTAINER
  ========================== */

  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  content: {
    padding: 16,
    // 120: estándar del proyecto para que el contenido no quede tapado por
    // el tab bar.
    paddingBottom: 120,
  },

  /* =========================
     TABS / Navegacion entre secciones
  ========================== */

  tabsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.border,
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
    marginTop: 10,
    marginHorizontal: 16,
  },

  tab: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },

  tabActive: {
    backgroundColor: colors.primary,
  },

  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },

  tabTextActive: {
    color: colors.textTertiary,
  },

  /* =========================
     DISPLAY CARD
  ========================== */

  displayCard: {
    backgroundColor: colors.card,

    borderRadius: 18,

    paddingTop: 10,
    paddingBottom: 14,
    zIndex: 20,


    alignItems: 'center',

    borderWidth: 1,
    borderColor: colors.border,

    marginBottom: 10,
    marginHorizontal: 16,

    shadowColor: colors.shadowCard,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 6,

    elevation: 4,
  },

  displayLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  totalRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginVertical: 8,
  },

  currency: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.primary,
    marginRight: 4,
  },

  displayValue: {
    fontSize: 46,
    fontWeight: 'bold',
    color: colors.primary,
  },

  badge: {
    backgroundColor: colors.salesBadgeBackground,
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },

  badgeIcon: {
    fontSize: 14,
    marginRight: 6,
  },

  badgeText: {
    color: colors.textSecondary,
    fontWeight: '500',
    fontSize: 13,
  },

  /* =========================
     QUICK GRID/ PRODUCTOS
  ========================== */

  quickGrid: {
    maxHeight: 340,

    backgroundColor: colors.card,

    borderWidth: 1,
    borderColor: colors.border,

    borderRadius: 18,

    padding: 12,

    marginBottom: 10,

    shadowColor: colors.shadowCard,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 4,

    elevation: 3,
  },

  amountBtn: {
    backgroundColor: colors.card,
    width: '31%',
    aspectRatio: 1.35,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },

  amountBtnText: {
    fontSize: 34,
    fontWeight: 'bold',
    color: colors.primary,
  },

  amountSubtext: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },

  emptyProducts: {
    backgroundColor: colors.card,
    borderRadius: 14,
    paddingVertical: 24,
    alignItems: 'center',
    width: '100%',
    borderWidth: 1,
    borderColor: colors.border,
  },

  emptyProductsText: {
    color: colors.textSecondary,
    fontSize: 14,
  },

  selectedProductCard: {
    backgroundColor: colors.card,
    width: '100%',
    borderRadius: 14,

    paddingHorizontal: 14,
    paddingVertical: 12,

    marginBottom: 10,

    borderWidth: 1,
    borderColor: colors.border,

    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  selectedProductName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },

  selectedProductPrice: {
    marginTop: 4,
    color: colors.textSecondary,
    fontSize: 13,
  },

  selectedProductRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  selectedProductQty: {
    marginRight: 14,
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
  },

  removeBtn: {
    width: 34,
    height: 34,

    borderRadius: 17,

    backgroundColor: colors.logoutBackground,

    justifyContent: 'center',
    alignItems: 'center',
  },

  removeBtnText: {
    color: colors.danger,
    fontSize: 20,
    fontWeight: 'bold',
  },

  addBtn: {
    width: 32,
    height: 32,

    borderRadius: 16,

    backgroundColor: colors.success,

    justifyContent: 'center',
    alignItems: 'center',

    marginLeft: 8,
  },

  addBtnText: {
    color: colors.textButton,
    fontSize: 22,
    fontWeight: 'bold',
    lineHeight: 24,
  },

  /* =========================
     LABELS
  ========================== */

  label: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 10,
  },

  /* =========================
     PAYMENT METHODS
  ========================== */

  methodContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },

  methodBtn: {
    flex: 1,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingVertical: 14,
    marginHorizontal: 4,
    alignItems: 'center',
  },

  methodBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },

  methodBtnText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '700',
  },

  methodBtnTextActive: {
    color: colors.textButton,
  },

  creditNoticeBox: {
    backgroundColor: colors.salesBadgeBackground,
    borderWidth: 1,
    borderColor: colors.secondary,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 12,
    marginBottom: 20,
  },

  creditNoticeText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },


  /* =========================
     EXTRA ACTIONS
  ========================== */

  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },

  secondaryBtnGray: {
    backgroundColor: '#EAEAEA',
    flex: 1,
    height: 54,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },

  secondaryBtnIcon: {
    fontSize: 16,
    marginRight: 6,
  },

  secondaryBtnTextGray: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 15,
  },

  secondaryBtnBlue: {
    backgroundColor: colors.secondary,
    flex: 1,
    height: 54,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },

  secondaryBtnIconBlue: {
    fontSize: 16,
    marginRight: 6,
    color: '#1E3A8A',
  },

  secondaryBtnTextBlue: {
    color: '#1E3A8A',
    fontWeight: '700',
    fontSize: 15,
  },

  /* =========================
     BUTTONS
  ========================== */

  checkoutBtn: {
    backgroundColor: colors.success,
    height: 58,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },

  checkoutBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  checkMark: {
    color: colors.textButton,
    fontSize: 20,
    fontWeight: 'bold',
    marginRight: 8,
  },

  checkoutBtnText: {
    color: colors.textButton,
    fontSize: 18,
    fontWeight: '700',
  },

  disabledBtn: {
    opacity: 0.5,
  },

  /* =========================
     Modal De Notas
  ========================== */

modalOverlay: {
  flex: 1,
  backgroundColor: 'rgba(0,0,0,0.45)',

  justifyContent: 'center',
  alignItems: 'center',

  padding: 24,
},

noteModal: {
  width: '100%',

  backgroundColor: colors.card,

  borderRadius: 20,

  padding: 20,
},

noteModalTitle: {
  fontSize: 20,
  fontWeight: '700',

  color: colors.primary,

  marginBottom: 16,
},

noteInput: {
  minHeight: 140,

  borderWidth: 1,
  borderColor: colors.border,

  borderRadius: 14,

  padding: 14,

  fontSize: 16,
  color: colors.textPrimary,

  textAlignVertical: 'top',

  backgroundColor: colors.cardSecondary,
},

noteActions: {
  flexDirection: 'row',
  justifyContent: 'space-between',

  marginTop: 18,
},

deleteNoteBtn: {
  paddingVertical: 12,
  paddingHorizontal: 16,

  borderRadius: 12,

  backgroundColor: colors.logoutBackground,
},

deleteNoteText: {
  color: '#DC2626',
  fontWeight: '700',
},

closeNoteBtn: {
  paddingVertical: 12,
  paddingHorizontal: 20,

  borderRadius: 12,

  backgroundColor: colors.success,
},

closeNoteText: {
  color: colors.textButton,
  fontWeight: '700',
},

noteHeader: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',

  marginBottom: 16,
},

closeIconBtn: {
  width: 34,
  height: 34,

  borderRadius: 17,

  backgroundColor: colors.borderLight,

  justifyContent: 'center',
  alignItems: 'center',
},

closeIconText: {
  fontSize: 18,
  fontWeight: '700',

  color: colors.textSecondary,
},

  /* =========================
     ERRORS
  ========================== */

  errorText: {
    color: colors.textError,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 12,
  },

  /* =========================
      Acciones extras
   ========================= */
  actionsTopRow: {
    marginBottom: 16,
  },

  clearAmountBtn: {
    backgroundColor: colors.logoutBackground,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 12,
  },

  clearAmountText: {
    color: colors.textError,
    fontWeight: '700',
    fontSize: 14,
  },

  /* =========================
   PRODUCT DROPDOWN
========================== */

productDropdown: {
  backgroundColor: colors.card,
  borderWidth: 1,
  borderColor: colors.border,
  borderRadius: 14,
  paddingHorizontal: 16,
  paddingVertical: 18,
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 16,
},

productDropdownText: {
  color: colors.textPrimary,
  fontSize: 15,
  fontWeight: '600',
},

dropdownArrow: {
  color: colors.textSecondary,
  fontSize: 14,
},

productsContainer: {
  backgroundColor: colors.card,
  borderRadius: 14,
  borderWidth: 1,
  borderColor: colors.border,
  marginBottom: 18,
  overflow: 'hidden',
},

productItem: {
  paddingHorizontal: 16,
  paddingVertical: 14,
  borderBottomWidth: 1,
  borderBottomColor: colors.border,
},

productName: {
  fontSize: 15,
  fontWeight: '600',
  color: colors.textPrimary,
},

productPrice: {
  marginTop: 4,
  fontSize: 13,
  color: colors.textSecondary,
},

showMoreBtn: {
  paddingVertical: 14,
  alignItems: 'center',
},

showMoreText: {
  color: colors.primary,
  fontWeight: '700',
  fontSize: 14,
},

// =========================
//     History
// ==========================

  /* Título de sección: bajado de 24px a 15px y a tinta secundaria en
     mayúsculas. Antes competía con los datos — un encabezado no debe ser lo
     más prominente de la pantalla. */
  reportTitle: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: colors.textSecondary,
    marginBottom: 12,
    marginTop: 24,
    textAlign: 'left',
  },

  /* --- Balance del período (hero number) --- */
  heroCard: {
    backgroundColor: colors.card,
    borderRadius: 18,
    paddingVertical: 22,
    paddingHorizontal: 20,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },

  heroLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 6,
  },

  heroAmount: {
    fontSize: 38,
    fontWeight: '800',
    letterSpacing: -0.5,
  },

  heroHint: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 6,
    textAlign: 'center',
  },

  /* --- Fila de métricas --- */
  kpiRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 4,
  },

  kpiTile: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },

  // Punto de color: la identidad no depende solo del color del número,
  // cada tile lleva además su etiqueta en texto.
  kpiDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: 8,
  },

  kpiLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 3,
  },

  kpiValue: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textPrimary,
  },

  kpiMeta: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },

historyContainer: {
  gap: 12,
  paddingBottom: 40,
},

historyCard: {
  backgroundColor: colors.card,
  borderRadius: 16,
  padding: 16,
  borderWidth: 1,
  borderColor: colors.border,
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
},

historyTitle: {
  fontSize: 16,
  fontWeight: '600',
  color: colors.textPrimary,
},

historyMetaRow: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 8,
  marginTop: 6,
},

historyBadge: {
  paddingHorizontal: 8,
  paddingVertical: 3,
  borderRadius: 6,
},

historyBadgeText: {
  fontSize: 11,
  fontWeight: '700',
},

historyDate: {
  fontSize: 12,
  color: colors.textMuted,
},

historyIncome: {
  fontSize: 18,
  fontWeight: 'bold',
  color: '#16A34A',
},

// Fiado: plata que te deben, no una pérdida. Ámbar, no rojo.
historyPending: {
  fontSize: 18,
  fontWeight: 'bold',
  color: '#B45309',
},

historyExpense: {
  fontSize: 18,
  fontWeight: 'bold',
  color: '#DC2626',
},

//Nota
savedNoteContainer: {
  backgroundColor: colors.salesBadgeBackground,
  borderRadius: 12,
  paddingVertical: 12,
  paddingHorizontal: 16,
  marginBottom: 16,
  borderWidth: 1,
  borderColor: colors.border,
  flexDirection: 'row',
  alignItems: 'center',
  flexWrap: 'wrap',
},

savedNoteLabel: {
  fontSize: 14,
  fontWeight: '700',
  color: colors.textSecondary,
  marginRight: 6,
},

savedNoteText: {
  fontSize: 14,
  color: colors.textPrimary,
  fontStyle: 'italic',
  flex: 1,
},

/* =========================
    NOTA EN COMPROBANTE
========================== */
receiptNoteContainer: {
  marginTop: 8,
  padding: 12,
  backgroundColor: colors.salesBadgeBackground,
  borderRadius: 10,
  marginBottom: 16,
},

receiptNoteLabel: {
  fontSize: 13,
  fontWeight: '700',
  color: colors.textSecondary,
  marginBottom: 4,
},

receiptNoteText: {
  fontSize: 14,
  color: colors.textPrimary,
  fontStyle: 'italic',
},
});