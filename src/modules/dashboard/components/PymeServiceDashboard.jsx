import React, { useState } from'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { PlusIcon, ScissorsIcon, UserGroupIcon, StarIcon } from 'react-native-heroicons/solid';
import styles from './styles/PymeDashboards.styles';
import colors from '../../../theme/colors';
import useAuthStore from '../../../store/useAuthStore';
//import useUserStore from '../../../store/useUserStore';


const PymeServiceDashboard = () => {

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

      {/* KPI PRINCIPAL */}
      <Text style={[styles.kpiLabel, {marginTop: 20}]}>Resumen de Hoy</Text>
      <View style={styles.kpiMainCard}>
        <Text style={styles.kpiValue}>$425.50</Text>
        <Text style={styles.kpiSubtext}>12 Servicios realizados hoy</Text>
      </View>

      <TouchableOpacity style={styles.primaryActionBtn}>
        <PlusIcon size={20} color="#FFF" />
        <Text style={styles.primaryActionBtnText}>Nuevo Servicio</Text>
      </TouchableOpacity>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Servicios Recientes</Text>
        <Text style={styles.viewAll}>Ver todo</Text>
      </View>

      <View style={styles.itemRow}>
        <View style={styles.itemInfo}>
          <View style={[styles.iconCircle, {backgroundColor: '#F0FDF4'}]}>
            <ScissorsIcon size={20} color={colors.success} />
          </View>
          <View>
            <Text style={styles.itemTitle}>Corte Degradado</Text>
            <Text style={styles.itemSubtitle}>Carlos R. • Hace 20 min</Text>
          </View>
        </View>
        <Text style={styles.itemAmount}>$15.00</Text>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Comisiones Personal</Text>
      </View>
      
      {['Miguel Z.', 'Luis Z.'].map((name, i) => (
        <View key={i} style={styles.itemRow}>
          <View style={styles.itemInfo}>
            <View style={[styles.iconCircle, {backgroundColor: colors.primary + '15'}]}>
              <Text style={{color: colors.primary, fontWeight: 'bold'}}>{name[0]}</Text>
            </View>
            <Text style={styles.itemTitle}>{name}</Text>
          </View>
          <Text style={[styles.itemAmount, {color: colors.primary}]}>$85.00</Text>
        </View>
      ))}
    </ScrollView>
  );
};

export default PymeServiceDashboard;