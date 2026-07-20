// =============================================================================
// CREADO: 2026-07-19
// Propósito: Punto de entrada a los módulos PYME que dejaron de ser tabs fijos
//            (Compras, Servicios, Recetas, Comisiones,
//            Propinas, Ofertas, Inventario
//            Avanzado), más Análisis Estratégico, que se muestran siempre sin 
//            depender de enabled_modules.
//            Reutiliza el patrón MenuSection/MenuItem de SettingsScreen.jsx.
// =============================================================================
import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import useBlueprintStore from '../../../store/useBlueprintStore';
import colors from '../../../theme/colors';
import styles from '../styles/modules.styles';

const MenuItem = ({ icon, label, subLabel, onPress, isLast }) => (
  <TouchableOpacity style={[styles.menuItem, isLast && styles.menuItemLast]} onPress={onPress} activeOpacity={0.7}>
    <View style={[styles.iconContainer, styles.iconContainerBusiness]}>
      <Ionicons name={icon} size={20} color={colors.primary} />
    </View>
    <View style={styles.menuTextContainer}>
      <Text style={styles.menuLabel}>{label}</Text>
      {subLabel && <Text style={styles.menuSubLabel}>{subLabel}</Text>}
    </View>
    <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
  </TouchableOpacity>
);

const MenuSection = ({ title, children }) => (
  <View style={styles.menuSection}>
    <Text style={styles.menuSectionTitle}>{title}</Text>
    <View style={styles.menuSectionContent}>
      {children}
    </View>
  </View>
);

// Metadata de cada módulo activable por negocio: ícono, label y ruta del
// stack a la que navega (ver Stack.Screen en MainStackNavigator.jsx).
const OPTIONAL_MODULES = [
  { key: 'purchases',   icon: 'cart-outline',        label: 'Compras',    subLabel: 'Órdenes y proveedores',        route: 'purchases' },
  { key: 'staff',       icon: 'people-outline',      label: 'Personal',   subLabel: 'Empleados y roles',            route: 'staff' },
  { key: 'cash',        icon: 'calculator-outline',  label: 'Caja',       subLabel: 'Flujo de caja y arqueos',      route: 'cash' },
  { key: 'services',    icon: 'construct-outline',   label: 'Servicios',  subLabel: 'Catálogo de servicios',        route: 'services' },
  { key: 'recipes',     icon: 'book-outline',        label: 'Recetas',    subLabel: 'Fichas técnicas de productos', route: 'recipes' },
  { key: 'commissions', icon: 'stats-chart-outline', label: 'Comisiones', subLabel: 'Cálculo de comisiones',        route: 'commissions' },
  { key: 'tips',        icon: 'cash-outline',        label: 'Propinas',   subLabel: 'Registro de propinas',         route: 'tips' },
  { key: 'offers',      icon: 'pricetag-outline',    label: 'Ofertas',    subLabel: 'Promociones y descuentos',     route: 'offers' },
];

const ModulesScreen = () => {
  const navigation = useNavigation();
  const enabledModules = useBlueprintStore((state) => state.modules);

  const activeModules = OPTIONAL_MODULES.filter((mod) => enabledModules.includes(mod.key));

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

          <View style={styles.topBar}>
            <Text style={styles.headerTitle}>Módulos</Text>
          </View>

          <View style={styles.bodyContainer}>
            <MenuSection title="Herramientas">
              <MenuItem
                icon="bar-chart-outline"
                label="Análisis Estratégico"
                subLabel="Indicadores y proyecciones del negocio"
                onPress={() => navigation.navigate('StrategicAnalysis')}
              />
              <MenuItem
                icon="layers-outline"
                label="Inventario Avanzado"
                subLabel="Control de stock por categorías"
                isLast
                onPress={() => navigation.navigate('PymeInventory')}
              />
            </MenuSection>

            {activeModules.length > 0 && (
              <MenuSection title="Módulos activos del negocio">
                {activeModules.map((mod, index) => (
                  <MenuItem
                    key={mod.key}
                    icon={mod.icon}
                    label={mod.label}
                    subLabel={mod.subLabel}
                    isLast={index === activeModules.length - 1}
                    onPress={() => navigation.navigate(mod.route)}
                  />
                ))}
              </MenuSection>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

export default ModulesScreen;
