import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import tipsService from '../services/tipsService';

const firstDayOfMonthISO = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
};
const todayISO = () => new Date().toISOString().split('T')[0];

const useTips = () => {
  const [tips, setTips] = useState([]);
  const [summary, setSummary] = useState({ total: 0, count: 0 });
  const [monthlySummary, setMonthlySummary] = useState([]);
  const [loading, setLoading] = useState(true);

  const period = { from: firstDayOfMonthISO(), to: todayISO() };
  const year = new Date().getFullYear();

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [tipsData, summaryData, monthlyData] = await Promise.all([
        tipsService.getTips().catch(() => []),
        tipsService.getSummary(period.from, period.to).catch(() => ({ total: 0, count: 0 })),
        tipsService.getMonthlySummary(year).catch(() => []),
      ]);
      setTips(Array.isArray(tipsData) ? tipsData : []);
      setSummary(summaryData || { total: 0, count: 0 });
      setMonthlySummary(Array.isArray(monthlyData) ? monthlyData : []);
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

  return { tips, summary, monthlySummary, loading, period, refetch: fetchAll };
};

export default useTips;
