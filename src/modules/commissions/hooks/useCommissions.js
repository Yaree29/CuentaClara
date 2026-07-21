// =============================================================================
// useCommissions.js
// -------------------
// Estado de la pantalla de Comisiones: config por asistente, reporte del
// período (ventas reales, mismo criterio que useStaffPerformance.js) e
// historial de pagos. Cada fetch es independiente para no bloquear toda la
// pantalla si una sola llamada falla.
// =============================================================================
import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import commissionsService from '../services/commissionsService';

const firstDayOfMonthISO = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
};
const todayISO = () => new Date().toISOString().split('T')[0];

const useCommissions = () => {
  const [configs, setConfigs] = useState([]);
  const [report, setReport] = useState([]);
  const [payments, setPayments] = useState([]);
  const [totalPaid, setTotalPaid] = useState(0);
  const [loading, setLoading] = useState(true);

  const period = { from: firstDayOfMonthISO(), to: todayISO() };

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [configsData, reportData, paymentsData, totalData] = await Promise.all([
        commissionsService.getConfigs().catch(() => []),
        commissionsService.getReport(period.from, period.to).catch(() => []),
        commissionsService.getPayments().catch(() => []),
        commissionsService.getTotalPaid().catch(() => ({ total_paid: 0 })),
      ]);
      setConfigs(Array.isArray(configsData) ? configsData : []);
      setReport(Array.isArray(reportData) ? reportData : []);
      setPayments(Array.isArray(paymentsData) ? paymentsData : []);
      setTotalPaid(Number(totalData?.total_paid) || 0);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchAll();
    }, [fetchAll])
  );

  return { configs, report, payments, totalPaid, loading, period, refetch: fetchAll };
};

export default useCommissions;
