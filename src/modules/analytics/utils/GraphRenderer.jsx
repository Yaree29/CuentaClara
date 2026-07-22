import React, { useMemo, useState } from 'react';
import {View,Text,ScrollView,Dimensions,} from 'react-native';

import LineChart from '../utils/charts/LineChart';
import BarChart from '../utils/charts/BarChart';
import HorizontalBarChart from '../utils/charts/HorizontalBarChart';
import PieChart from '../utils/charts/PieChart';
import DonutChart from '../utils/charts/DonutChart';
import AreaChart from '../utils/charts/AreaChart';

import styles from '../styles/GraphRenderer.styles';

const { width } = Dimensions.get('window');

const CARD_WIDTH = width * 0.88;
const CARD_SPACING = 16;

const CHART_WIDTH = CARD_WIDTH - 32;

const ChartComponents = {
  line: LineChart,
  bar: BarChart,
  horizontalBar: HorizontalBarChart,
  pie: PieChart,
  donut: DonutChart,
  area: AreaChart,
};

const UnsupportedChart = ({ graph }) => (
  <View style={styles.fallbackContainer}>
    <Text style={styles.fallbackText}>
      Tipo de gráfica "{graph.type}" no soportado.
    </Text>
  </View>
);

const GraphCard = ({ graph, carousel }) => {
  const ChartComponent = ChartComponents[graph.type];

  return (
    <View
      style={[
        styles.graphCard,
        carousel && styles.carouselCard,
      ]}
    >
      <Text style={styles.graphTitle}>
        {graph.title}
      </Text>

      {!!graph.description && (
        <Text style={styles.graphDescription}>
          {graph.description}
        </Text>
      )}

      <View style={styles.chartWrapper}>
        {ChartComponent ? (
          <ChartComponent
            data={graph.data}
            options={graph.options}
            chartWidth={CHART_WIDTH}
          />
        ) : (
          <UnsupportedChart graph={graph} />
        )}
      </View>
    </View>
  );
};

const GraphRenderer = ({ graphs = [] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const carousel = useMemo(
    () => graphs.length > 2,
    [graphs]
  );

  if (!graphs.length) return null;

  const handleScrollEnd = (event) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(
      offsetX / (CARD_WIDTH + CARD_SPACING)
    );
    setCurrentIndex(index);
  };

  if (!carousel) {
    return (
      <View style={styles.container}>
        <View style={styles.verticalList}>
          {graphs.map((graph,index)=>(
            <GraphCard
              key={graph.id || index}
              graph={graph}
              carousel={false}
            />
          ))}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>

      <ScrollView
        horizontal
        pagingEnabled
        decelerationRate="fast"
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScrollEnd}
        contentContainerStyle={styles.carousel}
      >

        {graphs.map((graph,index)=>(
          <GraphCard
            key={graph.id || index}
            graph={graph}
            carousel
          />
        ))}
      </ScrollView>

      <View style={styles.pagination}>
        {graphs.map((graph,index)=>(
          <View
            key={graph.id || index}
            style={[
              styles.paginationDot,
              currentIndex === index &&
              styles.activeDot,
            ]}
          />
        ))}
      </View>
    </View>
  );
};


export default React.memo(GraphRenderer);