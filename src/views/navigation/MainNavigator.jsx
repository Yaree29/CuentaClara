import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import colors from '../../theme/colors';
import { View, Text, StyleSheet, Animated } from 'react-native';

// Iconos Heroicons Solid
import { 
  HomeIcon, 
  BanknotesIcon, 
  CreditCardIcon, 
  ArchiveBoxIcon 
} from 'react-native-heroicons/solid';

// Pantallas
import HomeScreen from '../../modules/dashboard/screens/HomeScreen';
import InventoryScreen from '../../modules/inventory/screens/InventoryScreen';
import SalesScreen from '../../modules/sales/screens/SalesScreen';
import DebtScreen from '../../modules/credit/screens/DebtScreen';

import useAuthStore from '../../store/useAuthStore';

const Tab = createBottomTabNavigator();

const TAB_CONFIG = {
  dashboard: { component: HomeScreen,      label: 'Inicio',      icon: HomeIcon },
  sales:     { component: SalesScreen,     label: 'Ventas',      icon: BanknotesIcon },
  credit:    { component: DebtScreen,      label: 'Fiado',       icon: CreditCardIcon },
  inventory: { component: InventoryScreen, label: 'Inventario',  icon: ArchiveBoxIcon },
};

const TAB_ORDER = ['dashboard', 'sales', 'credit', 'inventory'];

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
  const user = useAuthStore((state) => state.user);
  const enabledModules = user?.enabled_modules || ['dashboard', 'sales', 'credit', 'inventory'];
  const insets = useSafeAreaInsets();

  // Filtrar los módulos que se mostrarán en la barra de navegación inferior
  const visibleTabs = TAB_ORDER.filter((mod) => enabledModules.includes(mod));

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

          // Se suma insets.bottom para reservar el espacio de la barra de
          // navegación del sistema (Android edge-to-edge) y evitar que los
          // botones "atrás/inicio/recientes" se superpongan con la tab bar.
          height: 72 + insets.bottom,
          paddingTop: 6,
          paddingBottom: 8 + insets.bottom,

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