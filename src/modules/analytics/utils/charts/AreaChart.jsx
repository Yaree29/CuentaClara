import React from 'react';
import { View } from 'react-native';
import {
  LineChart as GiftedLineChart
} from 'react-native-gifted-charts';
import styles from './styles/AreaChart.styles';
import colors from '../../../../theme/colors';

export default function AreaChart({
  data,
  options,
  chartWidth,
}) {
  const chartData =
    data?.labels?.map((label, index) => ({
      value:
        data.datasets[0].data[index] || 0,
      label:
        label.length > 7
          ? `${label.substring(0, 7)}...`
          : label,
    })) || [];

  const dynamicSpacing =
    chartData.length > 1
      ? (chartWidth - 30) / (chartData.length - 1)
      : 30;

  return (
    <View style={styles.container}>
      <GiftedLineChart
        data={chartData}
        width={chartWidth - 15}
        // Reducimos aún más la altura para que ocupe menos espacio vertical
        height={90}
        spacing={Math.max(dynamicSpacing, 25)}
        initialSpacing={10}
        endSpacing={10}
        isArea
        color={colors.success}
        // 👇 AQUÍ REDUCES EL GROSOR DE LA LÍNEA (ej. de 2 o 3 a 1.5)
        thickness={1.5}
        startFillColor={colors.success + '4D'}
        endFillColor={colors.success + '03'}
        yAxisLabelWidth={25}
        noOfSections={2}
        xAxisLabelTextStyle={styles.labelStyle}
        yAxisTextStyle={styles.labelStyle}
        hideOrigin
        {...options}
      />
    </View>
  );
}