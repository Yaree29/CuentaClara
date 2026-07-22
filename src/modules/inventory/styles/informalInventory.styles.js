import { StyleSheet } from 'react-native';
import colors from '../../../theme/colors';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background },

  /* --- Cabecera y Buscador --- */
  headerWrapper: {
    padding: 16,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderColor: colors.border },

  searchRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center' },

  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
    borderWidth: 1,
    borderColor: colors.border },

  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 15,
    color: colors.textPrimary },

  promoBtn: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center' },

  promoBtnActive: { backgroundColor: colors.primary },

  /* --- Categorías --- */
  categoriesScroll: { marginTop: 12 },

  categoryPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.background,
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.border },

  categoryPillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary },

  categoryText: {
    color: colors.textSecondary,
    fontWeight: '600',
    fontSize: 13 },

  categoryTextActive: { color: colors.textButton },

  /* --- Lista de Productos --- */
  listContainer: {
    padding: 16,
    // 200: además del tab bar, esta pantalla tiene 2 FABs propios
    // (fabContainer/bottomFloatContainer, bottom:80 + ~56 de alto) — el
    // padding cubre ambas capas para que el último producto no quede
    // detrás del botón.
    paddingBottom: 200 },

  productCard: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'space-between' },

  productCardSelected: {
    borderColor: colors.primary,
    borderWidth: 2,
  },

  productInfo: {
    flex: 1,
    marginLeft: 12 },

  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary },

  productPrice: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.success, marginTop: 4 },

  productStock: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2 },

  editBtn: { padding: 8 },

  /* --- Botón Flotante Inferior (Modo Selección) --- */
  // bottom:80 = altura del tab bar (72, MainNavigator.jsx) + 8 de margen —
  // antes bottom:20 quedaba tapado por el tab bar. Mismo cálculo que
  // src/components/ui/goblalFAB.jsx.
  bottomFloatContainer: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16 },

  generatePromoBtn: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },

  promoBadge: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },

  promoBadgeText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: 'bold',
  },

  generatePromoBtnText: {
    color: colors.textButton,
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 12 },

  /* --- Modal de Publicidad --- */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end' },

  modalContent: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '80%' },

  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 16 },

  selectedItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: colors.borderLight || colors.border },

  modalInput: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 14,
    minHeight: 80,
    marginTop: 16,
    textAlignVertical: 'top',
    color: colors.textPrimary },

    /* --- Botón Flotante Principal (FAB) --- */
  // bottom:80 = altura del tab bar (72, MainNavigator.jsx) + 8 de margen.
  fabContainer: {
    position: 'absolute',
    bottom: 20,
    right: 16,
    alignItems: 'flex-end',
  },

  fabButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },

  fabBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    zIndex: 1,
  },

  fabMenu: {
    alignItems: 'flex-end',
    marginBottom: 15,
    zIndex: 2,
  },

  fabMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },

  fabMenuLabel: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    color: '#FFF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
    marginRight: 10,
    fontSize: 14,
    fontWeight: '600',
  },

  fabMenuButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* --- Estilos del Modal de Formulario --- */
  formGroup: { marginBottom: 16 },

  formLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 6 },

  formInput: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    height: 48,
    color: colors.textPrimary },

  /* Botones "Generar" / "Escanear" del campo Código de barras */
  barcodeActionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },

  barcodeActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.primary,
    backgroundColor: colors.primary + '12',
  },

  barcodeActionText: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 13,
  },

  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8 },

  formCategoryPill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background },

  formCategoryPillActive: {
    backgroundColor: colors.primary + '15',
    borderColor: colors.primary },

  formCategoryText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '500' },

  formCategoryTextActive: {
    color: colors.primary,
    fontWeight: '700' },

  /* Adelanto del gasto que se va a registrar */
  purchaseHint: {
    marginTop: 8,
    fontSize: 12,
    lineHeight: 17,
    color: colors.textSecondary,
  },

  /* --- Estilos del Selector de Compra --- */
  purchaseTypeContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4 },

  purchaseTypePill: {
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center' },

  purchaseTypePillActive: {
    backgroundColor: colors.primary + '15',
    borderColor: colors.primary },

  purchaseTypeText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center' },

  purchaseTypeTextActive: {
    color: colors.primary,
    fontWeight: '700' },

  /* --- Estilos de Validación --- */
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
    marginLeft: 2,
  },

  saveBtn: {
    backgroundColor: colors.success,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10 },


  saveBtnText: {
    color: colors.textButton,
    fontSize: 16,
    fontWeight: 'bold' },

  deleteBtn: {
    backgroundColor: colors.danger + '15',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10 },

  deleteBtnText: {
    color: colors.danger,
    fontSize: 16,
    fontWeight: 'bold' },

  /* --- Modal de Nueva Categoría --- */
  addCatOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },

  addCatCard: {
    width: '100%',
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 24,
  },

  addCatTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 16,
  },

  addCatInput: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    height: 48,
    color: colors.textPrimary,
    fontSize: 15,
  },

  addCatActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },

  addCatCancelBtn: {
    flex: 1,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },

  addCatCancelText: {
    color: colors.textSecondary,
    fontWeight: '600',
  },

  addCatConfirmBtn: {
    flex: 1,
    padding: 14,
    borderRadius: 10,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },

  addCatConfirmText: {
    color: colors.textButton,
    fontWeight: '700',
  },

  /* Píldora especial para el botón "+ Categoría" en el filtro */
  categoryPillAdd: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.primary + '12',
    marginRight: 8,
    borderWidth: 1.5,
    borderColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  categoryPillAddText: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 13,
  },
});
