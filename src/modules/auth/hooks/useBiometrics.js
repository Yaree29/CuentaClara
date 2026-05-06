import { useState } from 'react';
import biometricService from '../services/biometricService';

export const useBiometrics = () => {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [error, setError] = useState(null);

  const verifyIdentity = async () => {
    setIsAuthenticating(true);
    setError(null);
    try {
      const result = await biometricService.authenticate();
      return result.success;
    } catch (err) {
      setError("Error en la validación biométrica");
      return false;
    } finally {
      setIsAuthenticating(false);
    }
  };

  return {
    verifyIdentity,
    isAuthenticating,
    error
  };
};