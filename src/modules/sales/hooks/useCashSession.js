// =============================================================================
// useCashSession.js
// -----------------------------------------------------------------------------
// Única fuente de estado de caja para las 3 pestañas de Ventas PYME (Ventas /
// Registro de Ventas / Cierre Diario). Se monta una sola vez en el shell
// (salesPyme.jsx) y se pasa por props — evita 3 fetches independientes y
// permite mostrar el aviso de cierre desde el shell sin importar qué pestaña
// esté activa.
//
// Refresca en foco (useFocusEffect) y con un poll ligero mientras está
// montado, para detectar el cruce de la hora de cierre configurada sin
// depender de push/backend scheduler (no hay ninguno en este proyecto —
// misma decisión que llevó a eliminar FCM).
// =============================================================================
import { useCallback, useRef, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import cashService from '../services/cashService';
import expensesService from '../services/expensesService';

const POLL_INTERVAL_MS = 45000;

const useCashSession = () => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const statusRef = useRef(null);

  const refresh = useCallback(async () => {
    try {
      const data = await cashService.getSessionStatus();
      statusRef.current = data;
      setStatus(data);
    } catch (error) {
      console.error('Error cargando estado de caja:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      refresh();
      const interval = setInterval(refresh, POLL_INTERVAL_MS);
      return () => clearInterval(interval);
    }, [refresh])
  );

  const openSession = useCallback(async (openingAmount) => {
    await cashService.openSession(openingAmount);
    await refresh();
  }, [refresh]);

  const closeSession = useCallback(async (countedAmount) => {
    const result = await cashService.closeSession(countedAmount);
    await refresh();
    return result;
  }, [refresh]);

  const registerExpense = useCallback(async ({ amount, description }) => {
    await expensesService.createExpense({
      amount,
      description,
      cashSessionId: statusRef.current?.session?.id,
    });
    await refresh();
  }, [refresh]);

  return {
    status,
    loading,
    refresh,
    openSession,
    closeSession,
    registerExpense,
  };
};

export default useCashSession;
