import { useEffect, useState } from 'react';
import useAuthStore from '../../../store/useAuthStore';
import inventoryService from '../services/inventoryService';

export const useInventory = () => {
  const businessId = useAuthStore((state) => state.user?.business_id);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

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

  const addProduct = async (productData) => {
    setSaving(true);
    setSaveError(null);

    try {
      if (!businessId) {
        throw new Error('No hay negocio activo para guardar el producto.');
      }

      const price = Number(productData.price);
      const quantity = Number(productData.quantity ?? 0);
      const minStock = Number(productData.minStock ?? 0);

      if (!productData.name?.trim()) {
        throw new Error('El nombre del producto es requerido.');
      }

      if (Number.isNaN(price)) {
        throw new Error('El precio debe ser numérico.');
      }

      if (Number.isNaN(quantity) || quantity < 0) {
        throw new Error('La cantidad debe ser numérica y mayor o igual a cero.');
      }

      if (Number.isNaN(minStock) || minStock < 0) {
        throw new Error('El stock mínimo debe ser numérico y mayor o igual a cero.');
      }

      const payload = {
        name: productData.name.trim(),
        sku: productData.sku?.trim() || null,
        price,
        unitType: productData.unitType?.trim() || null,
        quantity,
        unit: productData.unit?.trim() || null,
        minStock,
      };

      const result = await inventoryService.createProduct(businessId, payload);
      await fetchProducts();
      return result;
    } catch (err) {
      const message = err.message || 'No se pudo guardar el producto.';
      setSaveError(message);
      throw err;
    } finally {
      setSaving(false);
    }
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
    addProduct,
    saving,
    saveError,
  };
};
