//hook para manejar la logica del modulo de fiados

import { useState } from 'react';
import { Linking, Alert } from 'react-native';

//importacion local para manejo de autenticacion y datos de usuario
import useAuthStore from '../../../store/useAuthStore';
import useUserStore from '../../../store/useUserStore';

// Datos simulados de Inventario para el selector rápido
export const MOCK_INVENTORY_QUICK_ADD = [
  { id: '1', name: 'Recarga $5', price: 5.00 },
  { id: '2', name: 'Recarga $3', price: 3.00 },
  { id: '3', name: 'Chances', price: 0.25 },
  { id: '4', name: 'Billetes', price: 1.00 },
  { id: '5', name: 'Pollo Guisado', price: 4.50 },
  { id: '6', name: 'Soda', price: 1.00 },
];

// Datos simulados (Mock Data) de clientes con fiados
const MOCK_CREDITS = [
  { id: '1', clientName: 'Doña María', phone: '+50760000001', totalDebt: 15.50, items: '2 Pollo guisado, 1 Soda', lastUpdate: '2026-05-20' },
  { id: '2', clientName: 'Carlos Alvarado', phone: '+50760000002', totalDebt: 8.00, items: 'Recarga $5, Snacks', lastUpdate: '2026-05-25' },
  { id: '3', clientName: 'Chompiras', phone: '', totalDebt: 45.00, items: 'Almuerzos de la semana', lastUpdate: '2026-05-24' },
];

export const useInformalCredit = () => {

// Extraemos el nombre del remitente para WhatsApp
  const user = useAuthStore((state) => state.user);
  const businessData = useUserStore((state) => state.businessData);
  const senderName = businessData?.name || user?.name || 'mi negocio';

  const [credits, setCredits] = useState(MOCK_CREDITS);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Estados para Modales
  const [isFormModalVisible, setIsFormModalVisible] = useState(false);
  const [editingCredit, setEditingCredit] = useState(null); // null = Crear Nuevo, objeto = Editar
  const [isPaymentModalVisible, setIsPaymentModalVisible] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);

  // Buscador filtrado por nombre de cliente
  const filteredCredits = credits.filter(c => 
    c.clientName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Agregar nuevo Fiado
  const saveCredit = (creditData) => {
    // Si el usuario deja solo "+507", lo guardamos vacío para no generar errores
    const cleanPhone = creditData.phone.trim() === '+507' ? '' : creditData.phone;
    const finalData = { ...creditData, phone: cleanPhone };

    if (editingCredit) {
      setCredits(prev => prev.map(c => c.id === editingCredit.id ? { ...c, ...finalData } : c));
    } else {
      const newEntry = { ...finalData, id: Date.now().toString(), lastUpdate: new Date().toISOString().split('T')[0] };
      setCredits([newEntry, ...credits]);
    }
    setIsFormModalVisible(false);
  };

  // Eliminar Fiado
  const deleteCredit = (id) => {
    setCredits(prev => prev.filter(c => c.id !== id));
    setIsFormModalVisible(false);
  };

  // Registrar un Abono o Pago Total
  const registerPayment = (clientId, paymentAmount) => {
    setCredits(prevCredits => 
      prevCredits.map(c => {
        if (c.id === clientId) {
          const newDebt = c.totalDebt - paymentAmount;
          return { ...c, totalDebt: newDebt < 0 ? 0 : newDebt }; // Evita saldos negativos
        }
        return c;
      }).filter(c => c.totalDebt > 0) // Elimina al cliente de la lista si la deuda llega a $0
    );
    setIsPaymentModalVisible(false);
  };

  // Enviar Recordatorio por WhatsApp
  const sendWhatsAppReminder = (clientName, phone, amount) => {
    if (!phone || phone === '+507') {
      Alert.alert('Sin número', `No tienes registrado un número válido para ${clientName}.`);
      return;
    }

    // Mensaje modificado con el nombre del negocio o usuario
    const text = `¡Hola *${clientName}*! 👋\nTe escribo de *${senderName}* para recordarte que tienes un saldo pendiente de *$${amount.toFixed(2)}* por tus compras.\n\nPor favor, confírmame cuándo podrías pasar a cancelarlo o abonar. ¡Gracias!`;
    const url = `whatsapp://send?phone=${phone.replace('+', '')}&text=${encodeURIComponent(text)}`;
    
    Linking.openURL(url).catch(err => {
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
    searchQuery, setSearchQuery, filteredCredits, senderName,
    isFormModalVisible, setIsFormModalVisible, editingCredit,
    isPaymentModalVisible, setIsPaymentModalVisible, selectedClient,
    saveCredit, registerPayment, sendWhatsAppReminder, openAddModal, openEditModal, openPaymentModal, deleteCredit
  };
};