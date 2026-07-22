import { StyleSheet, Dimensions } from 'react-native';
import colors from '../../../../../theme/colors';

export const screenWidth = Dimensions.get('window').width - 40;

export default StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },

  labelStyle: {
    color: colors.textSecondary,
    fontSize: 10,
  },
});