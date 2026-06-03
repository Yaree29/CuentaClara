import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import colors from '../../theme/colors';
import { View, Text } from 'react-native';

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

const Tab = createBottomTabNavigator();

const TAB_CONFIG = {
  dashboard: { component: HomeScreen,      label: 'Inicio',      icon: HomeIcon },
  sales:     { component: SalesScreen,     label: 'Ventas',      icon: BanknotesIcon },
  credit:    { component: DebtScreen,      label: 'Fiado',       icon: CreditCardIcon },
  inventory: { component: InventoryScreen, label: 'Inventario',  icon: ArchiveBoxIcon },
};

const TAB_ORDER = ['dashboard', 'sales', 'credit', 'inventory'];

const MainNavigator = () => {
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
      {TAB_ORDER.map((mod) => {
        const { component, label, icon: IconComponent } = TAB_CONFIG[mod];
        return (
          <Tab.Screen
            key={mod}
            name={mod}
            component={component}
            options={{
              tabBarLabel: ({ focused, color }) => (
                <Text
                  style={{
                    fontSize: 15,
                    fontWeight: focused ? '700' : '500',
                    color,
                    marginBottom: 4,
                    marginTop: 4,
              }}
             >
              {label}
            </Text>
          ),

              tabBarIcon: ({ focused, color, size }) => (
                <View
                  style={{
                    backgroundColor: focused
                      ? 'rgba(20, 52, 93, 0.12)'
                      : 'transparent',

                    paddingHorizontal: 18,
                    paddingVertical: 2,
                    borderRadius: 25,

                    shadowColor: focused ? colors.tabIconActive : 'transparent',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: focused ? 0.15 : 0,
                    shadowRadius: 6,
                    elevation: focused ? 4 : 0,
                }}
              >
                <IconComponent size={size || 24} color={color} />
              </View>
              ),
            }}
          />
        );
      })}
    </Tab.Navigator>
  );
};

export default MainNavigator;