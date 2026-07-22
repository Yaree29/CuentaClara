// =============================================================================
// MODIFICADO: 2026-07-21
// Propósito: Hook para el componente InformalCredit. Integrado desde la rama
//            Fronted pero conectado a la API real (debtService) en lugar de
//            datos mock. Internamente orquesta customers + debts + payments.
//
// Cambios v2:
//   - Categorías de ordenamiento (más deuda, menos deuda, más abono, etc.)
//   - Modal de detalle al tocar un fiado
//   - Soporte para notas en el cliente
//   - Menú de tres puntos por tarjeta (notificar, editar, añadir nota)
//
// Modelo de "credit" expuesto al componente (forma plana para la UI):
//   { id, customerId, clientName, phone, totalDebt, originalAmount, items,
//     paidAmount, status, notes, lastUpdate }
// =============================================================================
import { useState, useMemo, useCallback } from 'react';
import { Linking, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import debtService, {
  buildDebtDescription,
  parseDebtDescription,
} from '../services/debtService';
import inventoryService from '../../inventory/services/inventoryService';
import useAuthStore from '../../../store/useAuthStore';

// Categorías de ordenamiento disponibles
export const SORT_CATEGORIES = [
  { key: 'recent',     label: 'Recientes' },
  { key: 'most_debt',  label: 'Mayor deuda' },
  { key: 'least_debt', label: 'Menor deuda' },
  { key: 'most_paid',  label: 'Más abono' },
  { key: 'least_paid', label: 'Menos abono' },
];

// Une la nota guardada en la descripción del fiado con la nota de la factura
// asociada. Un fiado creado desde Ventas guarda la misma nota en ambos lados,
// así que se deduplica (ignorando mayúsculas y espacios) para no mostrarla dos
// veces. Si son distintas, se muestran ambas en líneas separadas.
const mergeNotes = (...notes) => {
  const seen = new Set();
  const unique = [];

  for (const note of notes) {
    const clean = (note || '').trim();
    if (!clean) continue;

    const key = clean.toLowerCase();
    if (seen.has(key)) continue;

    seen.add(key);
    unique.push(clean);
  }

  return unique.join('\n');
};

// Errores de la gestión de clientes, en lenguaje del comerciante. El caso
// "todavía debe $X" ya viene redactado desde el backend y se deja tal cual,
// porque es la información concreta que el usuario necesita para actuar.
const friendlyCustomerError = (rawMessage) => {
  const msg = (rawMessage || '').toLowerCase();

  if (msg.includes('todavía debe')) return rawMessage;

  if (msg.includes('cliente no encontrado')) {
    return 'Este cliente ya no existe. Actualiza la lista e inténtalo de nuevo.';
  }

  if (msg.includes('sesión') || msg.includes('401')) {
    return 'Tu sesión se cerró. Vuelve a iniciar sesión para continuar.';
  }

  if (msg.includes('network') || msg.includes('fetch') || msg.includes('timeout')) {
    return 'No hay conexión con el servidor. Revisa tu internet e inténtalo otra vez.';
  }

  return 'No pudimos guardar los cambios. Inténtalo de nuevo en un momento.';
};

// Traduce los errores técnicos del backend a mensajes que entienda el dueño
// del negocio. Si aparece uno que no conocemos, damos una salida genérica pero
// accionable en vez de mostrar el texto crudo de la API.
const friendlyPaymentError = (rawMessage, remaining) => {
  const msg = (rawMessage || '').toLowerCase();

  if (msg.includes('supera el saldo')) {
    const limite = Number.isFinite(remaining) ? remaining.toFixed(2) : null;
    return limite
      ? `El abono es mayor que lo que te deben. Solo quedan $${limite} por pagar.`
      : 'El abono es mayor que lo que te deben en este fiado.';
  }

  if (msg.includes('ya está paid') || msg.includes('no acepta abonos')) {
    return 'Este fiado ya está pagado por completo, no hace falta anotar más abonos.';
  }

  if (msg.includes('ya está cancelled')) {
    return 'Este fiado fue eliminado, así que no se le pueden anotar abonos.';
  }

  if (msg.includes('deuda no encontrada')) {
    return 'No encontramos este fiado. Actualiza la lista e inténtalo de nuevo.';
  }

  if (msg.includes('sesión') || msg.includes('401')) {
    return 'Tu sesión se cerró. Vuelve a iniciar sesión para anotar el abono.';
  }

  if (msg.includes('network') || msg.includes('fetch') || msg.includes('timeout')) {
    return 'No hay conexión con el servidor. Revisa tu internet e inténtalo otra vez.';
  }

  return 'No pudimos guardar el abono en este momento. Inténtalo de nuevo en un momento.';
};

export const useInformalCredit = () => {
  const user = useAuthStore((state) => state.user);

  // Información del negocio obtenida desde el contexto del usuario autenticado
  const businessData = user?.business || {};

  const senderName =
    businessData?.name ||
    user?.name ||
    'Mi negocio';

  // Datos crudos de la API
  const [customers, setCustomers] = useState([]);
  const [debts, setDebts] = useState([]);
  const [inventoryProducts, setInventoryProducts] = useState([]);

  // UI
  const [searchQuery, setSearchQuery] = useState('');
  const [sortCategory, setSortCategory] = useState('recent');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Modales
  const [isFormModalVisible, setIsFormModalVisible] = useState(false);
  const [editingCredit, setEditingCredit] = useState(null);
  const [isPaymentModalVisible, setIsPaymentModalVisible] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);

  // Modal de detalle
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [detailCredit, setDetailCredit] = useState(null);
  const [detailPayments, setDetailPayments] = useState([]);
  const [loadingPayments, setLoadingPayments] = useState(false);

  // Modal de nota
  const [isNoteModalVisible, setIsNoteModalVisible] = useState(false);
  const [noteCredit, setNoteCredit] = useState(null);

  // Gestión de clientes: lista + ficha en edición
  const [isCustomersModalVisible, setIsCustomersModalVisible] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);

  // Carga inicial: customers + debts + inventario en paralelo
  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [customersData, debtsData, inventoryData] = await Promise.all([
        debtService.getCustomers(),
        debtService.getDebts(),
        inventoryService.getProducts().catch((e) => {
          console.error('[InformalCredit] Error al cargar inventario:', e);
          return [];
        }),
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

  // Recargar la libreta cada vez que la pestaña Fiado toma el foco, para que
  // los cambios hechos en otras pantallas (o el borrado de datos desde Perfil)
  // se reflejen al volver, sin tener que reabrir la app.
  useFocusEffect(
    useCallback(() => {
      fetchAll();
    }, [fetchAll])
  );

  // Construir el shape plano que espera la UI a partir de debts + customers
  const credits = useMemo(() => {
    const customersById = new Map(customers.map((c) => [c.id, c]));

    return debts.map((d) => {
      const customer = customersById.get(d.customer_id);
      const originalAmount = Number(d.original_amount) || 0;
      const remainingAmount = Number(d.remaining_amount) || 0;
      const { products, debtNote } = parseDebtDescription(d.description);

      return {
        id: String(d.id),
        customerId: d.customer_id,
        clientName: d.customer_name || customer?.name || 'Sin nombre',
        phone: d.customer_phone || customer?.phone || '',
        totalDebt: remainingAmount,
        originalAmount,
        paidAmount: originalAmount - remainingAmount,
        items: d.description || '',
        products,                                   // solo los productos fiados
        debtNote: mergeNotes(debtNote, d.invoice_notes), // nota del fiado + de la venta
        invoiceId: d.invoice_id || null,
        status: d.status || 'pending',
        notes: d.customer_notes || customer?.notes || '', // nota del cliente
        lastUpdate: d.created_at,
      };
    });
  }, [debts, customers]);

  // Lista de clientes para la pantalla de gestión, con sus totales ya
  // calculados a partir de las deudas que el hook ya tiene en memoria (no hace
  // falta pedirle nada más a la API). Se ordena poniendo primero a los que
  // deben plata: son los que el comerciante necesita ver.
  const customersWithStats = useMemo(() => {
    const statsById = new Map();

    for (const d of debts) {
      const id = d.customer_id;
      const remaining = Number(d.remaining_amount) || 0;
      const isOpen = ['pending', 'partial', 'overdue'].includes(d.status);

      const acc = statsById.get(id) || { totalDebt: 0, openDebts: 0 };
      acc.totalDebt += remaining;
      if (isOpen && remaining > 0) acc.openDebts += 1;
      statsById.set(id, acc);
    }

    return customers
      .map((c) => {
        const stats = statsById.get(c.id) || { totalDebt: 0, openDebts: 0 };
        return {
          id: c.id,
          name: c.name || 'Sin nombre',
          phone: c.phone || '',
          notes: c.notes || '',
          totalDebt: stats.totalDebt,
          openDebts: stats.openDebts,
          // Solo se puede eliminar a quien no deba nada: el backend valida lo
          // mismo, esto es para deshabilitar el botón antes de intentarlo.
          canDelete: stats.totalDebt <= 0,
        };
      })
      .sort((a, b) => {
        if (b.totalDebt !== a.totalDebt) return b.totalDebt - a.totalDebt;
        return a.name.localeCompare(b.name);
      });
  }, [customers, debts]);

  // Ordenamiento por categoría
  const sortedCredits = useMemo(() => {
    const sorted = [...credits];
    switch (sortCategory) {
      case 'most_debt':
        sorted.sort((a, b) => b.totalDebt - a.totalDebt);
        break;
      case 'least_debt':
        sorted.sort((a, b) => a.totalDebt - b.totalDebt);
        break;
      case 'most_paid':
        sorted.sort((a, b) => b.paidAmount - a.paidAmount);
        break;
      case 'least_paid':
        sorted.sort((a, b) => a.paidAmount - b.paidAmount);
        break;
      case 'recent':
      default:
        // Ya viene ordenado por created_at desc desde la API
        break;
    }
    return sorted;
  }, [credits, sortCategory]);

  const filteredCredits = useMemo(() => {
    if (!searchQuery) return sortedCredits;

    const q = searchQuery.toLowerCase();

    return sortedCredits.filter((c) =>
      c.clientName.toLowerCase().includes(q) ||
      c.items.toLowerCase().includes(q)
    );
  }, [sortedCredits, searchQuery]);

  // Busca cliente existente por nombre (case insensitive).
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
        await debtService.updateCustomer(editingCredit.customerId, {
          name: clientName,
          phone: cleanPhone || null,
        });

        await debtService.updateDebt(editingCredit.id, {
          amount,
          description: items || null,
        });
      } else {
        let customer = findCustomerByName(clientName);

        if (!customer) {
          customer = await debtService.createCustomer({
            name: clientName,
            phone: cleanPhone || null,
            notes: null,
          });
        } else if (cleanPhone && !customer.phone) {
          await debtService.updateCustomer(customer.id, {
            phone: cleanPhone,
          });
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

  // Registrar abono / pago.
  // Devuelve { ok, error } para que la UI muestre el mensaje en el propio
  // formulario, en lenguaje de tendero, en vez de un Alert genérico.
  const registerPayment = async (creditId, paymentAmount, remainingDebt) => {
    const amount = Number(paymentAmount);
    const remaining = Number(remainingDebt);

    if (!Number.isFinite(amount) || amount <= 0) {
      return {
        ok: false,
        error: 'Escribe cuánto te abonaron. Por ejemplo: 10.50',
      };
    }

    if (Number.isFinite(remaining) && amount > remaining) {
      return {
        ok: false,
        error:
          `El abono es mayor que lo que te deben. La deuda pendiente es de $${remaining.toFixed(2)}, ` +
          `así que puedes anotar hasta ese monto. Si te pagaron de más, anota $${remaining.toFixed(2)} ` +
          'y entrega el vuelto.',
      };
    }

    try {
      await debtService.registerPayment(creditId, {
        amount,
        method: 'cash',
      });

      setIsPaymentModalVisible(false);
      setSelectedClient(null);

      await fetchAll();
      return { ok: true };
    } catch (err) {
      console.error('Error al registrar abono:', err);
      return { ok: false, error: friendlyPaymentError(err?.message, remaining) };
    }
  };

  // WhatsApp reminder
  const sendWhatsAppReminder = (clientName, phone, amount) => {
    if (!phone || phone === '+507') {
      Alert.alert(
        'Sin número',
        `No tienes registrado un número válido para ${clientName}.`
      );
      return;
    }

    const text = `¡Hola *${clientName}*! 👋
    Te escribo de *${senderName}* para recordarte que tienes un saldo pendiente de *$${amount.toFixed(2)}* por tus compras.

    Por favor, confírmame cuándo podrías pasar a cancelarlo o abonar. ¡Gracias!`;

    const url = `whatsapp://send?phone=${phone.replace(
      '+',
      ''
    )}&text=${encodeURIComponent(text)}`;

    Linking.openURL(url).catch((err) => {
      console.error('Error al abrir WA', err);
      Alert.alert(
        'Error',
        'No se pudo abrir WhatsApp. Asegúrate de tenerlo instalado.'
      );
    });
  };

  // ── Gestión de clientes ────────────────────────────────────────────────────
  // Mismo contrato { ok, error } que registerPayment: la UI muestra el mensaje
  // dentro del formulario en vez de un Alert genérico.

  const saveCustomer = async (customerId, { name, phone, notes }) => {
    const cleanName = (name || '').trim();

    if (!cleanName) {
      return { ok: false, error: 'Escribe el nombre del cliente.' };
    }

    const digits = (phone || '').replace(/\D/g, '');
    if (digits && digits.length !== 8) {
      return {
        ok: false,
        error: 'El número de WhatsApp debe tener 8 dígitos. Déjalo vacío si no lo tienes.',
      };
    }

    // Evita dos fichas para la misma persona: si ya existe otro cliente activo
    // con ese nombre, el comerciante terminaría con la deuda partida en dos.
    const duplicate = customers.find(
      (c) => c.id !== customerId && c.name.trim().toLowerCase() === cleanName.toLowerCase()
    );
    if (duplicate) {
      return { ok: false, error: `Ya tienes un cliente llamado ${duplicate.name}.` };
    }

    try {
      await debtService.updateCustomer(customerId, {
        name: cleanName,
        phone: digits ? `+507${digits}` : null,
        notes: (notes || '').trim() || null,
      });
      await fetchAll();
      return { ok: true };
    } catch (err) {
      console.error('Error al guardar cliente:', err);
      return { ok: false, error: friendlyCustomerError(err?.message) };
    }
  };

  const removeCustomer = async (customerId) => {
    try {
      await debtService.deleteCustomer(customerId);
      await fetchAll();
      return { ok: true };
    } catch (err) {
      console.error('Error al eliminar cliente:', err);
      return { ok: false, error: friendlyCustomerError(err?.message) };
    }
  };

  // Guardar nota del cliente
  const saveNote = async (customerId, noteText) => {
    try {
      await debtService.updateCustomer(customerId, {
        notes: noteText.trim() || null,
      });
      setIsNoteModalVisible(false);
      setNoteCredit(null);
      await fetchAll();
    } catch (err) {
      console.error('Error al guardar nota:', err);
      Alert.alert('Error', err.message || 'No se pudo guardar la nota');
    }
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

  // Abrir detalle: carga pagos del fiado
  const openDetailModal = async (credit) => {
    setDetailCredit(credit);
    setIsDetailModalVisible(true);
    setLoadingPayments(true);
    try {
      const payments = await debtService.getPayments(credit.id);
      setDetailPayments(payments || []);
    } catch (err) {
      console.error('Error al cargar pagos:', err);
      setDetailPayments([]);
    } finally {
      setLoadingPayments(false);
    }
  };

  const closeDetailModal = () => {
    setIsDetailModalVisible(false);
    setDetailCredit(null);
    setDetailPayments([]);
  };

  const openNoteModal = (credit) => {
    setNoteCredit(credit);
    setIsNoteModalVisible(true);
  };

  const closeNoteModal = () => {
    setIsNoteModalVisible(false);
    setNoteCredit(null);
  };

  const openCustomersModal = () => {
    setEditingCustomer(null);
    setIsCustomersModalVisible(true);
  };

  const closeCustomersModal = () => {
    setIsCustomersModalVisible(false);
    setEditingCustomer(null);
  };

  return {
    // Datos
    searchQuery, setSearchQuery, filteredCredits, senderName, loading, error, refresh: fetchAll,
    inventoryProducts,

    // Categorías
    sortCategory, setSortCategory,

    // Modales
    isFormModalVisible, setIsFormModalVisible, editingCredit, isPaymentModalVisible,
    setIsPaymentModalVisible, selectedClient, openAddModal, openEditModal, openPaymentModal,

    // Detalle
    isDetailModalVisible, detailCredit, detailPayments, loadingPayments,
    openDetailModal, closeDetailModal,

    // Notas
    isNoteModalVisible, noteCredit, openNoteModal, closeNoteModal, saveNote,

    // Clientes
    customersWithStats, isCustomersModalVisible, openCustomersModal, closeCustomersModal,
    editingCustomer, setEditingCustomer, saveCustomer, removeCustomer,

    // Acciones
    saveCredit, registerPayment, sendWhatsAppReminder, deleteCredit,
  };
};