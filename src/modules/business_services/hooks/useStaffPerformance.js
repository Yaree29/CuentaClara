// =============================================================================
// useStaffPerformance.js
// -----------------------------------------------------------------------------
// Reemplaza staffMocks.js en ServicesScreen.jsx: cruza los asistentes activos
// (assistantsService.getActiveAssistants(), incluye `role`) con sus ventas del
// día (salesService.getProfitsAndExpenses por asistente).
//
// GET /sales/profits solo acepta un assistant_id a la vez (ver
// sales_service.py:140 — sin soporte de "todos los asistentes en una sola
// llamada"). No se extiende el backend para esto: el máximo de asistentes por
// negocio es 3 (MAX_ASSISTANTS_PER_BUSINESS en assistants_service.py), así que
// 3 llamadas en paralelo (Promise.all) es trivial y no justifica un endpoint
// nuevo tipo "resumen por asistente".
//
// No existe ninguna tabla/columna de comisión en el schema — `commission`
// queda explícitamente en null (no se inventa el dato); la UI debe mostrarlo
// como "No configurado".
// =============================================================================
import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import assistantsService from '../../assistants/services/assistantsService';
import salesService from '../../sales/services/salesService';

const todayISO = () => new Date().toISOString().split('T')[0];

const useStaffPerformance = () => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchStaffPerformance = useCallback(async () => {
    setLoading(true);
    try {
      const assistants = await assistantsService.getActiveAssistants();
      const today = todayISO();

      const results = await Promise.all(
        (Array.isArray(assistants) ? assistants : []).map(async (assistant) => {
          try {
            const data = await salesService.getProfitsAndExpenses(today, today, assistant.id);
            return {
              id: assistant.id,
              name: assistant.name,
              role: assistant.role || null,
              completed: Number(data?.invoices_count) || 0,
              income: Number(data?.income) || 0,
              commission: null,
            };
          } catch (error) {
            return {
              id: assistant.id,
              name: assistant.name,
              role: assistant.role || null,
              completed: 0,
              income: 0,
              commission: null,
            };
          }
        })
      );

      setStaff(results);
    } catch (error) {
      setStaff([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchStaffPerformance();
    }, [fetchStaffPerformance])
  );

  const summary = {
    totalServices: staff.reduce((total, member) => total + member.completed, 0),
    totalIncome: staff.reduce((total, member) => total + member.income, 0),
    activeStaff: staff.length,
  };

  return { staff, summary, loading, refetch: fetchStaffPerformance };
};

export default useStaffPerformance;
