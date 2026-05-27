import { useState, useEffect, useCallback } from 'react';
import salesService from '../services/salesService';
import inventoryService from '../../inventory/services/inventoryService';
import { supabase } from '../../../services/supabaseClient';
import useAuthStore from '../../../store/useAuthStore';
import useUserStore from '../../../store/useUserStore';

export const useSales = () => {
    const [loading, setLoading] = useState(false);
    const [lastSale, setLastSale] = useState(null);
    const [error, setError] = useState(null);
    const [profitsData, setProfitsData] = useState(null);
    const [inventory, setInventory] = useState([]);
    const [historyList, setHistoryList] = useState([]);

    const user = useAuthStore((state) => state.user);
    const businessData = useUserStore((state) => state.businessData);

    const resolveBusinessId = useCallback(() =>
        businessData?.id ||
        businessData?.business_id ||
        user?.business_id ||
        user?.businessId ||
        null,
    [businessData, user]);

    const fetchInventory = useCallback(async () => {
        const businessId = resolveBusinessId();
        if (!businessId) return;
        try {
            const data = await inventoryService.getProducts(businessId);
            setInventory(data || []);
        } catch (err) {
            console.error('Error fetching inventory for sales:', err);
        }
    }, [resolveBusinessId]);

    const fetchHistoryList = useCallback(async () => {
        const businessId = resolveBusinessId();
        if (!businessId) return;
        try {
            // Get last 30 days invoices
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            const dateFrom = thirtyDaysAgo.toISOString();

            const { data: invoices } = await supabase
                .from('invoices')
                .select('id, total, created_at')
                .eq('business_id', businessId)
                .eq('status', 'paid')
                .gte('created_at', dateFrom);

            const { data: expenses } = await supabase
                .from('expenses')
                .select('id, description, amount, created_at')
                .eq('business_id', businessId)
                .gte('created_at', dateFrom);

            const history = [];
            if (invoices) {
                invoices.forEach(inv => {
                    history.push({
                        id: `inv-${inv.id}`,
                        type: 'income',
                        title: `Factura FAC-${inv.id}`,
                        amount: Number(inv.total || 0),
                        date: new Date(inv.created_at).toLocaleDateString(),
                        timestamp: new Date(inv.created_at).getTime()
                    });
                });
            }
            if (expenses) {
                expenses.forEach(exp => {
                    history.push({
                        id: `exp-${exp.id}`,
                        type: 'expense',
                        title: exp.description || 'Gasto registrado',
                        amount: Number(exp.amount || 0),
                        date: new Date(exp.created_at).toLocaleDateString(),
                        timestamp: new Date(exp.created_at).getTime()
                    });
                });
            }

            // Sort descending by timestamp
            history.sort((a, b) => b.timestamp - a.timestamp);
            setHistoryList(history);
        } catch (err) {
            console.error('Error fetching history list:', err);
        }
    }, [resolveBusinessId]);

    useEffect(() => {
        fetchInventory();
        fetchHistoryList();
    }, [fetchInventory, fetchHistoryList]);

    const processSale = async (items = [], total = 0, description = '', paymentMethod = 'cash') => {
        setLoading(true);
        setError(null);
        try {
            const saleItems = items.length > 0 
                ? items 
                : total > 0 
                    ? [{ product_id: 0, quantity: 1, unit_price: total }]
                    : [];

            const result = await salesService.createSale(
                saleItems,
                paymentMethod,
                1, 
                description
            );
            setLastSale(result);
            await fetchHistoryList(); // Refresh history
            await fetchInventory();   // Refresh inventory stock
            return result;
        } catch (err) {
            const errorMsg = err.message || 'Error al procesar venta';
            setError(errorMsg);
            console.error('Error al procesar venta:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const fetchProfitsAndExpenses = async (dateFrom, dateTo) => {
        setLoading(true);
        setError(null);
        try {
            const data = await salesService.getProfitsAndExpenses(dateFrom, dateTo);
            setProfitsData(data);
            return data;
        } catch (err) {
            const errorMsg = err.message || 'Error al obtener reporte de ganancias';
            setError(errorMsg);
            console.error('Error fetching profits:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const fetchRecentSales = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await salesService.getRecentSales();
            setProfitsData(data);
            return data;
        } catch (err) {
            const errorMsg = err.message || 'Error al obtener ventas recientes';
            setError(errorMsg);
            console.error('Error fetching recent sales:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return {
        processSale,
        fetchProfitsAndExpenses,
        fetchRecentSales,
        loading,
        lastSale,
        error,
        profitsData,
        inventory,
        historyList,
    };
};