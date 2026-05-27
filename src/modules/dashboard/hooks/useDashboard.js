import { useState, useEffect, useCallback } from 'react';
import useUserStore from '../../../store/useUserStore';
import useAuthStore from '../../../store/useAuthStore';
import dashboardService from '../services/dashboardService';

export const useDashboard = () => {
    const [metrics, setMetrics] = useState({
        salesToday: 0,
        debtTotal: 0,
        debtCustomersCount: 0
    });
    const [loading, setLoading] = useState(true);
    
    const user = useAuthStore((state) => state.user);
    const businessData = useUserStore((state) => state.businessData);

    const resolveBusinessId = useCallback(() =>
        businessData?.id ||
        businessData?.business_id ||
        user?.business_id ||
        user?.businessId ||
        null,
    [businessData, user]);

    const fetchMetrics = useCallback(async () => {
        const businessId = resolveBusinessId();
        if (!businessId) {
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const data = await dashboardService.getMetrics(businessId);
            setMetrics(data);
        } catch (error) {
            console.error("Error fetching metrics:", error);
        } finally {
            setLoading(false);
        }
    }, [resolveBusinessId]);

    useEffect(() => {
        fetchMetrics();
    }, [fetchMetrics]);

    return {
        metrics,
        loading,
        refresh: fetchMetrics
    };
};