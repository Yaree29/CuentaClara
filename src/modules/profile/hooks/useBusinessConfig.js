// =============================================================================
// useBusinessConfig.js
// -----------------------------------------------------------------------------
// Lee/actualiza la configuración del negocio (moneda, tasa de impuesto, etc.)
// vía los endpoints ya existentes GET/PUT /businesses/me/config
// (businessService.getBusinessConfig / updateBusinessConfig) — sin endpoints
// nuevos.
// =============================================================================
import { useCallback, useEffect, useState } from 'react';
import businessService from '../../../services/businessService';

const useBusinessConfig = () => {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchConfig = useCallback(async () => {
    setLoading(true);
    try {
      const data = await businessService.getBusinessConfig();
      setConfig(data);
    } catch (error) {
      setConfig(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  const updateConfig = useCallback(async (patch) => {
    const updated = await businessService.updateBusinessConfig(patch);
    setConfig(updated);
    return updated;
  }, []);

  return { config, loading, updateConfig, refetch: fetchConfig };
};

export default useBusinessConfig;
