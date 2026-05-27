// =============================================================================
// MODIFICADO: 2026-05-27
// Propósito: Servicio del módulo de crédito/fiado. Conectado directamente 
//            a Supabase en el frontend.
// =============================================================================
import { supabase } from '../../../services/supabaseClient';
import useAuthStore from '../../../store/useAuthStore';
import useUserStore from '../../../store/useUserStore';

const getContext = () => {
  const user = useAuthStore.getState().user;
  const businessData = useUserStore.getState().businessData;
  const businessId = businessData?.id || businessData?.business_id || user?.business_id || user?.businessId;
  const userId = user?.id;
  if (!businessId) throw new Error('No hay sesión de negocio activa');
  return { businessId, userId };
};

const debtService = {
  // --- Clientes ---
  getCustomers: async () => {
    const { businessId } = getContext();
    const { data, error } = await supabase
      .from('customers')
      .select('id, business_id, name, phone, notes, is_active, created_at')
      .eq('business_id', businessId)
      .eq('is_active', true)
      .order('name');
    
    if (error) throw error;
    return data || [];
  },

  createCustomer: async ({ name, phone, notes }) => {
    const { businessId } = getContext();
    if (!name || !name.trim()) throw new Error("El nombre del cliente es requerido");

    const payload = {
      business_id: businessId,
      name: name.trim(),
      phone: phone?.trim() || null,
      notes: notes?.trim() || null,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('customers')
      .insert(payload)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  updateCustomer: async (customerId, { name, phone, notes }) => {
    const { businessId } = getContext();
    const payload = { updated_at: new Date().toISOString() };
    
    if (name !== undefined) {
      if (!name.trim()) throw new Error("El nombre no puede estar vacío");
      payload.name = name.trim();
    }
    if (phone !== undefined) payload.phone = phone?.trim() || null;
    if (notes !== undefined) payload.notes = notes?.trim() || null;

    const { data, error } = await supabase
      .from('customers')
      .update(payload)
      .eq('id', customerId)
      .eq('business_id', businessId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // --- Deudas / Fiado ---
  getDebts: async (status = null) => {
    const { businessId } = getContext();
    
    let query = supabase
      .from('debts')
      .select('id, business_id, customer_id, original_amount, remaining_amount, description, status, due_date, created_at, customers(name)')
      .eq('business_id', businessId);

    if (status) {
      query = query.eq('status', status);
    } else {
      query = query.in('status', ['pending', 'partial', 'overdue']);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) throw error;

    return (data || []).map(row => {
      const customer = row.customers;
      delete row.customers;
      return {
        ...row,
        customer_name: customer?.name || "Sin nombre"
      };
    });
  },

  createDebt: async ({ customer_id, amount, description, due_date, invoice_id }) => {
    const { businessId } = getContext();
    
    // Check if customer exists and is active
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .select('id, name, is_active')
      .eq('id', customer_id)
      .eq('business_id', businessId)
      .single();

    if (customerError || !customer) throw new Error("Cliente no encontrado");
    if (!customer.is_active) throw new Error("No se puede crear deuda para un cliente inactivo");

    const numericAmount = Number(amount);
    const payload = {
      business_id: businessId,
      customer_id,
      invoice_id: invoice_id || null,
      original_amount: numericAmount,
      remaining_amount: numericAmount,
      description: description?.trim() || null,
      status: 'pending',
      due_date: due_date || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('debts')
      .insert(payload)
      .select()
      .single();

    if (error) throw error;
    return {
      ...data,
      customer_name: customer.name
    };
  },

  updateDebt: async (debtId, { amount, description, due_date }) => {
    const { businessId } = getContext();

    const { data: debt, error: fetchError } = await supabase
      .from('debts')
      .select('id, original_amount, remaining_amount, status, customer_id')
      .eq('id', debtId)
      .eq('business_id', businessId)
      .single();

    if (fetchError || !debt) throw new Error("Deuda no encontrada");
    if (['paid', 'cancelled'].includes(debt.status)) {
      throw new Error(`No se puede editar una deuda en estado ${debt.status}`);
    }

    const payload = { updated_at: new Date().toISOString() };

    if (amount !== undefined) {
      const newAmount = Number(amount);
      const paidSoFar = Number(debt.original_amount) - Number(debt.remaining_amount);
      if (newAmount < paidSoFar) {
        throw new Error(`El nuevo monto no puede ser menor a lo ya abonado ($${paidSoFar.toFixed(2)})`);
      }
      
      const newRemaining = newAmount - paidSoFar;
      payload.original_amount = newAmount;
      payload.remaining_amount = newRemaining;
      
      if (newRemaining === 0) {
        payload.status = 'paid';
        payload.paid_at = new Date().toISOString();
      } else if (paidSoFar > 0) {
        payload.status = 'partial';
      } else {
        payload.status = 'pending';
      }
    }

    if (description !== undefined) payload.description = description?.trim() || null;
    if (due_date !== undefined) payload.due_date = due_date || null;

    const { data, error } = await supabase
      .from('debts')
      .update(payload)
      .eq('id', debtId)
      .eq('business_id', businessId)
      .select()
      .single();

    if (error) throw error;

    const { data: customerData } = await supabase
      .from('customers')
      .select('name')
      .eq('id', data.customer_id)
      .single();

    return {
      ...data,
      customer_name: customerData?.name || "Sin nombre"
    };
  },

  cancelDebt: async (debtId) => {
    const { businessId } = getContext();
    const { data: debt, error: fetchError } = await supabase
      .from('debts')
      .select('status')
      .eq('id', debtId)
      .eq('business_id', businessId)
      .single();

    if (fetchError || !debt) throw new Error("Deuda no encontrada");
    if (debt.status === 'cancelled') throw new Error("La deuda ya está cancelada");

    const { data, error } = await supabase
      .from('debts')
      .update({
        status: 'cancelled',
        updated_at: new Date().toISOString(),
      })
      .eq('id', debtId)
      .eq('business_id', businessId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // --- Abonos ---
  registerPayment: async (debtId, { amount, method = 'cash', notes = null }) => {
    const { businessId, userId } = getContext();
    
    const { data: debt, error: debtError } = await supabase
      .from('debts')
      .select('id, remaining_amount, status')
      .eq('id', debtId)
      .eq('business_id', businessId)
      .single();

    if (debtError || !debt) throw new Error("Deuda no encontrada");
    if (['paid', 'cancelled'].includes(debt.status)) {
      throw new Error(`La deuda ya está ${debt.status} y no acepta abonos`);
    }

    const remaining = Number(debt.remaining_amount);
    const paymentAmount = Number(amount);

    if (paymentAmount > remaining) {
      throw new Error(`El abono ($${paymentAmount.toFixed(2)}) supera el saldo pendiente ($${remaining.toFixed(2)})`);
    }

    // Insert payment
    const paymentPayload = {
      debt_id: debtId,
      business_id: businessId,
      amount: paymentAmount,
      method,
      notes: notes?.trim() || null,
      paid_at: new Date().toISOString(),
      user_id: userId || null,
    };

    const { data: paymentResult, error: paymentError } = await supabase
      .from('debt_payments')
      .insert(paymentPayload)
      .select()
      .single();

    if (paymentError) throw paymentError;

    // Update debt
    const newRemaining = remaining - paymentAmount;
    let newStatus = 'partial';
    let paidAt = null;

    if (newRemaining === 0) {
      newStatus = 'paid';
      paidAt = new Date().toISOString();
    }

    const updatePayload = {
      remaining_amount: newRemaining,
      status: newStatus,
      updated_at: new Date().toISOString(),
    };
    if (paidAt) updatePayload.paid_at = paidAt;

    const { error: updateError } = await supabase
      .from('debts')
      .update(updatePayload)
      .eq('id', debtId);

    if (updateError) throw updateError;

    return {
      id: paymentResult.id,
      debt_id: debtId,
      amount: paymentAmount,
      method: paymentResult.method,
      notes: paymentResult.notes,
      paid_at: paymentResult.paid_at,
      remaining_amount: newRemaining,
      debt_status: newStatus,
    };
  },
};

export default debtService;
