// =============================================================================
// MODIFICADO: 2026-05-20
// Propósito: Navegador principal de pestañas (bottom tabs). Construye
//            dinámicamente los tabs visibles a partir de los módulos activos
//            del negocio (useBlueprintStore), permitiendo bifurcar la
//            experiencia entre usuarios informales y PYME.
// Cambios:
//   - Se agregaron tres nuevas entradas al TAB_CONFIG: cash (Caja), purchases
//     (Compras) y staff (Personal), con sus respectivas pantallas placeholder.
//   - Se actualizó TAB_ORDER para incluir cash, purchases y staff en el orden
//     de aparición antes de profile.
//   - Se agregaron los imports de CashScreen, PurchasesScreen y StaffScreen.
// =============================================================================
import React from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import useBlueprintStore from '../../store/useBlueprintStore';
import HomeScreen from '../../modules/dashboard/screens/HomeScreen';
import InventoryScreen from '../../modules/inventory/screens/InventoryScreen';
import ProfileScreen from '../../modules/profile/screens/ProfileScreen';
import SalesScreen from '../../modules/sales/screens/SalesScreen';
import DebtScreen from '../../modules/credit/screens/DebtScreen';
import BillingScreen from '../../modules/Invoice/screens/BillingScreen';
import CashScreen from '../../modules/cash/screens/CashScreen';
import PurchasesScreen from '../../modules/purchases/screens/PurchasesScreen';
import StaffScreen from '../../modules/staff/screens/StaffScreen';

const Tab = createBottomTabNavigator();

// Cada entrada define la pantalla, etiqueta visible e ícono del tab.
// El orden aquí es el orden en que aparecen las pestañas.
// 'profile' se fuerza al final desde TAB_ORDER.
const TAB_CONFIG = {
  dashboard: { component: HomeScreen,      label: 'Inicio',      icon: '🏠' },
  sales:     { component: SalesScreen,     label: 'Ventas',      icon: '💰' },
  credit:    { component: DebtScreen,      label: 'Fiado',       icon: '📋' },
  inventory: { component: InventoryScreen, label: 'Inventario',  icon: '📦' },
  billing:   { component: BillingScreen,   label: 'Facturas',    icon: '🧾' },
  cash:      { component: CashScreen,      label: 'Caja',        icon: '💵' },
  purchases: { component: PurchasesScreen, label: 'Compras',     icon: '🛒' },
  staff:     { component: StaffScreen,     label: 'Personal',    icon: '👥' },
  profile:   { component: ProfileScreen,   label: 'Perfil',      icon: '👤' },
};

// Orden fijo de aparición — profile siempre al final
const TAB_ORDER = ['dashboard', 'sales', 'credit', 'inventory', 'billing', 'cash', 'purchases', 'staff', 'profile'];

const MainNavigator = () => {
  const modules = useBlueprintStore((state) => state.modules);

  if (!modules || modules.length === 0) return null;

  const visibleTabs = TAB_ORDER.filter((mod) => {
    if (mod === 'profile') return true; // perfil siempre visible
    return modules.includes(mod) && TAB_CONFIG[mod];
  });

  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      {visibleTabs.map((mod) => {
        const { component, label, icon } = TAB_CONFIG[mod];
        return (
          <Tab.Screen
            key={mod}
            name={mod}
            component={component}
            options={{
              tabBarLabel: label,
              tabBarIcon: ({ color }) => (
                <Text style={{ fontSize: 20 }}>{icon}</Text>
              ),
            }}
          />
        );
      })}
    </Tab.Navigator>
  );
};

export default MainNavigator;