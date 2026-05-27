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
import inventoryService from '../../inventory/services/inventoryService';
import useAuthStore from '../../../store/useAuthStore';
import useUserStore from '../../../store/useUserStore';

export const useInformalCredit = () => {
  const user = useAuthStore((state) => state.user);
  const businessData = useUserStore((state) => state.businessData);
  const senderName = businessData?.name || user?.name || 'mi negocio';

  // Datos crudos de la API
  const [customers, setCustomers] = useState([]);
  const [debts, setDebts] = useState([]);
  const [inventoryProducts, setInventoryProducts] = useState([]);

  // UI
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Modales
  const [isFormModalVisible, setIsFormModalVisible] = useState(false);
  const [editingCredit, setEditingCredit] = useState(null);
  const [isPaymentModalVisible, setIsPaymentModalVisible] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);

  // Carga inicial: customers + debts + inventario en paralelo
  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [customersData, debtsData, inventoryData] = await Promise.all([
        debtService.getCustomers(),
        debtService.getDebts(),
        inventoryService.getProducts().catch(() => []),
      ]);
      setCustomers(customersData || []);
      setDebts(debtsData || []);
      setInventoryProducts(inventoryData || []);
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
        // Editar: actualizar cliente (nombre + phone) y solo la descripción de la deuda.
        // NO se envía amount porque el monto original no cambia al editar; los abonos
        // se registran por separado y el backend recalcula remaining_amount desde
        // original_amount, por lo que enviar remaining_amount aquí lo reduciría de nuevo.
        await debtService.updateCustomer(editingCredit.customerId, {
          name: clientName,
          phone: cleanPhone || null,
        });
        await debtService.updateDebt(editingCredit.id, {
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
    inventoryProducts,
    // modales
    isFormModalVisible, setIsFormModalVisible, editingCredit,
    isPaymentModalVisible, setIsPaymentModalVisible, selectedClient,
    openAddModal, openEditModal, openPaymentModal,
    // acciones
    saveCredit, registerPayment, sendWhatsAppReminder, deleteCredit,
  };
};
