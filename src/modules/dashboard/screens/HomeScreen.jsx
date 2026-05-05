import React from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import MainLayout from '../../../views/layouts/MainLayout';
import { useDashboard } from '../hooks/useDashboard';
import styles from '../styles/home.styles';

const HomeScreen = () => {
  const { metrics, loading } = useDashboard();

  if (loading) {
    return (
      <MainLayout>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.greeting}>Panel de Control</Text>
        <Text style={styles.date}>Resumen de hoy</Text>

        <View style={styles.grid}>
          {metrics?.cards.map((card) => (
            <View key={card.id} style={styles.card}>
              <Text style={styles.cardTitle}>{card.title}</Text>
              <Text style={styles.cardValue}>{card.value}</Text>
              {card.trend && (
                <Text style={styles.cardTrend}>{card.trend}</Text>
              )}
            </View>
          ))}
        </View>

        {metrics?.charts && (
          <View style={styles.chartPlaceholder}>
            <Text style={styles.placeholderText}>Gráficos Avanzados (Solo PYME)</Text>
          </View>
        )}
      </ScrollView>
    </MainLayout>
  );
};

export default HomeScreen;