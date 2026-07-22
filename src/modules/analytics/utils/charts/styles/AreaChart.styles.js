import { StyleSheet } from 'react-native';
import colors from '../../../../../theme/colors';

export default StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
  },

  labelStyle: {
    color: colors.textSecondary,
    fontSize: 8,
    textAlign: 'center',
    width: 40,
  },
});