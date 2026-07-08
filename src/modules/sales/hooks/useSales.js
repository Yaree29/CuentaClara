import { useState } from 'react';
import salesService from '../services/salesService';

export const useSales = () => {
    const [loading, setLoading] = useState(false);
    const [lastSale, setLastSale] = useState(null);
    const [error, setError] = useState(null);
    const [profitsData, setProfitsData] = useState(null);

    const processSale = async (items = [], total = 0, notes = '', paymentMethod = 'cash', isCredit = false) => {
        setLoading(true);
        setError(null);
        try {
            if (items.length === 0) {
                throw new Error('Debes seleccionar al menos un producto.');
            }

            const result = await salesService.createSale(
                items,
                paymentMethod,
                1,
                notes,
                isCredit
            );
            setLastSale(result);
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
    };
};