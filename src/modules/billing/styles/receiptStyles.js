import { StyleSheet } from 'react-native';
import colors from '../../../theme/colors';

const receiptStyles = StyleSheet.create({
  /* --- CONTENEDOR PRINCIPAL --- */
  container: {
    padding: 16,
    paddingBottom: 40,
  },
  
  receiptCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: colors.shadowCard || '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },

  /* --- CABECERA DEL RECIBO (Logo y Título) --- */
  headerSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logoCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  logoInitial: {
    fontSize: 26,
    fontWeight: 'bold',
    color: colors.textWhite || '#FFFFFF',
  },
  businessName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  receiptBadge: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    color: colors.textSecondary,
    backgroundColor: colors.cardSecondary || '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },

  /* --- METADATOS DEL RECIBO (Fechas, Folios, etc.) --- */
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  metaItem: {
    flex: 1,
  },
  metaItemEnd: {
    alignItems: 'flex-end',
  },
  metaLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  metaValue: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },

  /* --- INFORMACIÓN DEL CLIENTE --- */
  clientSection: {
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  clientLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  clientName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  clientMeta: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },

  /* --- SEPARADORES Y LÍNEAS DIVISORIAS --- */
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 12,
  },
  dividerLight: {
    height: 1,
    backgroundColor: colors.borderLight || '#E2E8F0',
    marginVertical: 8,
  },

  /* --- TABLA DE PRODUCTOS (Columnas y Filas) --- */
  tableHeader: {
    flexDirection: 'row',
    paddingBottom: 6,
    marginBottom: 2,
  },
  tableHeaderText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderRadius: 4,
  },
  tableRowAlt: {
    backgroundColor: colors.background,
  },
  tableCell: {
    fontSize: 13,
    color: colors.textPrimary,
  },
  
  // Proporciones de las columnas de la tabla
  colDesc: { flex: 3, paddingRight: 4 },
  colQty: { flex: 1, textAlign: 'center' },
  colPrice: { flex: 1.5, textAlign: 'right' },
  colSubtotal: { flex: 1.5, textAlign: 'right', fontWeight: '600' },

  /* --- SECCIÓN DE TOTALES --- */
  totalsSection: {
    paddingTop: 4,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  totalLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  totalValue: {
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  grandTotalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  grandTotalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
  },

  /* --- PIE DE PÁGINA DEL RECIBO (Mensaje de despedida) --- */
  receiptFooter: {
    alignItems: 'center',
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight || '#F1F5F9',
  },
  footerText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  footerSub: {
    fontSize: 11,
    color: colors.textSecondary,
  },

  /* --- DETALLES ESPECÍFICOS PARA PYMES (Facturación Electrónica, etc.) --- */
  pymeDetailGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  pymeDetailItem: {
    width: '48%',
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 10,
  },
  pymeDetailLabel: {
    fontSize: 10,
    color: colors.textSecondary,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 3,
  },
  pymeDetailValue: {
    fontSize: 12,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  pymeLineMeta: {
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 2,
  },
  
  // Caja de notas adicionales
  pymeNotesBox: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 10,
    marginTop: 12,
  },
  pymeNotesText: {
    color: colors.textPrimary,
    fontSize: 12,
    lineHeight: 17,
  },

  /* --- BOTONES DE ACCIÓN (Compartir, Volver) --- */
  shareButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  shareButtonText: {
    color: colors.textWhite || '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 15,
  },
  backButton: {
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  backButtonText: {
    color: colors.primary,
    fontWeight: '600',
    fontSize: 15,
  },
});

export default receiptStyles;