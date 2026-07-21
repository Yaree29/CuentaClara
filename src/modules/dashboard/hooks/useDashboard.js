import { useMemo, useState, useCallback } from "react";

import useAuthStore from "../../../store/useAuthStore";
import useSalesStore from "../../../store/useSaleStore";

import useDashboardData from "./useDashboardData";

import { buildDashboard } from "../engine/dashboardEngine";

const useDashboard = () => {
  const user = useAuthStore((state) => state.user);

  const {
    business,
    config,
    loading,
    reload,
  } = useDashboardData();

  const dailySales = useSalesStore((state) => state.dailySales);
  const expenses = useSalesStore((state) => state.expenses);
  const generalMovements = useSalesStore((state) => state.generalMovements);

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);

    await reload();

    setRefreshing(false);
  }, [reload]);

  const businessData = useMemo(
    () => ({
      ...(business || {}),
      ...(config || {}),
    }),
    [business, config]
  );

  const dashboard = useMemo(() => {
    return buildDashboard({
      user,
      businessData,
      preferences: {},
      dailySales,
      expenses,
      generalMovements,
    });
  }, [
    user,
    businessData,
    dailySales,
    expenses,
    generalMovements,
  ]);

  return {
    loading,
    refreshing,
    onRefresh,

    header: dashboard.header,
    summary: dashboard.summary,
    alerts: dashboard.alerts,
    goals: dashboard.goals,
    quickActions: dashboard.quickActions,
    finance: dashboard.finance,
    modules: dashboard.modules,
    activity: dashboard.activity,
    business: dashboard.business,
    status: dashboard.status,
  };
};

export default useDashboard;