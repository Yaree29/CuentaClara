import React from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
//import useUserStore from '../../../store/useUserStore';
import colors from '../../../theme/colors';
import DashboardHeader from '../../dashboard/components/shared/DashboardHeader';
import InformalCredit from '../components/InformalCredit';

const DebtScreen = () => {
  const userType = 'informal'; // Cambiar esto para que funcione con el API y el store de usuario

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <DashboardHeader title="Libreta de Fiados" isHome={false} />

      {/* Orquestador visual: Solo Informales pueden ver esto */}
      {userType === 'informal' ? (
        <InformalCredit />
      ) : (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.textPrimary, textAlign: 'center' }}>
            Funcionalidad no disponible
          </Text>
          <Text style={{ fontSize: 14, color: colors.textSecondary, textAlign: 'center', marginTop: 8 }}>
            El módulo de créditos/fiados es exclusivo para cuentas de tipo informal.
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
};

export default DebtScreen;
