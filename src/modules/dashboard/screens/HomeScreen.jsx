
import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import colors from '../../../theme/colors';
import useAuthStore from '../../../store/useAuthStore';
import useAssistantModeStore from '../../../store/useAssistantModeStore';

import DashboardHeader from '../components/shared/DashboardHeader';
import InformalDashboard from '../components/InformalDashboard';
import PymeDashboard from '../components/PymeDashboard';
import AssistantDashboard from '../components/AssistantDashboard';

const HomeScreen = () => {
  const user = useAuthStore((state) => state.user);
  const userType = user?.userType; // 'pyme' | 'informal'
  const activeAssistant = useAssistantModeStore((state) => state.activeAssistant);

  // El saludo (antes DashboardGreeting.jsx, ahora en la fila fija del Header
  // vía showGreeting) necesita el ingreso del día, pero ese valor se calcula
  // dentro de cada dashboard (fuentes de datos distintas para PYME/Informal).
  // Se sube aquí con un callback en vez de recalcularlo, para no duplicar esa
  // lógica.
  const [todayIncome, setTodayIncome] = useState(0);

  // Este tab ("dashboard") ya no existe en Modo Asistente (ver
  // MainNavigator.jsx/ASSISTANT_TABS) — la rama de abajo queda sin poder
  // alcanzarse en la práctica, pero se deja tal cual (no se borra
  // AssistantDashboard.jsx del proyecto) por si se reintroduce más adelante.
  // El polling de bloqueo (useAssistantSession) se movió a MainNavigator.jsx,
  // que persiste durante toda la sesión de tabs sin depender de este tab.
  const renderDashboard = () => {
    if (activeAssistant) {
      return <AssistantDashboard />;
    }

    if (userType === 'informal') {
      return <InformalDashboard onTodayIncomeChange={setTodayIncome} />;
    }

    return <PymeDashboard onTodayIncomeChange={setTodayIncome} />;
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <DashboardHeader title="Inicio" showGreeting todayIncome={todayIncome} />
      {renderDashboard()}
    </SafeAreaView>
  );
};

export default HomeScreen;