import { StyleSheet } from 'react-native';
import colors from '../../../theme/colors';

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
    marginBottom: 12,
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
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.reportHighlight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  name: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '800',
  },
  role: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  rowRight: {
    alignItems: 'flex-end',
  },
  completed: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  income: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '900',
    marginTop: 2,
  },
  separator: {
    height: 1,
    backgroundColor: colors.borderLight,
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: 13,
    textAlign: 'center',
    paddingVertical: 12,
  },
});
