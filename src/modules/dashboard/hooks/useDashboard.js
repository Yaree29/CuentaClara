import { useState, useEffect } from 'react';
import useUserStore from '../../../store/useUserStore';
import dashboardService from '../services/dashboardService';

export const useDashboard = () => {
    const [metrics, setMetrics] = useState(null);
    const [loading, setLoading] = useState(true);
    const userType = useUserStore((state) => state.userType);

    const fetchMetrics = async() => {
        setLoading(true);
        try {
            const data = await dashboardService.getMetrics(userType);
            setMetrics(data);
        } catch (error) {
            console.error("Error fetching metrics:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (userType) {
            fetchMetrics();
        }
    }, [userType]);

    return {
        metrics,
        loading,
        refresh: fetchMetrics
    };
};