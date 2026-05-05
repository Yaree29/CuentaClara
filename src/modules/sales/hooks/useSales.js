import { useState } from 'react';
import salesService from '../services/salesService';

export const useSales = () => {
    const [loading, setLoading] = useState(false);
    const [lastSale, setLastSale] = useState(null);

    const processSale = async(items, total) => {
        setLoading(true);
        try {
            const saleData = { items, total, status: 'completed' };
            const result = await salesService.createSale(saleData);
            setLastSale(result);
            return result;
        } catch (error) {
            console.error("Error al procesar venta:", error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    return {
        processSale,
        loading,
        lastSale
    };
};