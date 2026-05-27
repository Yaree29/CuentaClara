// =============================================================================
// CREADO: 2026-05-26
// Propósito: Hook para el componente InformalCredit. Integrado desde la rama
//            Fronted pero conectado a la API real (debtService) en lugar de
//            datos mock. Internamente orquesta customers + debts + payments.
//
// Modelo de "credit" expuesto al componente (forma plana para la UI):
//   { id, customerId, clientName, phone, totalDebt, items, lastUpdate }
//   - id           → debt.id (string)
//   - customerId   → debt.customer_id (necesario para edit)
//   - clientName   → customer.name
//   - phone        → customer.phone (incluye prefijo +507)
//   - totalDebt    → debt.remaining_amount (número)
//   - items        → debt.description
//   - lastUpdate   → debt.created_at (ISO date)
// =============================================================================
import { useState, useEffect, useMemo, useCallback } from 'react';
import { Linking, Alert } from 'react-native';

import debtService from '../services/debtService';
import useAuthStore from '../../../store/useAuthStore';
import useUserStore from '../../../store/useUserStore';

// Lista para el selector rápido del modal "Nuevo fiado"
// Pendiente: reemplazar por GET /inventory cuando ese módulo exista.
export const MOCK_INVENTORY_QUICK_ADD = [
  { id: '1', name: 'Recarga $5', price: 5.00 },
  { id: '2', name: 'Recarga $3', price: 3.00 },
  { id: '3', name: 'Chances', price: 0.25 },
  { id: '4', name: 'Billetes', price: 1.00 },
  { id: '5', name: 'Pollo Guisado', price: 4.50 },
  { id: '6', name: 'Soda', price: 1.00 },
];

