import React from 'react';
import { View, Text } from 'react-native';
import { PieChart as GiftedPieChart } from 'react-native-gifted-charts';

import styles, { palette } from './styles/pieChart.styles';

export default function PieChart({ data, options, chartWidth }) {
  const chartData =
    data?.labels?.map((label, index) => ({
      value: data.datasets[0].data[index] || 0,
      color: palette[index % palette.length],
      text: label,
    })) || [];

  return (
    <View style={styles.container}>
      <GiftedPieChart
        data={chartData}
        donut={false}
        radius={75}
        // Desactivamos el texto nativo para evitar saturación y cortes
        showText={false}
        {...options}
      />

      {/* Leyenda personalizada ordenada debajo del gráfico de pastel */}
      <View style={styles.legendContainer}>
        {chartData.map((item, index) => (
          <View key={index} style={styles.legendItem}>
            <View style={[styles.legendColorBox, { backgroundColor: item.color }]} />
            <Text style={styles.legendText} numberOfLines={1}>
              {item.text}: <Text style={styles.legendValue}>{item.value}%</Text>
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}