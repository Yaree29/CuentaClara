// =============================================================================
// ActivateModulesScreen.jsx
// -----------------------------------------------------------------------------
// Pantalla separada para activar módulos opcionales sin activación automática
// por category_group (Comisiones/Propinas/Ofertas — ver moduleConfig.js
// `toggleable`). Antes vivía inline dentro de ModulesScreen.jsx como una
// sección más de la lista; se saca a su propia pantalla para que
// "Herramientas" quede como un grid limpio de módulos ya disponibles, y
// activar uno nuevo sea una acción explícita en otro lugar.
// =============================================================================
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import useBlueprintStore from '../../../store/useBlueprintStore';
import businessService from '../../../services/businessService';
import moduleConfig from '../../dashboard/engine/moduleConfig';
import colors from '../../../theme/colors';
import styles from '../styles/modules.styles';
import profileStyles from '../../profile/styles/profile.styles';

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

const ActivateModulesScreen = () => {
  const navigation = useNavigation();
  const enabledModules = useBlueprintStore((state) => state.modules);
  const setModules = useBlueprintStore((state) => state.setModules);
  const [activatingKey, setActivatingKey] = useState(null);

  const activatableModules = OPTIONAL_MODULES.filter(
    (mod) => mod.toggleable && !enabledModules.includes(mod.key)
  );

  const handleActivate = async (mod) => {
    setActivatingKey(mod.key);
    try {
      const result = await businessService.setModuleActive(mod.key, true);
      setModules(result?.enabled_modules);
      Alert.alert('Módulo activado', `"${mod.label}" ya está disponible en "Herramientas".`);
    } catch (error) {
      Alert.alert('No se pudo activar', error?.message || 'Intenta de nuevo en unos segundos.');
    } finally {
      setActivatingKey(null);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={profileStyles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={profileStyles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={profileStyles.headerTitle}>Activar módulos</Text>
        <View style={profileStyles.headerPlaceholder} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.bodyContainer}>
          {activatableModules.length === 0 ? (
            <Text style={styles.emptyStateText}>Ya activaste todos los módulos disponibles.</Text>
          ) : (
            <View style={styles.menuSection}>
              <View style={styles.menuSectionContent}>
                {activatableModules.map((mod, index) => {
                  const IconComponent = mod.icon;
                  const isActivating = activatingKey === mod.key;
                  return (
                    <TouchableOpacity
                      key={mod.key}
                      style={[styles.menuItem, index === activatableModules.length - 1 && styles.menuItemLast]}
                      onPress={() => handleActivate(mod)}
                      activeOpacity={0.7}
                      disabled={isActivating}
                    >
                      <View style={[styles.iconContainer, styles.iconContainerBusiness]}>
                        <IconComponent size={20} color={colors.primary} />
                      </View>
                      <View style={styles.menuTextContainer}>
                        <Text style={styles.menuLabel}>{mod.label}</Text>
                        {mod.subLabel && <Text style={styles.menuSubLabel}>{mod.subLabel}</Text>}
                      </View>
                      {isActivating ? (
                        <ActivityIndicator size="small" color={colors.primary} />
                      ) : (
                        <View style={styles.activateButton}>
                          <Text style={styles.activateText}>Activar</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ActivateModulesScreen;
