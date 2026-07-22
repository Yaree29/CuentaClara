import React from 'react';
import { View } from 'react-native';
import { BarChart as GiftedBarChart } from 'react-native-gifted-charts';
import colors from '../../../../theme/colors'
import styles, { screenWidth } from './styles/BarChart.styles';

export default function BarChart({ data, options }) {
  const chartData =
    data?.labels?.map((label, index) => ({
      value: data.datasets[0].data[index] || 0,
      label,
    })) || [];

  return (
    <View style={styles.container}>
      <GiftedBarChart
        data={chartData}
        width={screenWidth - 60}
        height={200}
        barWidth={28}
        spacing={20}
        frontColor={colors.primaryLight}
        roundedTop
        noOfSections={4}
        xAxisLabelTextStyle={styles.labelStyle}
        yAxisTextStyle={styles.labelStyle}
        {...options}
      />
    </View>
  );
}