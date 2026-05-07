import { useState, useEffect } from 'react';
import businessService from '../services/businessService';

export const useBusiness = () => {
    const [businessInfo, setBusinessInfo] = useState(null);
    const [businessConfig, setBusinessConfig] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    /**
     * Cargar información del negocio
     */
    const fetchBusinessInfo = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await businessService.getBusinessInfo();
            setBusinessInfo(data);
            return data;
        } catch (err) {
            const errorMsg = err.message || 'Error al cargar información del negocio';
            setError(errorMsg);
            console.error('Error fetching business info:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    /**
     * Cargar configuración del negocio
     */
    const fetchBusinessConfig = async () => {
        setLoading(true);
        setError(null);
        try {
            const config = await businessService.getBusinessConfig();
            setBusinessConfig(config);
            return config;
        } catch (err) {
            const errorMsg = err.message || 'Error al cargar configuración';
            setError(errorMsg);
            console.error('Error fetching business config:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    /**
     * Actualizar información del negocio
     */
    const updateInfo = async (data) => {
        setLoading(true);
        setError(null);
        try {
            const updated = await businessService.updateBusinessInfo(data);
            setBusinessInfo({ ...businessInfo, ...updated });
            return updated;
        } catch (err) {
            const errorMsg = err.message || 'Error al actualizar negocio';
            setError(errorMsg);
            console.error('Error updating business info:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    /**
     * Actualizar configuración del negocio
     */
    const updateConfig = async (config) => {
        setLoading(true);
        setError(null);
        try {
            const updated = await businessService.updateBusinessConfig(config);
            setBusinessConfig({ ...businessConfig, ...updated });
            return updated;
        } catch (err) {
            const errorMsg = err.message || 'Error al actualizar configuración';
            setError(errorMsg);
            console.error('Error updating business config:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Cargar datos al iniciar
    useEffect(() => {
        fetchBusinessInfo();
        fetchBusinessConfig();
    }, []);

    return {
        businessInfo,
        businessConfig,
        loading,
        error,
        fetchBusinessInfo,
        fetchBusinessConfig,
        updateInfo,
        updateConfig,
    };
};
