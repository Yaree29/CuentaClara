import React from 'react';
import { View } from 'react-native';
import { BarChart as GiftedBarChart } from 'react-native-gifted-charts';
import colors from '../../../../theme/colors'
import styles from './styles/HorizontalBarChart.styles';

export default function HorizontalBarChart({
  data,
  options,
  chartWidth,
}) {
  // Procesamos los datos y limitamos la longitud de las etiquetas para que no invadan demasiado espacio
  const chartData =
    data?.labels?.map((label, index) => ({
      value: data.datasets[0].data[index] || 0,
      label:
        label.length > 14
          ? `${label.substring(0, 14)}...`
          : label,
    })) || [];

  // Espacio reservado para los nombres a la izquierda dentro del ancho total de la tarjeta
  const yAxisLabelWidth = 95;

  // Calculamos el ancho real disponible restando el espacio del eje Y y los paddings internos de la card
  const availableWidth = chartWidth - yAxisLabelWidth - 10;

  return (
    <View style={styles.container}>
      <GiftedBarChart
        data={chartData}
        width={Math.max(availableWidth, 180)}
        height={Math.max(240, chartData.length * 40)}
        horizontal
        barWidth={12}
        spacing={18}
        initialSpacing={10}
        frontColor={colors.primaryLight}
        yAxisLabelWidth={yAxisLabelWidth}
        noOfSections={4}
        yAxisTextStyle={styles.labelStyle}
        xAxisLabelTextStyle={styles.xAxisLabelStyle}
        hideOrigin
        {...options}
      />
    </View>
  );
}