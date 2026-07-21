import { StyleSheet } from 'react-native';
import colors from '../../../theme/colors';

// Tintes derivados del theme (patrón colors.X + alpha-hex ya usado en el
// proyecto, ej. team.styles.js) — sin hex hardcodeado.
export const ALERT_STYLES = {
  danger: {
    container: colors.danger + '10',
    border: colors.danger + '30',
    title: colors.danger,
    accent: colors.danger,
  },
  warning: {
    container: colors.warning + '10',
    border: colors.warning + '30',
    title: colors.warning,
    accent: colors.warning,
  },
};

export default StyleSheet.create({
  widget: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  kicker: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '800',
    marginTop: 2,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 3,
  },
  totalPill: {
    minWidth: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  totalPillText: {
    color: colors.textWhite,
    fontWeight: '800',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  card: {
    flexGrow: 1,
    flexBasis: '100%',
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  message: {
    fontSize: 15,
    fontWeight: '800',
    lineHeight: 20,
  },
  productName: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 4,
  },
  cardFooter: {
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  remainingLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  remainingValue: {
    fontSize: 16,
    fontWeight: '800',
  },
  emptyContainer: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: 13,
    textAlign: 'center',
  },
});
