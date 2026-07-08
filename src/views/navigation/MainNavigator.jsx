import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import colors from '../../theme/colors';
import { View, Text, StyleSheet, Animated } from 'react-native';
import useBlueprintStore from '../../store/useBlueprintStore';

// Iconos Heroicons Solid
import {
  HomeIcon,
  BanknotesIcon,
  CreditCardIcon,
  ArchiveBoxIcon,
  TruckIcon,
  DocumentTextIcon,
  UserGroupIcon,
  CalculatorIcon,
} from 'react-native-heroicons/solid';

// Pantallas
import HomeScreen from '../../modules/dashboard/screens/HomeScreen';
import InventoryScreen from '../../modules/inventory/screens/InventoryScreen';
import SalesScreen from '../../modules/sales/screens/SalesScreen';
import DebtScreen from '../../modules/credit/screens/DebtScreen';
import PurchasesScreen from '../../modules/purchases/screens/PurchasesScreen';
import BillingScreen from '../../modules/Invoice/screens/BillingScreen';
import StaffScreen from '../../modules/staff/screens/StaffScreen';
import CashScreen from '../../modules/cash/screens/CashScreen';

const Tab = createBottomTabNavigator();

// Registro de todos los módulos que pueden aparecer como tab. La clave debe
// coincidir con el nombre que devuelve GET /auth/context en enabled_modules
// (ver auth_service.ALL_VALID_MODULES + BASE_MODULES en el backend).
const TAB_CONFIG = {
  dashboard: { component: HomeScreen,      label: 'Inicio',      icon: HomeIcon },
  sales:     { component: SalesScreen,     label: 'Ventas',      icon: BanknotesIcon },
  credit:    { component: DebtScreen,      label: 'Fiado',       icon: CreditCardIcon },
  inventory: { component: InventoryScreen, label: 'Inventario',  icon: ArchiveBoxIcon },
  purchases: { component: PurchasesScreen, label: 'Compras',     icon: TruckIcon },
  billing:   { component: BillingScreen,   label: 'Facturación', icon: DocumentTextIcon },
  staff:     { component: StaffScreen,     label: 'Personal',    icon: UserGroupIcon },
  cash:      { component: CashScreen,      label: 'Caja',        icon: CalculatorIcon },
};

// Orden canónico: define la posición de cada tab si está habilitado, no cuáles
// se muestran. "dashboard" siempre va primero (BASE_MODULES lo garantiza).
const CANONICAL_TAB_ORDER = [
  'dashboard', 'sales', 'billing', 'purchases', 'credit', 'inventory', 'cash', 'staff',
];

// Fallback usado si el blueprint aún no cargó (ej. primer render tras login) —
// reproduce el set de tabs que tenía la app antes de esta pantalla, para que
// nunca se muestre una barra de tabs vacía o rota.
const FALLBACK_TAB_ORDER = ['dashboard', 'sales', 'credit', 'inventory'];

const resolveTabOrder = (enabledModules) => {
  if (!enabledModules || enabledModules.length === 0) {
    return FALLBACK_TAB_ORDER;
  }

  const enabled = new Set(enabledModules);
  const tabs = CANONICAL_TAB_ORDER.filter((mod) => mod !== 'dashboard' && enabled.has(mod) && TAB_CONFIG[mod]);

  return ['dashboard', ...tabs];
};

// Componente animado personalizado para los iconos del Tab Bar
const AnimatedTabBarIcon = ({ focused, children }) => {
  const bounceAnim = React.useRef(new Animated.Value(0)).current;
  const scaleAnim = React.useRef(new Animated.Value(0.8)).current;
  const opacityAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (focused) {
      // Animación de salto con resorte
      Animated.spring(bounceAnim, {
        toValue: -4,
        friction: 8,
        tension: 90,
        useNativeDriver: true,
      }).start();

      // Animación de escala y opacidad de la sombra circular (ripple)
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1.1,
          duration: 212,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Reestablecer animaciones
      Animated.spring(bounceAnim, {
        toValue: 0,
        friction: 6,
        tension: 50,
        useNativeDriver: true,
      }).start();

      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 120,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [focused]);

  return (
    <View style={styles.iconWrapper}>
      <Animated.View
        style={[
          styles.rippleBg,
          {
            opacity: opacityAnim,
            transform: [
              { translateY: -4 },
              { scale: scaleAnim }],
          },
        ]}
      />
      <Animated.View
        style={{
          transform: [{ translateY: bounceAnim }],
        }}
      >
        {children}
      </Animated.View>
    </View>
  );
};

const MainNavigator = () => {
  const enabledModules = useBlueprintStore((state) => state.modules);
  const visibleTabs = resolveTabOrder(enabledModules);

  return (
    <Tab.Navigator 
      screenOptions={{ 
        headerShown: false,

        tabBarActiveTintColor: colors.tabIconActive,
        tabBarInactiveTintColor: colors.tabIcon,

        tabBarShowLabel: true,

        tabBarStyle: {
          backgroundColor: colors.tabBackground,
          borderTopWidth: 0,

          height: 72,
          paddingTop: 6,
          paddingBottom: 8,

          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: -3,
          },
          shadowOpacity: 0.05,
          shadowRadius: 6,
          elevation: 12,
        },
      }}
    >
      {visibleTabs.map((mod) => {
        const { component, label, icon: IconComponent } = TAB_CONFIG[mod];
        return (
          <Tab.Screen
            key={mod}
            name={mod}
            component={component}
            options={{
              tabBarLabel: ({ focused, color }) => (
                <Text
                  style={[
                    styles.tabLabel,
                    {
                      fontWeight: focused ? '700' : '500',
                      color,
                    }
                  ]}
                >
                  {label}
                </Text>
              ),

              tabBarIcon: ({ focused, color, size }) => (
                <AnimatedTabBarIcon focused={focused}>
                  <IconComponent size={size || 24} color={color} />
                </AnimatedTabBarIcon>
              ),
            }}
          />
        );
      })}
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  iconWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 45,
    height: 45,
  },
  rippleBg: {
    position: 'absolute',
    width: 40,
    height: 30,
    borderRadius: 22.5,
    backgroundColor: colors.primary + '26', // Sombra circular con opacidad del ~15%
  },

  tabLabel: {
    fontSize: 15,
    marginBottom: 4,
    marginTop: 4,
  },
});

export default MainNavigator;