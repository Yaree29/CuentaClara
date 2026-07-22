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
});
