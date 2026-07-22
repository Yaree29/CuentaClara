import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { PieChart as GiftedPieChart } from 'react-native-gifted-charts';
import styles, { palette } from './styles/DonutChart.styles';

export default function DonutChart({ data, options, chartWidth }) {
  const chartData =
    data?.labels?.map((label, index) => ({
      value: data.datasets[0].data[index] || 0,
      color: palette[index % palette.length],
      // Guardamos la etiqueta para usarla en nuestra propia leyenda limpia
      text: label, 
    })) || [];

  return (
    <View style={styles.container}>
      <GiftedPieChart
        data={chartData}
        donut
        radius={75}
        innerRadius={40}
        // Desactivamos el texto nativo que se sale y corta
        showText={false} 
        {...options}
      />

      {/* Leyenda personalizada ordenada debajo de la dona */}
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