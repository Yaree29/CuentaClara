// =============================================================================
// CREADO: 2026-05-27
// Propósito: Hook que alimenta el dashboard resumen (InformalDashboard).
//            Consulta en paralelo, vía la API de FastAPI (NUNCA Supabase
//            directo), datos de los 3 módulos del negocio:
//
//              · Ventas       → ingresos del día (salesService.getProfitsAndExpenses)
//              · Fiado        → total por cobrar y clientes únicos (debtService.getDebts)
//              · Inventario   → últimos movimientos y productos con stock crítico
//                               (inventoryService.getMovements + lowStockAlerts)
//
// Notas:
//   - Cualquier llamada que falle se "absorbe" con .catch(() => default) para
//     que la pantalla siga funcionando aunque uno de los módulos no responda.
//   - Se exponen helpers ya formateados (totalIncome, totalDebt, etc.) para
//     que el componente no haga lógica extra de cálculo.
// =============================================================================
import { useState, useCallback, useRef } from 'react';
import { useFocusEffect } from '@react-navigation/native';

import salesService from '../../sales/services/salesService';
import debtService from '../../credit/services/debtService';
import inventoryService from '../../inventory/services/inventoryService';

const todayISO = () => new Date().toISOString().split('T')[0];

export const useInformalDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Ventas del día
  const [todayIncome, setTodayIncome] = useState(0);

  // Fiado (suma de remaining_amount + cantidad de clientes únicos con deuda)
  const [totalDebt, setTotalDebt] = useState(0);
  const [debtorsCount, setDebtorsCount] = useState(0);

  // Últimos 3 movimientos de inventario
  const [recentMovements, setRecentMovements] = useState([]);

  // Productos con stock bajo (los 4 más críticos)
  const [lowStockProducts, setLowStockProducts] = useState([]);

  const fetchAll = useCallback(async () => {
    const today = todayISO();

    const [salesData, debtsData, movementsData, lowStockData] = await Promise.all([
      salesService
        .getProfitsAndExpenses(today, today)
        .catch(() => ({ income: 0 })),
      debtService.getDebts().catch(() => []),
      inventoryService.getMovements(3).catch(() => []),
      inventoryService.lowStockAlerts().catch(() => []),
    ]);

    setTodayIncome(Number(salesData?.income) || 0);

    const debts = Array.isArray(debtsData) ? debtsData : [];
    const sum = debts.reduce((acc, d) => acc + (Number(d.remaining_amount) || 0), 0);
    const uniqueCustomers = new Set(
      debts
        .filter((d) => Number(d.remaining_amount) > 0)
        .map((d) => d.customer_id),
    );
    setTotalDebt(sum);
    setDebtorsCount(uniqueCustomers.size);

    setRecentMovements(Array.isArray(movementsData) ? movementsData : []);
    setLowStockProducts(Array.isArray(lowStockData) ? lowStockData.slice(0, 4) : []);
  }, []);

  // Recargar el resumen cada vez que el Inicio toma el foco. Así, tras
  // registrar una venta/fiado o borrar los datos desde Perfil, al volver al
  // dashboard las cifras ya aparecen actualizadas. La primera vez muestra el
  // spinner; las siguientes son silenciosas (sin parpadeo).
  const hasLoadedRef = useRef(false);
  useFocusEffect(
    useCallback(() => {
      let active = true;
      (async () => {
        if (!hasLoadedRef.current) setLoading(true);
        try {
          await fetchAll();
        } finally {
          if (active) {
            setLoading(false);
            hasLoadedRef.current = true;
          }
        }
      })();
      return () => { active = false; };
    }, [fetchAll])
  );

  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchAll();
    } finally {
      setRefreshing(false);
    }
  }, [fetchAll]);

  return {
    loading,
    refreshing,
    refresh,
    todayIncome,
    totalDebt,
    debtorsCount,
    recentMovements,
    lowStockProducts,
  };
};

export default useInformalDashboard;
