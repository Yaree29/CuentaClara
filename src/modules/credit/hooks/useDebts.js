import { useState, useEffect } from 'react';
import debtService from '../services/debtService';

export const useDebts = () => {
  const [debts, setDebts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalReceivable, setTotalReceivable] = useState(0);

  const fetchDebts = async () => {
    setLoading(true);
    try {
      const data = await debtService.getDebts();
      setDebts(data);
      const total = data.reduce((acc, curr) => acc + curr.amount, 0);
      setTotalReceivable(total);
    } catch (error) {
      console.error("Error al cargar fiados:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDebts();
  }, []);

  return {
    debts,
    loading,
    totalReceivable,
    refresh: fetchDebts
  };
};