import React, { useState }from 'react';
import { View, Text, ScrollView } from 'react-native';
import { ScaleIcon, ArchiveBoxIcon, ExclamationTriangleIcon } from 'react-native-heroicons/solid';
import styles from './styles/PymeDashboards.styles';
import colors from '../../../theme/colors';
import useAuthStore from '../../../store/useAuthStore';
//import useUserStore from '../../../store/useUserStore';


const PymeRetailDashboard = () => {

  // Extraemos los datos del usuario actual desde Zustand
  const user = useAuthStore((state) => state.user);//ya no se usa este dashbord ya que se implementara otro mejorado
  const userName = user?.name || 'Comerciante';

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

      {/* SECCIÓN DE BIENVENIDA */}
            <View style={styles.welcomeContainer}>
              <View>
                <Text style={styles.welcomeTitle}>¡Hola, {userName}!</Text>
                <Text style={styles.welcomeSubtitle}>Tu negocio está creciendo hoy.</Text>
              </View>
            </View>

      <View style={[styles.kpiMainCard, {marginTop: 20}]}>
        <Text style={styles.kpiLabel}>Venta del Día</Text>
        <Text style={[styles.kpiValue, {color: colors.success}]}>$2,450.80</Text>
        <Text style={styles.kpiSubtext}>+12% vs ayer</Text>
      </View>

      <View style={{flexDirection: 'row', gap: 12}}>
        <View style={[styles.kpiMainCard, {flex: 1, padding: 15}]}>
          <ScaleIcon size={20} color={colors.primary} />
          <Text style={[styles.itemTitle, {marginTop: 8}]}>Peso Vendido</Text>
          <Text style={styles.itemAmount}>142.5 Kg</Text>
        </View>
        <View style={[styles.kpiMainCard, {flex: 1, padding: 15}]}>
          <ExclamationTriangleIcon size={20} color={colors.danger} />
          <Text style={[styles.itemTitle, {marginTop: 8}]}>Merma</Text>
          <Text style={[styles.itemAmount, {color: colors.danger}]}>3.2 Kg</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Alertas de Stock</Text>
      <View style={styles.alertBanner}>
        <ArchiveBoxIcon size={20} color={colors.danger} />
        <Text style={styles.alertText}>5 productos por debajo del mínimo</Text>
      </View>

      <View style={styles.itemRow}>
        <Text style={styles.itemTitle}>Lomo de Res Premium</Text>
        <Text style={[styles.itemAmount, {color: colors.danger}]}>12 Kg restantes</Text>
      </View>
    </ScrollView>
  );
};

export default PymeRetailDashboard;