import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import styles from '../styles/strategicAnalysisScreen.styles';
import VentasSection from '../utils/VentasSection';
import FinanzasSection from '../utils/FinanzasSection';
import InventarioSection from '../utils/InventarioSection';
import ServiciosSection from '../utils/ServiciosSection';
import { getStrategicAnalysis } from '../services/strategicAnalysisService';

const StrategicAnalysisScreen = () => {
  const [analysisData, setAnalysisData] = useState(null);

  const userPermissions = {
    canViewVentas: true,
    canViewFinanzas: true,
    canViewInventario: true,
    canViewServicios: true,
  };


  useEffect(() => {
    const loadAnalysis = async () => {
      const response = await getStrategicAnalysis();
      setAnalysisData(response);
    };
    loadAnalysis();
  }, []);

  if (!analysisData) {
    return (
    <View style={styles.loadingContainer}>
      <Text style={styles.loadingText}>
        Cargando reportes...
      </Text>
    </View>
    );
  }

  return (
    <ScrollView
      style={styles.mainContainer}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          Reportes y Analíticas
        </Text>
      </View>

      {userPermissions.canViewVentas && (
        <VentasSection
          data={analysisData.ventas}
        />
      )}

      {userPermissions.canViewFinanzas && (
        <FinanzasSection
          data={analysisData.finanzas}
        />
      )}

      {userPermissions.canViewInventario && (
        <InventarioSection
          data={analysisData.inventario}
        />
      )}

      {userPermissions.canViewServicios && (
        <ServiciosSection
          data={analysisData.servicios}
        />
      )}

      <View style={styles.footerSpacing} />
    </ScrollView>
  );
};


export default StrategicAnalysisScreen;