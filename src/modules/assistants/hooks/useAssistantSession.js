// =============================================================================
// useAssistantSession.js
// -----------------------------------------------------------------------------
// Polling de bloqueo: mientras haya un asistente activo, revisa
// (endpoint liviano) al ganar foco y cada 30s.
// Si el dueño lo bloqueó desde "Equipo" mientras estaba operando, lo saca
// del Modo Asistente (exitAssistant — vuelve al selector de nombres, sin
// tocar isActive del modo general) y muestra el aviso.
//
// Se monta directamente en HomeScreen.jsx (tab "dashboard"), que siempre está
// presente sin importar el access_type — no hace falta un wrapper por pantalla.
// No hace nada si no hay activeAssistant (isActive=true sin asistente
// seleccionado, o modo apagado por completo).
// =============================================================================
import { useCallback, useEffect } from 'react';
import { Alert } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

import assistantsService from '../services/assistantsService';
import useAssistantModeStore from '../../../store/useAssistantModeStore';

const POLL_INTERVAL_MS = 30000;

const useAssistantSession = () => {
  const navigation = useNavigation();
  const activeAssistant = useAssistantModeStore((state) => state.activeAssistant);
  const exitAssistant = useAssistantModeStore((state) => state.exitAssistant);

  const checkStatus = useCallback(async () => {
    if (!activeAssistant) return;

    try {
      const status = await assistantsService.getStatus(activeAssistant.id);
      if (status?.is_blocked) {
        exitAssistant();
        navigation.navigate('AssistantSelect');
        Alert.alert(
          'Acceso bloqueado',
          'Has sido bloqueado por el administrador, contacta al dueño del negocio.'
        );
      }
    } catch {
      // Fallo de red puntual — no interrumpir al asistente por esto, se
      // reintenta en el próximo foco o en el siguiente tick del intervalo.
    }
  }, [activeAssistant, exitAssistant, navigation]);

  useFocusEffect(
    useCallback(() => {
      checkStatus();
    }, [checkStatus])
  );

  useEffect(() => {
    if (!activeAssistant) return;

    const interval = setInterval(checkStatus, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [activeAssistant, checkStatus]);
};

export default useAssistantSession;
