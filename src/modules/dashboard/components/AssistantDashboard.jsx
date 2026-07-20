// =============================================================================
// AssistantDashboard.jsx — Fase D del Modo Asistente
// -----------------------------------------------------------------------------
// Home simplificado que ve un asistente activo: saludo con su nombre (no el
// del dueño) + resumen de SUS ventas del día únicamente. Sin acceso a cifras
// del negocio completo (ganancias, gastos, otros asistentes) — el backend ya
// filtra por assistant_id en GET /sales/profits, así que ni siquiera llega a
// este componente el resto de la data.
// =============================================================================
import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import salesService from '../../sales/services/salesService';
import useAssistantModeStore from '../../../store/useAssistantModeStore';
import styles from './styles/InformalDashboard.styles';
import colors from '../../../theme/colors';

const todayISO = () => new Date().toISOString().split('T')[0];

const ACCESS_LABELS = {
  sales: 'Ventas',
  inventory: 'Inventario',
  both: 'Ventas e Inventario',
};

const AssistantDashboard = () => {
  const activeAssistant = useAssistantModeStore((state) => state.activeAssistant);

  const [loading, setLoading] = useState(true);
  const [todayIncome, setTodayIncome] = useState(0);
  const [salesCount, setSalesCount] = useState(0);

  const fetchOwnSales = useCallback(async () => {
    if (!activeAssistant) return;
    const today = todayISO();
    try {
      const data = await salesService.getProfitsAndExpenses(today, today, activeAssistant.id);
      setTodayIncome(Number(data?.income) || 0);
      setSalesCount(Number(data?.invoices_count) || 0);
    } catch {
      setTodayIncome(0);
      setSalesCount(0);
    }
  }, [activeAssistant]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await fetchOwnSales();
      setLoading(false);
    })();
  }, [fetchOwnSales]);

  // Refresca al volver a Home (ej. después de guardar una venta y regresar).
  useFocusEffect(
    useCallback(() => {
      fetchOwnSales();
    }, [fetchOwnSales])
  );

  if (!activeAssistant) return null;

  return (
    <View style={styles.container}>
      <View style={styles.welcomeContainer}>
        <View>
          <Text style={styles.welcomeTitle}>
            <Text style={styles.welcomeTitleRegular}>¡Hola, </Text>
            <Text style={styles.welcomeTitleBold}>{activeAssistant.name}</Text>
            <Text style={styles.welcomeTitleRegular}>!</Text>
          </Text>
          <Text style={styles.welcomeSubtitle}>
            Acceso: {ACCESS_LABELS[activeAssistant.access_type] || activeAssistant.access_type}
          </Text>
        </View>
      </View>

      <View style={styles.mainCard}>
        <View style={styles.mainCardHeader}>
          <Text style={styles.mainCardTitle}>Tus ventas de hoy</Text>
        </View>

        {loading ? (
          <ActivityIndicator size="small" color={colors.textWhite} />
        ) : (
          <>
            <Text style={styles.mainCardAmount}>${todayIncome.toFixed(2)}</Text>
            <Text style={styles.mainCardSubtext}>
              {salesCount === 0
                ? 'Aún no registras ventas hoy'
                : `${salesCount} ${salesCount === 1 ? 'venta registrada' : 'ventas registradas'}`}
            </Text>
          </>
        )}
      </View>
    </View>
  );
};

export default AssistantDashboard;
