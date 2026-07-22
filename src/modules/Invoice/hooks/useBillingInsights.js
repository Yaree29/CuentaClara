import { useCallback, useEffect, useState } from 'react';
import billingService from '../services/billingService';

const rangeForDays = (days) => {
  const now = new Date();
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  const start = new Date(end);
  start.setDate(start.getDate() - (days - 1));
  start.setHours(0, 0, 0, 0);
  return { dateFrom: start.toISOString(), dateTo: end.toISOString() };
};

// Ganancias/Márgenes/Productos vendidos reales de MiRUC, vía
// GET /invoices/reports/profitability (owner/admin). Sin datos mock: si el
// backend marca has_missing_cost, el margen de esa factura/producto/total
// se reporta como no disponible en vez de inventarlo.
export const useBillingInsights = (initialRangeDays = 30) => {
  const [rangeDays, setRangeDays] = useState(initialRangeDays);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchInsights = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { dateFrom, dateTo } = rangeForDays(rangeDays);
      const result = await billingService.getProfitability(dateFrom, dateTo);
      setData(result);
    } catch (err) {
      setError(err.message || 'No se pudo cargar el reporte de ganancias y márgenes.');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [rangeDays]);

  useEffect(() => {
    fetchInsights();
  }, [fetchInsights]);

  return {
    data,
    loading,
    error,
    rangeDays,
    setRangeDays,
    refresh: fetchInsights,
  };
};

export default useBillingInsights;
