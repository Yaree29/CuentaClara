import { useEffect, useState, useCallback } from "react";

import useAuthStore from "../../../store/useAuthStore";
import businessService from "../../../services/businessService";
import inventoryService from "../../inventory/services/inventoryService";

const EMPTY_INVENTORY_ALERTS = { lowStock: 0, outStock: 0 };

const useDashboardData = () => {
  const user = useAuthStore((state) => state.user);

  const [business, setBusiness] = useState({});
  const [config, setConfig] = useState({});
  const [inventoryAlerts, setInventoryAlerts] = useState(EMPTY_INVENTORY_ALERTS);
  const [loading, setLoading] = useState(true);

  const loadDashboardData = useCallback(async () => {
    if (!user) {
      setBusiness({});
      setConfig({});
      setInventoryAlerts(EMPTY_INVENTORY_ALERTS);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const [businessInfo, businessConfig, lowStockList] = await Promise.all([
        businessService.getBusinessInfo(),
        businessService.getBusinessConfig(),
        // Alertas reales de inventario (GET /inventory/stock/low). Si el
        // negocio no tiene el módulo de inventario, o falla, se cuenta 0 en
        // vez de inventar un dato.
        inventoryService.lowStockAlerts().catch(() => []),
      ]);

      setBusiness(businessInfo || {});
      setConfig(businessConfig || {});

      const list = Array.isArray(lowStockList) ? lowStockList : [];
      setInventoryAlerts({
        lowStock: list.filter((item) => Number(item.current_stock) > 0).length,
        outStock: list.filter((item) => Number(item.current_stock) <= 0).length,
      });
    } catch (error) {
      console.log("Dashboard load error:", error);

      setBusiness({});
      setConfig({});
      setInventoryAlerts(EMPTY_INVENTORY_ALERTS);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  return {
    business,
    config,
    inventoryAlerts,
    loading,
    reload: loadDashboardData,
  };
};

export default useDashboardData;