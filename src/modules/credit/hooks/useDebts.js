// =============================================================================
// MODIFICADO: 2026-05-26
// Propósito: Hook del módulo credit. Ahora consume datos reales de la API
//            (vía debtService). Agrega operaciones para crear cliente, crear
//            fiado y registrar abono — el módulo antes era de solo lectura
//            sobre datos mock.
// =============================================================================
import { useState, useEffect, useCallback } from 'react';
import debtService from '../services/debtService';

export const useDebts = () => {
  const [debts, setDebts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalReceivable, setTotalReceivable] = useState(0);

  // Carga inicial: clientes + deudas abiertas
  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [debtsData, customersData] = await Promise.all([
        debtService.getDebts(),
        debtService.getCustomers(),
      ]);
      setDebts(debtsData);
      setCustomers(customersData);
      const total = debtsData.reduce(
        (acc, d) => acc + Number(d.remaining_amount || 0),
        0
      );
      setTotalReceivable(total);
    } catch (err) {
      const msg = err.message || 'Error al cargar fiados';
      setError(msg);
      console.error('Error al cargar fiados:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // --- Operaciones ---

  const createCustomer = async (payload) => {
    setError(null);
    try {
      const newCustomer = await debtService.createCustomer(payload);
      // Refrescar lista para mantener orden por nombre
      const refreshed = await debtService.getCustomers();
      setCustomers(refreshed);
      return newCustomer;
    } catch (err) {
      const msg = err.message || 'Error al crear cliente';
      setError(msg);
      throw err;
    }
  };

  const createDebt = async (payload) => {
    setError(null);
    try {
      const newDebt = await debtService.createDebt(payload);
      // Refrescar deudas para recibir la lista con join de customer_name
      await fetchAll();
      return newDebt;
    } catch (err) {
      const msg = err.message || 'Error al crear fiado';
      setError(msg);
      throw err;
    }
  };

  const registerPayment = async (debtId, payload) => {
    setError(null);
    try {
      const result = await debtService.registerPayment(debtId, payload);
      // Refrescar para reflejar nuevo saldo / status (la deuda puede haber salido del listado si quedó en 'paid')
      await fetchAll();
      return result;
    } catch (err) {
      const msg = err.message || 'Error al registrar abono';
      setError(msg);
      throw err;
    }
  };

  return {
    debts,
    customers,
    loading,
    error,
    totalReceivable,
    refresh: fetchAll,
    createCustomer,
    createDebt,
    registerPayment,
  };
};
