import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../../../theme/colors';
import salesService from '../../sales/services/salesService';
import DashboardGreeting from './shared/DashboardGreeting';

const todayISO = () => new Date().toISOString().split('T')[0];

const PymeDashboard = () => {
  const [todayIncome, setTodayIncome] = useState(0);

  const fetchTodayIncome = useCallback(async () => {
    try {
      const today = todayISO();
      const data = await salesService.getProfitsAndExpenses(today, today);
      setTodayIncome(Number(data?.income) || 0);
    } catch {
      setTodayIncome(0);
    }
  }, []);

  useEffect(() => {
    fetchTodayIncome();
  }, [fetchTodayIncome]);

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <DashboardGreeting todayIncome={todayIncome} />

      <View style={styles.container}>
        <Ionicons name="construct-outline" size={48} color={colors.textMuted} />
        <Text style={styles.title}>Dashboard en construcción</Text>
        <Text style={styles.subtitle}>
          Estamos preparando el nuevo panel para cuentas PYME. Vuelve pronto.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 60,
  },
  title: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    marginTop: 8,
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});

export default PymeDashboard;
