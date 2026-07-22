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

  /* Botón de compartir en el slot rightActions del header. */
  headerShareButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.salesBadgeBackground,
    alignItems: 'center',
    justifyContent: 'center',
  },

  centered: {
    marginTop: 40,
    alignItems: 'center',
  },
  errorText: {
    color: colors.danger,
    fontSize: 13,
    textAlign: 'center',
    paddingVertical: 12,
  },

  /* ===================== Resumen (monto + meta) ===================== */
  summaryCard: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  summaryLabel: {
    color: colors.secondary,
    fontSize: 13,
    fontWeight: '600',
  },
  summaryTotal: {
    color: colors.textWhite,
    fontSize: 30,
    fontWeight: '900',
    marginTop: 2,
  },
  summaryMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  summaryMeta: {
    color: colors.textWhite,
    fontSize: 13,
  },
  summaryMetaMuted: {
    color: colors.secondary,
    fontSize: 12,
    marginTop: 2,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    marginTop: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  statusBadgeText: {
    color: colors.textWhite,
    fontSize: 12,
    fontWeight: '700',
  },

  /* ===================== Lista de productos ===================== */
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 8,
    marginLeft: 2,
  },
  itemsCard: {
    backgroundColor: colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    paddingVertical: 4,
    marginBottom: 16,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  itemRowLast: {
    borderBottomWidth: 0,
  },
  itemInfo: {
    flex: 1,
    paddingRight: 10,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  itemMeta: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  itemSubtotal: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },

  /* ===================== Totales ===================== */
  totalsCard: {
    backgroundColor: colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
  },
  totalsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  totalsLabel: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  totalsValue: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  totalsGrandLabel: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  totalsGrandValue: {
    fontSize: 15,
    fontWeight: '900',
    color: colors.textPrimary,
  },
});
