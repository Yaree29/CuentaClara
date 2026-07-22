// =============================================================================
// CREADO: 2026-07-19
// MODIFICADO: 2026-07-22
// Propósito: Punto de entrada a los módulos PYME que dejaron de ser tabs fijos
//            (Compras, Servicios, Recetas, Comisiones, Propinas, Ofertas),
//            más Análisis Estratégico e Inventario Avanzado, que se muestran
//            siempre sin depender de enabled_modules.
//            "Personal"/"Caja" ya no viven aquí (ver auditoría más abajo).
//
// "Herramientas" pasó de lista vertical a grid de 2 columnas: Análisis
// Estratégico queda como tarjeta destacada de ancho completo (es el módulo
// con más profundidad de datos); el resto (Inventario Avanzado + los módulos
// opcionales ya activos del negocio) son tarjetas cuadradas.
//
// La activación de módulos (Comisiones/Propinas/Ofertas) se movió a su propia
// pantalla (ActivateModulesScreen.jsx) — antes vivía inline aquí como una
// sección más, y además `activeModules` se calculaba pero nunca se
// renderizaba: un módulo recién activado desaparecía sin dejar rastro de
// cómo entrar. Ahora, al volver de activar uno, aparece como tarjeta
// navegable en este mismo grid (se deriva de useBlueprintStore, que
// ActivateModulesScreen actualiza al activar).
//
// La lista de módulos opcionales ya no vive hardcodeada aquí — se deriva de
// dashboard/engine/moduleConfig.js, que a su vez refleja ALL_VALID_MODULES
// del backend (fuente única de verdad, ver auth_service.py).
// =============================================================================
import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { ChartBarSquareIcon } from 'react-native-heroicons/outline';
import useBlueprintStore from '../../../store/useBlueprintStore';
import moduleConfig from '../../dashboard/engine/moduleConfig';
import colors from '../../../theme/colors';
import styles from '../styles/modules.styles';
import DashboardHeader from '../../dashboard/components/shared/DashboardHeader';

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

const FeaturedToolCard = ({ icon: Icon, label, subLabel, onPress }) => (
  <TouchableOpacity style={styles.featuredCard} onPress={onPress} activeOpacity={0.8}>
    <View style={styles.featuredIconContainer}>
      <Icon size={26} color={colors.textButton} />
    </View>
    <View style={styles.featuredTextContainer}>
      <Text style={styles.featuredLabel}>{label}</Text>
      {subLabel && <Text style={styles.featuredSubLabel}>{subLabel}</Text>}
    </View>
    <Ionicons name="chevron-forward" size={20} color={colors.textButton} />
  </TouchableOpacity>
);

const ToolCard = ({ icon: Icon, label, subLabel, onPress }) => (
  <TouchableOpacity style={styles.toolCard} onPress={onPress} activeOpacity={0.8}>
    <View style={styles.toolIconContainer}>
      <Icon size={22} color={colors.primary} />
    </View>
    <Text style={styles.toolLabel} numberOfLines={2}>{label}</Text>
    {subLabel && <Text style={styles.toolSubLabel} numberOfLines={2}>{subLabel}</Text>}
  </TouchableOpacity>
);

const ModulesScreen = () => {
  const navigation = useNavigation();
  const enabledModules = useBlueprintStore((state) => state.modules);

  // Módulos opcionales ya activos del negocio (auto-activados por
  // category_group, o activados manualmente en ActivateModulesScreen) —
  // se muestran como tarjetas navegables dentro del grid, igual que
  // Inventario Avanzado.
  const activeModules = OPTIONAL_MODULES.filter((mod) => enabledModules.includes(mod.key));

  const activatableCount = OPTIONAL_MODULES.filter(
    (mod) => mod.toggleable && !enabledModules.includes(mod.key)
  ).length;

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <DashboardHeader title="Módulos" />

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

          <View style={styles.bodyContainer}>
            <FeaturedToolCard
              icon={ChartBarSquareIcon}
              label="Análisis Estratégico"
              subLabel="Indicadores y proyecciones del negocio"
              onPress={() => navigation.navigate('StrategicAnalysis')}
            />

            <View style={styles.grid}>
              <ToolCard
                icon={moduleConfig.inventory.icon}
                label="Inventario Avanzado"
                subLabel="Control de stock por categorías"
                onPress={() => navigation.navigate('PymeInventory')}
              />

              {activeModules.map((mod) => {
                const IconComponent = mod.icon;
                return (
                  <ToolCard
                    key={mod.key}
                    icon={IconComponent}
                    label={mod.label}
                    subLabel={mod.subLabel}
                    onPress={() => navigation.navigate(mod.route)}
                  />
                );
              })}
            </View>

            {activatableCount > 0 && (
              <>
                <View style={styles.sectionSeparator} />
                <TouchableOpacity
                  style={styles.activateMoreCard}
                  onPress={() => navigation.navigate('ActivateModules')}
                  activeOpacity={0.8}
                >
                  <Ionicons name="add-circle-outline" size={20} color={colors.primary} />
                  <Text style={styles.activateMoreText}>Activar más módulos</Text>
                  <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
                </TouchableOpacity>
              </>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

export default ModulesScreen;
