
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import colors from '../../../theme/colors';
import useAuthStore from '../../../store/useAuthStore';

import DashboardHeader from '../components/shared/DashboardHeader';
import InformalDashboard from '../components/InformalDashboard';
import PymeDashboard from '../components/PymeDashboard';

const HomeScreen = () => {
  const user = useAuthStore((state) => state.user);
  const userType = user?.userType; // 'pyme' | 'informal'

  const renderDashboard = () => {
    if (userType === 'informal') {
      return <InformalDashboard />;
    }

    return <PymeDashboard />;
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <DashboardHeader isHome={true} />
      {renderDashboard()}
    </SafeAreaView>
  );
};

export default HomeScreen;