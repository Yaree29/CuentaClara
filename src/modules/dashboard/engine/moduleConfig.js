import {BanknotesIcon,CubeIcon,
  ClipboardDocumentListIcon,
  WrenchScrewdriverIcon,
  ChartBarIcon,
  GiftIcon,
  CurrencyDollarIcon,
  ShoppingCartIcon,
  BuildingStorefrontIcon,
} from 'react-native-heroicons/outline';

// Fuente única de verdad: backend `ALL_VALID_MODULES` (auth_service.py).
// Cada entrada aquí debe corresponder 1:1 a una clave real de enabled_modules
// — no se inventan sub-claves que el backend nunca produce (ver auditoría:
// 'basic_inventory'/'advanced_inventory' no existían en el backend, que solo
// maneja 'inventory').
//
// `optional`: aparece en la "Biblioteca de Módulos" de ModulesScreen.jsx
//   (módulos que no son tabs fijos). Ausente/false = módulo core, no se lista ahí.
// `toggleable`: además de navegar, ModulesScreen ofrece activarlo/desactivarlo
//   vía PUT /businesses/me/modules (módulos sin activación automática por
//   category_group — ver DASHBOARD_PYMES.md "Biblioteca de Módulos").
// `route`: nombre de Stack.Screen en MainStackNavigator.jsx.
const moduleConfig = {

  sales: {
    id: 'sales',
    name: 'Ventas',
    icon: BanknotesIcon,
    enabled: true,

    dashboard: {
      summary: true,
      alerts: true,
      quickActions: true,
      finance: true,
      activity: true,
    },

    quickActions: [
      'new_sale',
      'register_expense',
    ],
  },

  inventory: {
    id: 'inventory',
    name: 'Inventario',
    icon: CubeIcon,
    enabled: true,

    dashboard: {
      summary: false,
      alerts: true,
      quickActions: true,
      finance: false,
      activity: false,
    },

    quickActions: [
      'new_product',
      'inventory_entry',
    ],
  },

  recipes: {
    id: 'recipes',
    name: 'Recetas',
    icon: ClipboardDocumentListIcon,
    enabled: true,
    optional: true,
    route: 'recipes',
    subLabel: 'Fichas técnicas de productos',

    dashboard: {
      summary: false,
      alerts: true,
      quickActions: true,
    },

    quickActions: [
      'new_recipe',
      'register_production',
    ],
  },

  services: {
    id: 'services',
    name: 'Servicios',
    icon: WrenchScrewdriverIcon,
    enabled: true,
    // Pendiente de auditoría propia: no está en ALL_VALID_MODULES del backend
    // todavía, así que aunque quede listado aquí, nunca aparecerá activo.
    optional: true,
    route: 'services',
    subLabel: 'Catálogo de servicios',

    dashboard: {
      summary: true,
      alerts: true,
      quickActions: true,
      activity: true,
    },

    quickActions: [
      'new_service',
      'new_appointment',
    ],
  },

  commissions: {
    id: 'commissions',
    name: 'Comisiones',
    icon: ChartBarIcon,
    enabled: true,
    optional: true,
    toggleable: true,
    route: 'commissions',
    subLabel: 'Cálculo de comisiones',

    dashboard: {
      summary: false,
      alerts: false,
      quickActions: true,
    },

    quickActions: [
      'view_commissions',
    ],
  },

  tips: {
    id: 'tips',
    name: 'Propinas',
    icon: CurrencyDollarIcon,
    enabled: true,
    optional: true,
    toggleable: true,
    route: 'tips',
    subLabel: 'Registro de propinas',

    dashboard: {
      summary: true,
      alerts: false,
      quickActions: true,
    },

    quickActions: [
      'register_tip',
    ],
  },

  offers: {
    id: 'offers',
    name: 'Gestor de Ofertas',
    icon: GiftIcon,
    enabled: true,
    optional: true,
    toggleable: true,
    route: 'offers',
    subLabel: 'Promociones y descuentos',

    dashboard: {
      summary: false,
      alerts: false,
      quickActions: true,
    },

    quickActions: [
      'new_offer',
    ],
  },

  // "staff" y "cash" (Personal/Caja) se removieron de aquí: apuntaban a
  // rutas ('staff'/'cash') que nunca se registraron en
  // MainStackNavigator.jsx — no existía pantalla real detrás de esas
  // tarjetas. Sus necesidades ya están cubiertas por funcionalidad real:
  // Cierre de Caja vive en Ventas (cashRegister.style.js/useCashSession.js,
  // ver salesPyme.jsx) y la gestión de personal vive en Asistentes con rol
  // (TeamScreen.jsx). Los módulos backend `staff`/`cash` de
  // ALL_VALID_MODULES (auth_service.py) siguen existiendo — no se tocan —
  // solo se quitó la tarjeta de navegación rota del frontend.

  // Pendiente de auditoría propia (ver punto 6): no está en ALL_VALID_MODULES
  // del backend — se deja fuera de `optional` a propósito para que no
  // aparezca en la Biblioteca de Módulos hasta decidir su alcance.
  providers: {
    id: 'providers',
    name: 'Proveedores',
    icon: BuildingStorefrontIcon,
    enabled: true,

    dashboard: {
      summary: false,
      alerts: false,
      quickActions: true,
    },

    quickActions: [
      'new_provider',
    ],
  },

  purchases: {
    id: 'purchases',
    name: 'Compras',
    icon: ShoppingCartIcon,
    enabled: true,
    optional: true,
    route: 'purchases',
    subLabel: 'Órdenes y proveedores',

    dashboard: {
      summary: true,
      alerts: false,
      quickActions: true,
      finance: true,
    },

    quickActions: [
      'new_purchase',
    ],
  },

};

export { moduleConfig };

export default moduleConfig;
