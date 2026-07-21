// =============================================================================
// CREADO: 2026-07-19
// MODIFICADO: 2026-07-21
// Propósito: Punto de entrada a los módulos PYME que dejaron de ser tabs fijos
//            (Compras, Personal, Caja, Servicios, Recetas, Comisiones,
//            Propinas, Ofertas), más Análisis Estratégico e Inventario
//            Avanzado, que se muestran siempre sin depender de enabled_modules.
//            Reutiliza el patrón MenuSection/MenuItem de SettingsScreen.jsx.
//
// La lista de módulos opcionales ya no vive hardcodeada aquí — se deriva de
// dashboard/engine/moduleConfig.js, que a su vez refleja ALL_VALID_MODULES
// del backend (fuente única de verdad, ver auth_service.py). Los módulos
// marcados `toggleable` en moduleConfig.js (Comisiones/Propinas/Ofertas, sin
// activación automática por category_group) se activan aquí mismo vía
// PUT /businesses/me/modules, en vez del bloque QA-visual temporal anterior.
// =============================================================================
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import useBlueprintStore from '../../../store/useBlueprintStore';
import businessService from '../../../services/businessService';
import moduleConfig from '../../dashboard/engine/moduleConfig';
import colors from '../../../theme/colors';
import styles from '../styles/modules.styles';

const MenuItem = ({ icon, label, subLabel, onPress, isLast, disabled, rightSlot }) => {
  // moduleConfig.js entrega íconos como componentes Heroicons; los ítems fijos
  // de "Herramientas" siguen usando nombres de Ionicons — se soportan ambos.
  const IconComponent = typeof icon === 'function' ? icon : null;

  return (
    <TouchableOpacity
      style={[styles.menuItem, isLast && styles.menuItemLast]}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={disabled}
    >
      <View style={[styles.iconContainer, styles.iconContainerBusiness]}>
        {IconComponent ? (
          <IconComponent size={20} color={colors.primary} />
        ) : (
          <Ionicons name={icon} size={20} color={colors.primary} />
        )}
      </View>
      <View style={styles.menuTextContainer}>
        <Text style={styles.menuLabel}>{label}</Text>
        {subLabel && <Text style={styles.menuSubLabel}>{subLabel}</Text>}
      </View>
      {rightSlot || <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />}
    </TouchableOpacity>
  );
};

const MenuSection = ({ title, children }) => (
  <View style={styles.menuSection}>
    <Text style={styles.menuSectionTitle}>{title}</Text>
    <View style={styles.menuSectionContent}>
      {children}
    </View>
  </View>
);

// Módulos opcionales (no tabs fijos) derivados de moduleConfig.js: solo los
// que tienen `optional: true` y una `route` de Stack.Screen navegable.
const OPTIONAL_MODULES = Object.values(moduleConfig)
  .filter((mod) => mod.optional && mod.route)
  .map((mod) => ({
    key: mod.id,
    icon: mod.icon,
    label: mod.name,
    subLabel: mod.subLabel,
    route: mod.route,
    toggleable: !!mod.toggleable,
  }));

const ModulesScreen = () => {
  const navigation = useNavigation();
  const enabledModules = useBlueprintStore((state) => state.modules);
  const setModules = useBlueprintStore((state) => state.setModules);
  const [activatingKey, setActivatingKey] = useState(null);

  const activeModules = OPTIONAL_MODULES.filter((mod) => enabledModules.includes(mod.key));

  // Módulos sin activación automática por category_group (Comisiones/Propinas/
  // Ofertas) que el negocio todavía no tiene activos — se ofrecen para
  // activar manualmente en vez de navegar directo.
  const activatableModules = OPTIONAL_MODULES.filter(
    (mod) => mod.toggleable && !enabledModules.includes(mod.key)
  );

  const handleActivate = async (mod) => {
    setActivatingKey(mod.key);
    try {
      const result = await businessService.setModuleActive(mod.key, true);
      setModules(result?.enabled_modules);
      Alert.alert('Módulo activado', `"${mod.label}" ya está disponible en "Módulos activos del negocio".`);
    } catch (error) {
      Alert.alert('No se pudo activar', error?.message || 'Intenta de nuevo en unos segundos.');
    } finally {
      setActivatingKey(null);
    }
  };

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

            {activatableModules.length > 0 && (
              <MenuSection title="Activar módulos">
                {activatableModules.map((mod, index) => {
                  const isActivating = activatingKey === mod.key;
                  return (
                    <MenuItem
                      key={mod.key}
                      icon={mod.icon}
                      label={mod.label}
                      subLabel={mod.subLabel}
                      isLast={index === activatableModules.length - 1}
                      disabled={isActivating}
                      onPress={() => handleActivate(mod)}
                      rightSlot={
                        isActivating ? (
                          <ActivityIndicator size="small" color={colors.primary} />
                        ) : (
                          <View style={styles.activateButton}>
                            <Text style={styles.activateText}>Activar</Text>
                          </View>
                        )
                      }
                    />
                  );
                })}
              </MenuSection>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

export default ModulesScreen;
