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
    paddingBottom: 120,
  },

  /* ===================== Estado vacío (mismo lenguaje que emptyCard del Dashboard) ===================== */
  emptyCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginTop: 10,
  },
  emptySubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
  errorText: {
    color: colors.danger,
    fontSize: 13,
    textAlign: 'center',
    paddingVertical: 12,
  },

  /* ===================== Tarjeta de factura ===================== */
  invoiceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  invoiceMain: {
    flex: 1,
    paddingRight: 10,
  },
  invoiceTopRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  // Lo más visible de la fila: monto y fecha, no el número de factura.
  invoiceTotal: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '900',
  },
  invoiceDate: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  invoiceCustomer: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 3,
  },
  invoiceStatus: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 3,
  },
  statusPaid: {
    color: colors.success,
  },
  statusPending: {
    color: colors.warning,
  },
  statusVoid: {
    color: colors.textMuted,
  },

  /* Botón de compartir: solo ícono, no texto largo repetido en cada fila. */
  shareButton: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: colors.salesBadgeBackground,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* ===================== Filtro por día (píldora de fecha + "Todos") ===================== */
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  // Píldora que abre el calendario; muestra el día filtrado. Ocupa el ancho
  // restante para que "Todos" quede compacto a su lado.
  filterDateButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 46,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  filterDateButtonActive: {
    borderColor: colors.primary,
    backgroundColor: colors.reportHighlight,
  },
  filterDateText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'capitalize',
  },
  filterDateTextActive: {
    color: colors.primary,
  },
  // Botón "Todos": quita el filtro y muestra todas las ventas.
  filterAllButton: {
    height: 46,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterAllButtonActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  filterAllText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  filterAllTextActive: {
    color: colors.textWhite,
  },

  /* ===================== Encabezado de grupo por día ===================== */
  dayHeaderRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginTop: 6,
    marginBottom: 8,
    paddingHorizontal: 2,
  },
  dayHeaderTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textPrimary,
    textTransform: 'capitalize',
  },
  dayHeaderMeta: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
  },

  /* ===================== Modo selección múltiple ===================== */
  invoiceCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.reportHighlight,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },

  /* Barra inferior de acciones cuando hay selección activa. */
  selectionBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 26,
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  selectionCancel: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  selectionCancelText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  selectionShareButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
  },
  selectionShareText: {
    color: colors.textWhite,
    fontSize: 15,
    fontWeight: '700',
  },
  selectionShareDisabled: {
    backgroundColor: colors.disabledButton,
  },
});
