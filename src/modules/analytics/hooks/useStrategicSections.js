// =============================================================================
// useStrategicSections.js
// -----------------------------------------------------------------------------
// Orquesta el Análisis Estratégico: trae category_group (mismo patrón que
// useInventoryConfig.js: businessService.getBusinessInfo()) para decidir el
// ORDEN de las secciones, y dispara los fetches reales de cada una
// (strategicAnalysisService.js).
//
// Solo 3 secciones (Ventas/Finanzas/Inventario) — "Servicios" se eliminó de
// esta pantalla por ser una re-visualización 1:1 de lo que ya muestra
// ServicesScreen.jsx (mismo hook useStaffPerformance, mismos datos de hoy,
// sin ningún análisis adicional). Ver strategicAnalysisService.js.
//
// No oculta secciones por categoría, salvo un caso puntual: si el negocio es
// category_group='servicios' y no vende producto físico
// (settings.sell_physical_products), Inventario no aporta nada y se quita.
// =============================================================================
import { useCallback, useEffect, useState } from 'react';
import businessService from '../../../services/businessService';
import {
  getVentasSection,
  getFinanzasSection,
  getInventarioSection,
} from '../services/strategicAnalysisService';

const EMPTY_SECTION = { cards: [], charts: [], tables: [], calendars: [] };

// Orden por category_group — criterio de la auditoría:
//   alimentos        → Inventario primero (mermas/caducidad son su prioridad real)
//   comida_preparada → Finanzas primero (recetas/producción ya viven en Módulos > Recetas)
//   comercio         → Ventas primero
//   servicios        → Ventas primero, Inventario al final (o fuera si no vende físico)
//   null/otro        → orden original, sin cambios
const ORDER_BY_CATEGORY_GROUP = {
  alimentos: ['inventario', 'ventas', 'finanzas'],
  comida_preparada: ['finanzas', 'ventas', 'inventario'],
  comercio: ['ventas', 'finanzas', 'inventario'],
  servicios: ['ventas', 'finanzas', 'inventario'],
};
const DEFAULT_ORDER = ['ventas', 'finanzas', 'inventario'];

const isTrue = (value) => value === true || value === 'Sí';

export const useStrategicSections = () => {
  const [categoryGroup, setCategoryGroup] = useState(null);
  const [sellPhysicalProducts, setSellPhysicalProducts] = useState(true);
  const [sectionsData, setSectionsData] = useState({
    ventas: EMPTY_SECTION,
    finanzas: EMPTY_SECTION,
    inventario: EMPTY_SECTION,
  });
  const [loading, setLoading] = useState(true);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [business, config, ventas, finanzas, inventario] = await Promise.all([
        businessService.getBusinessInfo().catch(() => null),
        businessService.getBusinessConfig().catch(() => null),
        getVentasSection().catch(() => EMPTY_SECTION),
        getFinanzasSection().catch(() => EMPTY_SECTION),
        getInventarioSection().catch(() => EMPTY_SECTION),
      ]);

      setCategoryGroup(business?.category_group || null);
      setSellPhysicalProducts(isTrue(config?.settings?.sell_physical_products));
      setSectionsData({ ventas, finanzas, inventario });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const order = ORDER_BY_CATEGORY_GROUP[categoryGroup] || DEFAULT_ORDER;
  const visibleOrder =
    categoryGroup === 'servicios' && !sellPhysicalProducts
      ? order.filter((section) => section !== 'inventario')
      : order;

  return {
    loading,
    order: visibleOrder,
    dataBySection: sectionsData,
  };
};

export default useStrategicSections;
