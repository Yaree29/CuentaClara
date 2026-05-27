import { useState, useEffect, useCallback } from 'react';
import useAuthStore from '../../../store/useAuthStore';
import useUserStore from '../../../store/useUserStore';
import { supabase } from '../../../services/supabaseClient';

/**
 * useLowStock
 * -----------
 * Consulta Supabase directamente para comparar stock actual vs stock mínimo.
 * Devuelve dos listas:
 *   - lowStockProducts  → productos donde stock <= min_stock (y min_stock > 0)
 *   - okProducts        → productos activos con stock por encima del mínimo
 *
 * Productos de stock ilimitado (quantity = null) se ignoran de las alertas
 * pero aparecen en okProducts.
 */
export const useLowStock = () => {
  const [lowStockProducts, setLowStockProducts]   = useState([]);
  const [okProducts, setOkProducts]               = useState([]);
  const [loading, setLoading]                     = useState(false);
  const [error, setError]                         = useState(null);
  const [lastUpdated, setLastUpdated]             = useState(null);

  const user         = useAuthStore((state) => state.user);
  const businessData = useUserStore((state) => state.businessData);

  const resolveBusinessId = useCallback(() =>
    businessData?.id ||
    businessData?.business_id ||
    user?.business_id ||
    user?.businessId ||
    null,
  [businessData, user]);

  const fetchStockStatus = useCallback(async () => {
    const businessId = resolveBusinessId();
    if (!businessId) {
      setLowStockProducts([]);
      setOkProducts([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: queryError } = await supabase
        .from('inventory')
        .select(`
          id,
          quantity,
          min_stock,
          unit,
          products (
            id,
            name,
            sku,
            is_active,
            product_categories ( name, color )
          )
        `)
        .eq('business_id', businessId);

      if (queryError) throw queryError;

      const low  = [];
      const ok   = [];

      for (const row of (data || [])) {
        // Normalizar join (puede llegar como objeto o array)
        let product = row.products;
        if (Array.isArray(product)) product = product[0] ?? null;
        if (!product || product.is_active === false) continue;

        let category = product.product_categories;
        if (Array.isArray(category)) category = category[0] ?? null;

        const quantity  = row.quantity !== null && row.quantity !== undefined
          ? Number(row.quantity)
          : null;                          // null = servicio / ilimitado
        const minStock  = Number(row.min_stock || 0);

        const item = {
          id:            product.id,
          name:          product.name,
          sku:           product.sku,
          category:      category?.name  ?? 'Sin categoría',
          categoryColor: category?.color ?? '#6366f1',
          stock:         quantity,
          minStock:      minStock,
          unit:          row.unit ?? '',
          // Cuántas unidades faltan para llegar al mínimo (solo relevante si es bajo)
          deficit:       (quantity !== null && minStock > 0)
                           ? Math.max(0, minStock - quantity)
                           : 0,
        };

        // Regla: si tiene min_stock definido y stock ≤ min_stock → alerta
        const isLow = quantity !== null && minStock > 0 && quantity <= minStock;

        if (isLow) {
          low.push(item);
        } else {
          ok.push(item);
        }
      }

      // Ordenar alertas: más crítico primero (mayor déficit)
      low.sort((a, b) => b.deficit - a.deficit);
      // Ordenar ok: alfabéticamente
      ok.sort((a, b) => a.name.localeCompare(b.name));

      setLowStockProducts(low);
      setOkProducts(ok);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('[useLowStock] Error fetching stock status:', err);
      setError('No se pudo cargar el estado del inventario.');
    } finally {
      setLoading(false);
    }
  }, [resolveBusinessId]);

  // Carga automática al montar y cuando cambia el negocio/usuario
  useEffect(() => {
    fetchStockStatus();
  }, [user, businessData]);

  return {
    lowStockProducts,
    okProducts,
    loading,
    error,
    lastUpdated,
    refresh: fetchStockStatus,
  };
};
