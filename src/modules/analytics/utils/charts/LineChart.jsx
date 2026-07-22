import React from 'react';
import { View, Dimensions } from 'react-native';
import { LineChart as GiftedLineChart } from 'react-native-gifted-charts';

import styles from './styles/lineChart.styles';
import colors from '../../../../theme/colors';

const screenWidth = Dimensions.get('window').width - 40;

export default function LineChart({ data, options }) {
  const chartData = data?.labels?.map((label, index) => ({
    value: data.datasets[0].data[index] || 0,
    label: label,
  })) || [];

  return (
    <View style={styles.container}>
      <GiftedLineChart
        data={chartData}
        width={screenWidth - 60}
        height={200}
        spacing={45}
        initialSpacing={20}
        color={colors.primary}
        thickness={3}
        startFillColor={colors.primary + '4D'}
        endFillColor={colors.primary + '03'}
        xAxisLabelTextStyle={styles.labelStyle}
        yAxisTextStyle={styles.labelStyle}
        {...options}
      />
    </View>
  );
}