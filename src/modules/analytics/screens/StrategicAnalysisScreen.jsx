import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../../../theme/colors';
import styles from '../styles/StrategicAnalysisScreen.styles';
import profileStyles from '../../profile/styles/profile.styles';
import VentasSection from '../utils/VentasSection';
import FinanzasSection from '../utils/FinanzasSection';
import InventarioSection from '../utils/InventarioSection';
import { useStrategicSections } from '../hooks/useStrategicSections';

const SECTION_COMPONENTS = {
  ventas: VentasSection,
  finanzas: FinanzasSection,
  inventario: InventarioSection,
};

const StrategicAnalysisScreen = () => {
  const navigation = useNavigation();
  const { loading, order, dataBySection } = useStrategicSections();

  return (
    <SafeAreaView style={styles.mainContainer} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header con botón "atrás" */}
        <View style={profileStyles.topBar}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={profileStyles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.primary} />
          </TouchableOpacity>
          <Text style={profileStyles.headerTitle}>Reportes y Analíticas</Text>
          <View style={profileStyles.headerPlaceholder} />
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Cargando reportes...</Text>
          </View>
        ) : (
          <View style={styles.content}>
            {/* Banner indicativo  */}
            <View style={styles.banner}>
              <Text style={styles.bannerKicker}>Análisis estratégico</Text>
              <Text style={styles.bannerTitle}>Vista resumida de tu negocio.</Text>
              <Text style={styles.bannerSubtitle}>
                Aquí encontrarás un resumen de los indicadores más importantes de tu negocio. Utiliza esta información para tomar decisiones informadas y estratégicas.
              </Text>
            </View>

            {order.map((sectionKey) => {
              const SectionComponent = SECTION_COMPONENTS[sectionKey];
              return <SectionComponent key={sectionKey} data={dataBySection[sectionKey]} />;
            })}

            <View style={styles.footerSpacing} />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default StrategicAnalysisScreen;
