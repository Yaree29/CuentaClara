import { useState, useEffect } from 'react';
import inventoryService from '../services/inventoryService';

export const useInventory = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchProducts = async() => {
        try {
            const data = await inventoryService.getProducts();
            setProducts(data);
        } catch (error) {
            console.error("Error al cargar inventario:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleRefresh = () => {
        setRefreshing(true);
        fetchProducts();
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    return {
        products,
        loading,
        refreshing,
        handleRefresh
    };
};