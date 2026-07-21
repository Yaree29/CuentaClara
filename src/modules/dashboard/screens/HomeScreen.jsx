
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import colors from '../../../theme/colors';
import useAuthStore from '../../../store/useAuthStore';
import useAssistantModeStore from '../../../store/useAssistantModeStore';
import useAssistantSession from '../../assistants/hooks/useAssistantSession';

import DashboardHeader from '../components/shared/DashboardHeader';
import InformalDashboard from '../components/InformalDashboard';
import PymeDashboard from '../components/PymeDashboard';
import AssistantDashboard from '../components/AssistantDashboard';

const HomeScreen = () => {
  const user = useAuthStore((state) => state.user);
  const userType = user?.userType; // 'pyme' | 'informal'
  const activeAssistant = useAssistantModeStore((state) => state.activeAssistant);

  // Montado siempre que Home esté visible — revisa si el dueño bloqueó al
  // asistente activo, sin importar qué access_type tenga (Fase D).
  useAssistantSession();

  const renderDashboard = () => {
    if (activeAssistant) {
      return <AssistantDashboard />;
    }

    if (userType === 'informal') {
      return <InformalDashboard />;
    }

    return <PymeDashboard />;
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <DashboardHeader variant="home" />
      {renderDashboard()}
    </SafeAreaView>
  );
};

export default HomeScreen;