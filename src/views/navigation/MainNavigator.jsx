import React, { useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import colors from '../../theme/colors';
import { View, Text, StyleSheet, Animated, BackHandler } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import useAuthStore from '../../store/useAuthStore';
import useAssistantModeStore from '../../store/useAssistantModeStore';
import useAssistantSession from '../../modules/assistants/hooks/useAssistantSession';

// Iconos Heroicons Solid
import {
  HomeIcon,
  BanknotesIcon,
  CreditCardIcon,
  ArchiveBoxIcon,
  DocumentTextIcon,
  Squares2X2Icon,
  ArrowRightOnRectangleIcon,
} from 'react-native-heroicons/solid';

// Pantallas
import HomeScreen from '../../modules/dashboard/screens/HomeScreen';
import InventoryScreen from '../../modules/inventory/screens/InventoryScreen';
import SalesScreen from '../../modules/sales/screens/SalesScreen';
import DebtScreen from '../../modules/credit/screens/DebtScreen';
import BillingScreen from '../../modules/Invoice/screens/BillingScreen';
import ModulesScreen from '../../modules/modules/screens/ModulesScreen';
import PymeInventory from '../../modules/inventory/components/PymeInventory';

const Tab = createBottomTabNavigator();

// Registro de los tabs fijos por tipo de usuario. Los módulos PYME que antes
// eran tabs dinámicos (Compras, Personal, Caja, Servicios, Recetas,
// Comisiones, Propinas, Ofertas) ahora viven como screens del stack,
// navegables desde ModulesScreen (tab "modules").
const TAB_CONFIG = {
  dashboard: { component: HomeScreen,      label: 'Inicio',   icon: HomeIcon },
  sales:     { component: SalesScreen,     label: 'Ventas',   icon: BanknotesIcon },
  credit:    { component: DebtScreen,      label: 'Fiado',    icon: CreditCardIcon },
  inventory: { component: InventoryScreen, label: 'Inventario', icon: ArchiveBoxIcon },
  billing:   { component: BillingScreen,   label: 'MiRUC',    icon: DocumentTextIcon },
  modules:   { component: ModulesScreen,   label: 'Módulos',  icon: Squares2X2Icon },
  // Tab de Inventario para el Modo Asistente. Reutiliza el placeholder
  // PymeInventory ("en construcción") — ver resolveInventoryScreen.js para el
  // punto de extensión futuro (business.inventory_mode).
  assistantInventory: { component: PymeInventory, label: 'Inventario', icon: ArchiveBoxIcon },
};

// Tabs fijos por tipo de usuario: Informal conserva el flujo rápido con
// Fiado + Inventario propios; PYME usa Facturación (MiRUC) + Módulos como
// punto de entrada al resto de funcionalidades del negocio.
const INFORMAL_TABS = ['dashboard', 'sales', 'credit', 'inventory'];
const PYME_TABS = ['dashboard', 'sales', 'billing', 'modules'];

// Tabs por access_type cuando hay un asistente activo (Modo Asistente).
// Reemplaza por completo a INFORMAL_TABS/PYME_TABS mientras dure la sesión
// del asistente — ignora userType, el asistente nunca ve más que su acceso.
// Sin tab "Inicio" (AssistantDashboard.jsx queda sin usar, no se borró el
// archivo por si se reintroduce) — el primer elemento de cada arreglo es la
// pantalla inicial tras verificar el PIN (ver AssistantSelectScreen.jsx).
const ASSISTANT_TABS = {
  sales: ['sales'],
  inventory: ['assistantInventory'],
  both: ['sales', 'assistantInventory'],
};

const resolveTabOrder = (userType, activeAssistant) => {
  if (activeAssistant) {
    return ASSISTANT_TABS[activeAssistant.access_type] || ASSISTANT_TABS.sales;
  }
  return userType === 'informal' ? INFORMAL_TABS : PYME_TABS;
};

// Tab "Salir" (solo Modo Asistente): nunca renderiza pantalla propia — el
// tabPress se intercepta en el listener de abajo antes de que React
// Navigation llegue a montar este componente.
const ExitAssistantScreen = () => null;

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
  const navigation = useNavigation();
  const userType = useAuthStore((state) => state.user?.userType);
  const activeAssistant = useAssistantModeStore((state) => state.activeAssistant);
  const exitAssistant = useAssistantModeStore((state) => state.exitAssistant);
  const visibleTabs = resolveTabOrder(userType, activeAssistant);

  // Polling de bloqueo del asistente activo — antes vivía en HomeScreen.jsx
  // (tab "Inicio"), pero ese tab ya no existe en Modo Asistente. Se monta
  // aquí porque MainNavigator persiste durante toda la sesión de tabs, sin
  // importar cuál esté enfocado (a diferencia de un tab individual).
  useAssistantSession();

  // Bloquea el back físico de Android mientras haya un asistente activo —
  // no debe poder salir del stack de Modo Asistente ni cerrar la app.
  // Mismo patrón que AssistantSelectScreen.jsx / ExitAssistantModeModal.jsx
  // (BackHandler.addEventListener('hardwareBackPress', () => true)), pero
  // aquí sin useFocusEffect: MainNavigator no gana/pierde foco por sí mismo
  // mientras dura la sesión de tabs, así que reacciona directo a
  // activeAssistant en vez de al foco de pantalla.
  useEffect(() => {
    if (!activeAssistant) return undefined;
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => true);
    return () => subscription.remove();
  }, [activeAssistant]);

  // Botón "Salir" del navbar (Modo Asistente): sin modal ni contraseña —
  // vuelve directo al selector de nombres (exitAssistant conserva
  // isActive=true, solo limpia activeAssistant). Nunca navega al Home del
  // dueño.
  //
  // reset() en vez de navigate(): navigate() apilaba "AssistantSelect" sobre
  // "MainTabs" sin desmontarlo, y como exitAssistant() limpia activeAssistant
  // de forma síncrona, MainNavigator (todavía montado detrás) podía
  // recalcular PYME_TABS/INFORMAL_TABS (con Home) antes de que la transición
  // terminara — flash del dashboard del dueño. reset() reemplaza el stack
  // completo por ["AssistantSelect"], desmontando MainTabs de una vez.
  //
  // Orden: reset() primero, exitAssistant() después. Si el orden fuera al
  // revés y MainNavigator llegara a re-renderizar antes de que la
  // navegación surta efecto, todavía vería activeAssistant=null y mostraría
  // los tabs del dueño (el mismo flash); en este orden, si llega a
  // re-renderizar de todos modos, activeAssistant sigue activo y muestra
  // los mismos tabs de asistente que ya estaban en pantalla (sin cambio
  // visible) mientras AssistantSelect toma el control.
  const handleExitAssistant = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'AssistantSelect' }],
    });
    exitAssistant();
  };

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

      {activeAssistant && (
        <Tab.Screen
          name="exitAssistant"
          component={ExitAssistantScreen}
          listeners={{
            tabPress: (e) => {
              e.preventDefault();
              handleExitAssistant();
            },
          }}
          options={{
            tabBarLabel: ({ color }) => (
              <Text style={[styles.tabLabel, { fontWeight: '500', color }]}>Salir</Text>
            ),
            tabBarIcon: ({ color, size }) => (
              <AnimatedTabBarIcon focused={false}>
                <ArrowRightOnRectangleIcon size={size || 24} color={color} />
              </AnimatedTabBarIcon>
            ),
          }}
        />
      )}
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