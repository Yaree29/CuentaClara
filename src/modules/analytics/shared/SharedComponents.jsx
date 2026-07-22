import React from 'react';
import { View, Text } from 'react-native';

import styles from '../styles/StrategicAnalysisScreen.styles';
import GraphRenderer from '../utils/GraphRenderer';


export const MetricCard = ({ label, value }) => (
  <View style={styles.cardContainer}>
    <Text style={styles.cardLabel}>{label}</Text>
    <Text style={styles.cardValue}>{value}</Text>
  </View>
);

export const TablePlaceholder = ({ title }) => (
  <View style={styles.tableContainer}>
    <Text style={styles.tableTitle}>{title}</Text>

    <View style={styles.tableBox}>
      <Text style={styles.tablePlaceholderText}>
        [Tabla de datos]
      </Text>
    </View>
  </View>
);

export const CalendarPlaceholder = ({ title }) => (
  <View style={styles.calendarContainer}>
    <Text style={styles.calendarTitle}>{title}</Text>

    <View style={styles.calendarBox}>
      <Text style={styles.calendarPlaceholderText}>
        [Vista de Calendario]
      </Text>
    </View>
  </View>
);

export const SectionLayout = ({
  title,
  icon,
  data = {},
}) => {
  const {
    cards = [],
    charts = [],
    tables = [],
    calendars = [],
  } = data;

  return (
    <View style={styles.sectionContainer}>

      <Text style={styles.sectionTitle}>
        {icon} {title}
      </Text>

      {!!cards.length && (
        <View style={styles.cardsRow}>
          {cards.map((card) => (
            <MetricCard
              key={card.label}
              label={card.label}
              value={card.value}
            />
          ))}
        </View>
      )}


      {!!charts.length && (
        <View style={styles.chartsWrapper}>
          <GraphRenderer graphs={charts} />
        </View>
      )}

      {!!tables.length && (
        <View style={styles.tablesWrapper}>
          {tables.map((table) => (
            <TablePlaceholder
              key={table.label}
              title={table.label}
            />
          ))}
        </View>
      )}

      {!!calendars.length && (
        <View style={styles.calendarsWrapper}>
          {calendars.map((calendar) => (
            <CalendarPlaceholder
              key={calendar.label}
              title={calendar.label}
            />
          ))}
        </View>
      )}
    </View>
  );
};