export const useInformalCredit = () => {
  const user = useAuthStore((state) => state.user);
  const businessData = useUserStore((state) => state.businessData);
  const senderName = businessData?.name || user?.name || 'mi negocio';

  // Datos crudos de la API
  const [customers, setCustomers] = useState([]);
  const [debts, setDebts] = useState([]);

  // UI
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Modales
  const [isFormModalVisible, setIsFormModalVisible] = useState(false);
  const [editingCredit, setEditingCredit] = useState(null);
  const [isPaymentModalVisible, setIsPaymentModalVisible] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);

  // Carga inicial: customers + debts en paralelo
  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [customersData, debtsData] = await Promise.all([
        debtService.getCustomers(),
        debtService.getDebts(),
      ]);
      setCustomers(customersData || []);
      setDebts(debtsData || []);
    } catch (err) {
      console.error('Error al cargar fiados:', err);
      setError(err.message || 'Error al cargar fiados');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // Construir el shape plano que espera la UI a partir de debts + customers
  const credits = useMemo(() => {
    const customersById = new Map(customers.map((c) => [c.id, c]));
    return debts.map((d) => {
      const customer = customersById.get(d.customer_id);
      return {
        id: String(d.id),
        customerId: d.customer_id,
        clientName: d.customer_name || customer?.name || 'Sin nombre',
        phone: customer?.phone || '',
        totalDebt: Number(d.remaining_amount) || 0,
        items: d.description || '',
        lastUpdate: d.created_at,
      };
    });
  }, [debts, customers]);

  const filteredCredits = useMemo(() => {
    if (!searchQuery) return credits;
    const q = searchQuery.toLowerCase();
    return credits.filter((c) => c.clientName.toLowerCase().includes(q));
  }, [credits, searchQuery]);

  // Busca cliente existente por nombre (case insensitive). El backend no expone
  // búsqueda por nombre, así que filtramos localmente sobre los ya cargados.
  const findCustomerByName = (name) => {
    const target = name.trim().toLowerCase();
    return customers.find((c) => c.name.toLowerCase() === target) || null;
  };

  // Crear o editar un fiado
  const saveCredit = async (creditData) => {
    const cleanPhone =
      creditData.phone && creditData.phone.trim() !== '+507'
        ? creditData.phone
        : '';
    const clientName = creditData.clientName.trim();
    const amount = Number(creditData.totalDebt) || 0;
    const items = creditData.items?.trim() || '';

    if (!clientName || amount <= 0) {
      Alert.alert('Datos incompletos', 'Nombre y monto son obligatorios.');
      return;
    }

    try {
      if (editingCredit) {
        // Editar: actualizar cliente (nombre + phone) y deuda (amount + description)
        await debtService.updateCustomer(editingCredit.customerId, {
          name: clientName,
          phone: cleanPhone || null,
        });
        await debtService.updateDebt(editingCredit.id, {
          amount,
          description: items || null,
        });
      } else {
        // Crear: si el cliente ya existe, lo reutilizamos; si no, lo creamos
        let customer = findCustomerByName(clientName);
        if (!customer) {
          customer = await debtService.createCustomer({
            name: clientName,
            phone: cleanPhone || null,
            notes: null,
          });
        } else if (cleanPhone && !customer.phone) {
          // Si el cliente existía sin teléfono y ahora se proveyó uno, lo actualizamos
          await debtService.updateCustomer(customer.id, { phone: cleanPhone });
        }
        await debtService.createDebt({
          customer_id: customer.id,
          amount,
          description: items || null,
        });
      }

      setIsFormModalVisible(false);
      setEditingCredit(null);
      await fetchAll();
    } catch (err) {
      console.error('Error al guardar fiado:', err);
      Alert.alert('Error', err.message || 'No se pudo guardar el fiado');
    }
  };

  // Eliminar (soft delete vía cancel)
  const deleteCredit = async (creditId) => {
    try {
      await debtService.cancelDebt(creditId);
      setIsFormModalVisible(false);
      setEditingCredit(null);
      await fetchAll();
    } catch (err) {
      console.error('Error al eliminar fiado:', err);
      Alert.alert('Error', err.message || 'No se pudo eliminar el fiado');
    }
  };

  // Registrar abono / pago
  const registerPayment = async (creditId, paymentAmount) => {
    const amount = Number(paymentAmount) || 0;
    if (amount <= 0) {
      Alert.alert('Monto inválido', 'Ingresa un monto mayor a cero.');
      return;
    }

    try {
      await debtService.registerPayment(creditId, {
        amount,
        method: 'cash',
      });
      setIsPaymentModalVisible(false);
      setSelectedClient(null);
      await fetchAll();
    } catch (err) {
      console.error('Error al registrar abono:', err);
      Alert.alert('Error', err.message || 'No se pudo registrar el abono');
    }
  };

  // WhatsApp reminder (lógica intacta de Fronted)
  const sendWhatsAppReminder = (clientName, phone, amount) => {
    if (!phone || phone === '+507') {
      Alert.alert('Sin número', `No tienes registrado un número válido para ${clientName}.`);
      return;
    }
    const text = `¡Hola *${clientName}*! 👋\nTe escribo de *${senderName}* para recordarte que tienes un saldo pendiente de *$${amount.toFixed(2)}* por tus compras.\n\nPor favor, confírmame cuándo podrías pasar a cancelarlo o abonar. ¡Gracias!`;
    const url = `whatsapp://send?phone=${phone.replace('+', '')}&text=${encodeURIComponent(text)}`;
    Linking.openURL(url).catch((err) => {
      console.error('Error al abrir WA', err);
      Alert.alert('Error', 'No se pudo abrir WhatsApp. Asegúrate de tenerlo instalado.');
    });
  };

  const openAddModal = () => {
    setEditingCredit(null);
    setIsFormModalVisible(true);
  };
  const openEditModal = (credit) => {
    setEditingCredit(credit);
    setIsFormModalVisible(true);
  };
  const openPaymentModal = (client) => {
    setSelectedClient(client);
    setIsPaymentModalVisible(true);
  };

  return {
    // datos
    searchQuery, setSearchQuery, filteredCredits, senderName,
    loading, error, refresh: fetchAll,
    // modales
    isFormModalVisible, setIsFormModalVisible, editingCredit,
    isPaymentModalVisible, setIsPaymentModalVisible, selectedClient,
    openAddModal, openEditModal, openPaymentModal,
    // acciones
    saveCredit, registerPayment, sendWhatsAppReminder, deleteCredit,
  };
};
