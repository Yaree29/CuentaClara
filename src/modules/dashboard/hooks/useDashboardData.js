import { useEffect, useState, useCallback } from "react";

import useAuthStore from "../../../store/useAuthStore";
import businessService from "../../../services/businessService";

const useDashboardData = () => {
  const user = useAuthStore((state) => state.user);

  const [business, setBusiness] = useState({});
  const [config, setConfig] = useState({});
  const [loading, setLoading] = useState(true);

  const loadDashboardData = useCallback(async () => {
    if (!user) {
      setBusiness({});
      setConfig({});
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const [businessInfo, businessConfig] = await Promise.all([
        businessService.getBusinessInfo(),
        businessService.getBusinessConfig(),
      ]);

      setBusiness(businessInfo || {});
      setConfig(businessConfig || {});
    } catch (error) {
      console.log("Dashboard load error:", error);

      setBusiness({});
      setConfig({});
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
    loading,
    reload: loadDashboardData,
  };
};

export default useDashboardData;