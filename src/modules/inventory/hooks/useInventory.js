import { useEffect, useState } from 'react';
import useAuthStore from '../../../store/useAuthStore';
import inventoryService from '../services/inventoryService';

export const useInventory = () => {
  const businessId = useAuthStore((state) => state.user?.business_id);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchProducts = async () => {
    if (!businessId) {
      setProducts([]);
      setLoading(false);
      setRefreshing(false);
      return;
    }

    setError(null);

    try {
      const data = await inventoryService.getProducts(businessId);
      setProducts(data);
    } catch (err) {
      console.error('Error al cargar inventario:', err);
      setError(err.message || 'No se pudo cargar el inventario.');
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
  }, [businessId]);

  return {
    products,
    loading,
    refreshing,
    error,
    handleRefresh,
  };
};
