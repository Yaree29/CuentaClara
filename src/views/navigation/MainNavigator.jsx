// =============================================================================
// Navegador principal de pestañas (bottom tabs). Construye dinámicamente los
// tabs visibles a partir de los módulos activos del negocio (useBlueprintStore),
// usando los estilos visuales de Heroicons.
// =============================================================================
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View } from 'react-native';
import colors from '../../theme/colors';
import useBlueprintStore from '../../store/useBlueprintStore';

// Importación de íconos
import { 
  HomeIcon, 
  BanknotesIcon, 
  CreditCardIcon, 
  ArchiveBoxIcon, 
  WrenchScrewdriverIcon, 
  DocumentTextIcon, 
  ChartBarIcon,
  CurrencyDollarIcon,
  ShoppingCartIcon,
  UserGroupIcon,
  UserIcon,
} from 'react-native-heroicons/solid';

// Importación de pantallas
import HomeScreen from '../../modules/dashboard/screens/HomeScreen';
import InventoryScreen from '../../modules/inventory/screens/InventoryScreen';
import SalesScreen from '../../modules/sales/screens/SalesScreen';
import DebtScreen from '../../modules/credit/screens/DebtScreen';
import BillingScreen from '../../modules/Invoice/screens/BillingScreen';
import ServicesScreen from '../../modules/services/screens/ServicesScreen';
import ReportsScreen from '../../modules/reports/screens/ReportsScreen';
import CashScreen from '../../modules/cash/screens/CashScreen';
import PurchasesScreen from '../../modules/purchases/screens/PurchasesScreen';
import StaffScreen from '../../modules/staff/screens/StaffScreen';
import ProfileScreen from '../../modules/profile/screens/ProfileScreen';

const Tab = createBottomTabNavigator();

// Cada entrada define la pantalla, etiqueta visible e ícono del tab.
const TAB_CONFIG = {
  dashboard: { component: HomeScreen,      label: 'Inicio',      icon: HomeIcon },
  sales:     { component: SalesScreen,     label: 'Ventas',      icon: BanknotesIcon },
  credit:    { component: DebtScreen,      label: 'Fiado',       icon: CreditCardIcon },
  inventory: { component: InventoryScreen, label: 'Inventario',  icon: ArchiveBoxIcon },
  billing:   { component: BillingScreen,   label: 'Facturas',    icon: DocumentTextIcon },
  services:  { component: ServicesScreen,  label: 'Servicios',   icon: WrenchScrewdriverIcon },
  reports:   { component: ReportsScreen,   label: 'Reportes',    icon: ChartBarIcon },
  cash:      { component: CashScreen,      label: 'Caja',        icon: CurrencyDollarIcon },
  purchases: { component: PurchasesScreen, label: 'Compras',     icon: ShoppingCartIcon },
  staff:     { component: StaffScreen,     label: 'Personal',    icon: UserGroupIcon },
  profile:   { component: ProfileScreen,   label: 'Perfil',      icon: UserIcon },
};

// Orden fijo de aparición — profile siempre al final
const TAB_ORDER = ['dashboard', 'sales', 'credit', 'inventory', 'billing', 'services', 'reports', 'cash', 'purchases', 'staff', 'profile'];

const MainNavigator = () => {
  const modules = useBlueprintStore((state) => state.modules);

  if (!modules || modules.length === 0) return null;

  const visibleTabs = TAB_ORDER.filter((mod) => {
    if (mod === 'profile') return true; // perfil siempre visible
    return modules.includes(mod) && TAB_CONFIG[mod];
  });

  return (
    <Tab.Navigator 
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary, 
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          paddingBottom: 6,
        },
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopWidth: 0, 
          elevation: 12, 
          shadowColor: '#000', 
          shadowOffset: { width: 0, height: -3 },
          shadowOpacity: 0.05,
          shadowRadius: 6,
          height: 65, 
        },
        tabBarIcon: ({ focused, color }) => {
          const config = TAB_CONFIG[route.name];
          const IconComponent = config?.icon;

          return (
            <View style={{
              backgroundColor: focused ? `${colors.primary}15` : 'transparent',
              paddingHorizontal: 16,
              paddingVertical: 4,
              borderRadius: 20,
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: 4, 
            }}>
              {IconComponent && <IconComponent size={22} color={color} />}
            </View>
          );
        },
      })}
    >
      {visibleTabs.map((mod) => {
        const { component, label } = TAB_CONFIG[mod];
        return (
          <Tab.Screen
            key={mod}
            name={mod}
            component={component}
            options={{
              tabBarLabel: label,
            }}
          />
        );
      })}
    </Tab.Navigator>
  );
};

export default MainNavigator;