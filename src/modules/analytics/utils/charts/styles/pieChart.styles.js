import { StyleSheet } from 'react-native';
import colors from '../../../../../theme/colors';

export const palette = [
  colors.info,
  colors.success,
  colors.warning,
  colors.danger,
  colors.savedBackground,
  colors.primaryDark,
];

export default StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  legendContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 14,
    gap: 10,
    paddingHorizontal: 10,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  legendColorBox: {
    width: 10,
    height: 10,
    borderRadius: 3,
    marginRight: 5,
  },
  legendText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  legendValue: {
    fontWeight: '700',
    color: colors.textPrimary,
  },
});