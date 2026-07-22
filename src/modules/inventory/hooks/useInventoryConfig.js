// =============================================================================
// useInventoryConfig.js
// -----------------------------------------------------------------------------
// Hook compartido para el sistema de flags de "Configuración de Inventario"
// (control_peso, caducidad, mermas, recetas, produccion, escaner,
// stock_predictivo). Lo consumen tanto AppSettingsScreen.jsx (toggles editables)
// como PymeInventory.jsx (mostrar/ocultar secciones), para que ambos lean del
// mismo estado sin duplicar las llamadas a businessService/inventoryService.
//
// category_group viene de GET /businesses/me (ver business_service.py) y
// determina qué flags son relevantes para el negocio — el mapeo debe
// coincidir con INVENTORY_CONFIG_DEFAULTS_BY_GROUP en
// backend/app/services/auth_service.py.
// =============================================================================
import { useCallback, useEffect, useState } from 'react';
import inventoryService from '../services/inventoryService';
import businessService from '../../../services/businessService';

export const ALL_INVENTORY_CONFIG_FLAGS = [
  'control_peso', 'caducidad', 'mermas', 'recetas', 'produccion', 'escaner', 'stock_predictivo',
];

// Qué flags son relevantes (visibles) según el category_group del negocio.
// servicios/general no tienen flags propios todavía.
export const FLAGS_BY_CATEGORY_GROUP = {
  alimentos: ['control_peso', 'caducidad', 'mermas'],
  comida_preparada: ['recetas', 'mermas', 'produccion'],
  comercio: ['escaner', 'stock_predictivo'],
};

export const FLAG_LABELS = {
  control_peso: { label: 'Control por peso', description: 'Vender y registrar stock en kg, g o lb.' },
  caducidad: { label: 'Caducidad', description: 'Seguimiento de fechas de vencimiento por producto o lote.' },
  mermas: { label: 'Mermas', description: 'Registrar pérdidas y desperdicio de inventario.' },
  recetas: { label: 'Recetas', description: 'Componer productos a partir de insumos y sus cantidades.' },
  produccion: { label: 'Producción', description: 'Órdenes de producción y transformación de insumos.' },
  escaner: { label: 'Escáner', description: 'Lectura de código de barras o SKU para buscar productos.' },
  stock_predictivo: { label: 'Stock predictivo', description: 'Proyección de quiebres de stock a futuro.' },
};

const emptyConfig = () =>
  ALL_INVENTORY_CONFIG_FLAGS.reduce((acc, flag) => ({ ...acc, [flag]: false }), {});

const useInventoryConfig = () => {
  const [categoryGroup, setCategoryGroup] = useState(null);
  const [config, setConfig] = useState(emptyConfig());
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [business, inventoryConfig] = await Promise.all([
        businessService.getBusinessInfo(),
        inventoryService.getConfig(),
      ]);
      setCategoryGroup(business?.category_group || null);
      setConfig({ ...emptyConfig(), ...inventoryConfig });
    } catch (error) {
      setCategoryGroup(null);
      setConfig(emptyConfig());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const visibleFlags = FLAGS_BY_CATEGORY_GROUP[categoryGroup] || [];

  // Actualización optimista con rollback si el PATCH falla — mismo criterio
  // que handleToggleBlocked en TeamScreen.jsx.
  const updateFlag = useCallback(async (flag, value) => {
    setConfig((prev) => ({ ...prev, [flag]: value }));
    try {
      const updated = await inventoryService.updateConfig({ [flag]: value });
      setConfig((prev) => ({ ...prev, ...updated }));
    } catch (error) {
      setConfig((prev) => ({ ...prev, [flag]: !value }));
      throw error;
    }
  }, []);

  return { categoryGroup, visibleFlags, config, loading, updateFlag, refetch: fetchAll };
};

export default useInventoryConfig;
