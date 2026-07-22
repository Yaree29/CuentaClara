import { StyleSheet } from 'react-native';
import colors from '../../../../../theme/colors';

export default StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'flex-start', // Alinea la gráfica para respetar el espacio del eje Y
    justifyContent: 'center',
    paddingVertical: 6,
  },

  labelStyle: {
    color: colors.textSecondary,
    fontSize: 10,
    textAlign: 'right',
    width: 90,        // Coincide casi exactamente con el yAxisLabelWidth para evitar superposición
    paddingRight: 6,  // Separa sutilmente el texto de la barra principal
  },

  xAxisLabelStyle: {
    color: colors.textPrimary,
    fontSize: 10,
  },
});