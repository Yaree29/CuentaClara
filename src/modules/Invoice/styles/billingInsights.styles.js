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

  /* ===================== Segmented control (rango de fechas) ===================== */
  segmented: {
    flexDirection: 'row',
    backgroundColor: colors.cardSecondary,
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 9,
    alignItems: 'center',
  },
  segmentButtonActive: {
    backgroundColor: colors.card,
    shadowColor: colors.shadowCard,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  segmentText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  segmentTextActive: {
    color: colors.primary,
  },

  /* ===================== Hero — mismo lenguaje que "Ventas del Día" ===================== */
  heroCard: {
    backgroundColor: colors.salesDisplayBackground,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: colors.shadowCard,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  heroTitle: {
    color: colors.salesDisplaySubtext,
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  heroAmount: {
    color: colors.salesDisplayText,
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  heroSubtext: {
    color: colors.salesDisplaySubtext,
    fontSize: 13,
  },
  heroRevenueRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.15)',
  },
  heroRevenueLabel: {
    color: colors.salesDisplaySubtext,
    fontSize: 12,
  },
  heroRevenueValue: {
    color: colors.salesDisplayText,
    fontSize: 14,
    fontWeight: '700',
  },
  gapNotice: {
    color: colors.textMuted,
    fontSize: 12,
    marginBottom: 16,
    fontStyle: 'italic',
    lineHeight: 17,
  },

  /* ===================== Secciones (mismo tratamiento que Recetas) ===================== */
  section: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 4,
  },
  sectionSubtitle: {
    color: colors.textSecondary,
    fontSize: 13,
    marginBottom: 12,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  rowLast: {
    borderBottomWidth: 0,
    paddingBottom: 0,
  },
  rowLeft: {
    flex: 1,
    paddingRight: 12,
  },
  rowName: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '800',
  },
  rowMeta: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  rowValueGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rowValuePositive: {
    color: colors.success,
    fontSize: 14,
    fontWeight: '900',
  },
  rowValueNegative: {
    color: colors.danger,
    fontSize: 14,
    fontWeight: '900',
  },
  rowValueMuted: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
    fontStyle: 'italic',
  },

  emptyText: {
    color: colors.textSecondary,
    fontSize: 13,
    textAlign: 'center',
    paddingVertical: 16,
  },
  errorText: {
    color: colors.danger,
    fontSize: 13,
    textAlign: 'center',
    paddingVertical: 12,
  },
});
