import { StyleSheet, Platform } from 'react-native';
import colors from '../../../../theme/colors';

// Sombra reutilizable para tarjetas
const shadowStyle = Platform.select({
  ios: {
    shadowColor: colors.shadowCard,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.06,
    shadowRadius: 12,
  },

  android: {
    elevation: 2,
  },
});

export default StyleSheet.create({
  // flex:1 faltaba aquí — sin él, el SafeAreaView no queda acotado a la
  // altura real de pantalla (ventana - tab bar de 72px en MainNavigator.jsx),
  // así que el ScrollView de abajo (que tampoco tenía flex:1 en su `style`,
  // solo contentContainerStyle) terminaba midiéndose por su contenido en vez
  // de por el viewport. El paddingBottom:120 de `content`/`scrollFlex` ya
  // estaba bien puesto, pero sin este flex:1 la última fila (el botón
  // "Guardar Venta"/"Cerrar Caja") podía quedar tapada por el tab bar. Mismo
  // patrón que InformalDashboard.styles.js (container: flex:1 + ScrollView
  // con style={styles.container}).
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  // Aplicar como `style` (no solo `contentContainerStyle`) en el ScrollView
  // raíz de SalesSection.jsx y CashRegisterScreen.jsx.
  scrollFlex: {
    flex: 1,
  },

  content: {
    padding: 16,
    paddingBottom: 120,
  },

  /* ==============================================================================================================
      Estilos para el switch de tabs
  ================================================================================================================= */ 
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginVertical: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 14,
    padding: 4,
  },

  tabButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },

  tabButtonActive: {
    backgroundColor: colors.primary,
  },

  tabText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textSecondary,
    textAlign: 'center',
  },

  tabTextActive: {
    color: colors.textButton,
    textAlign: 'center',
  },

  /* ==============================================================================================================================
      Estilos para la sección de ventas
  ============================================================================================================================== */ 

  /* =====================
     TITULOS
  ===================== */

  productsSectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 12,
    marginTop: 24,
    letterSpacing: -0.2,
  },

  /* =====================
     VENTAS ABIERTAS (GRID)
  ===================== */
  accountsGrid: {
    flexDirection: 'row',
    marginBottom: 20,
    paddingBottom: 4,
  },

  accountButton: {
    width: 100,
    backgroundColor: colors.card,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 12,
    marginRight: 10,

    ...shadowStyle,
  },

  accountSelected: {
    borderWidth: 0,
    borderColor: colors.primary,
    backgroundColor: colors.takenBackground,
  },

  accountOccupied: {
    borderWidth: 0,
    backgroundColor: colors.occupiedBackground
  },

  accountFree: {
    borderWidth: 0,
    backgroundColor: colors.freeBackground,
    borderStyle: 'dashed',
    opacity: 0.7,
  },

  accountSaved: {
  borderWidth: 0,
  backgroundColor: colors.savedBackground,
},

  accountText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },

  accountAmountText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.primary,
    marginTop: 4,
  },

  accountStatus: {
    marginTop: 4,
    fontSize: 11,
    fontWeight: '600',
    color:  colors.textPrimary,
  },

  /* =====================
     RESUMEN DE VENTA
  ===================== */
  summaryCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadowStyle,
  },

  summaryTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  summaryInfo: {
    marginTop: 4,
    fontSize: 14,
    fontWeight: '500',
    color: colors.textPrimary,
  },

  summaryTotal: {
    marginTop: 14,
    fontSize: 34,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: -0.5,
  },

  /* =====================
     BUSCADOR PRODUCTOS
  ===================== */
  dropdown: {
    height: 54,
    backgroundColor: colors.card,
    borderRadius: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadowStyle,
  },

  dropdownPlaceholder: {
    color: colors.textSecondary,
    fontSize: 15,
  },

  dropdownSelectedText: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '600',
  },

  /* =====================
     PRODUCTOS AGREGADOS
  ===================== */
  productCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...shadowStyle,
  },

  productsContainer: {
    minHeight: 300,
    maxHeight: 300,
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    marginBottom: 15,
    ...shadowStyle,
  },

  emptyProductsContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  productsList: {
    paddingBottom: 5,
  },

  emptyProductsText: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textPrimary,
  },

  emptyProductsSubText: {
    marginTop: 6,
    fontSize: 14,
    color: colors.textSecondary,
  },

  productInfoContainer: {
    flex: 1,
    paddingRight: 12,
  },

  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },

  productDetails: {
    marginTop: 4,
    fontSize: 14,
    color: colors.textSecondary,
  },

  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Platform.select({ ios: '#F3F4F6', android: '#E5E7EB' }), 
    borderRadius: 20,
    padding: 4,
  },

  quantityBtnMinus: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.danger,
    justifyContent: 'center',
    alignItems: 'center',
  },

  quantityBtnPlus: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.success,
    justifyContent: 'center',
    alignItems: 'center',
  },

  quantityBtnText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },

  quantityBtnTextPlus: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textButton,
  },

  quantityValue: {
    horizontalPadding: 12,
    minWidth: 28,
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },

  /* =====================
     VENTA VACIA
  ===================== */
  emptyStateCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    marginVertical: 10,
  },

  emptyStateTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },

  emptyStateText: {
    marginTop: 6,
    fontSize: 14,
    textAlign: 'center',
    color: colors.textSecondary,
  },

  /* =====================
     NOTAS
  ===================== */
  noteInput: {
    minHeight: 50,
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    textAlignVertical: 'top',
    color: colors.textPrimary,
    fontSize: 15,
    marginBottom: 12,
  },

  /* =====================
     BOTONES ACCION PRINCIPAL
  ===================== */

  createButton: {
    backgroundColor: colors.primary,
    height: 54,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 0,
    ...shadowStyle,
  },

  saveButton: {
    backgroundColor: colors.primary,
    height: 54,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 20,
    ...shadowStyle,
  },

  saveButtonText: {
    color: colors.textButton,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
/*
  closeButton: {
    backgroundColor: colors.danger, // Un rojo moderno y estándar UX
    height: 54,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 20,
    ...shadowStyle,
  },

  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
*/
  /* =====================
     LIMITADORES EN CASCADA
  ===================== */
  scrollGridContainer: {
    height: 140, // Altura fija aproximada para mostrar 2 filas de tarjetas (4 en total)
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 8,
    backgroundColor: '#F9FAFB', // Sutil fondo para denotar que es una zona con scroll
    marginBottom: 16,
  },

  scrollProductsContainer: {
    maxHeight: 340, // Altura máxima límite para 4 productos aproximadamente
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 8,
    backgroundColor: '#F9FAFB', // Un tono gris sutil para enmarcar la lista en cascada
  },

});