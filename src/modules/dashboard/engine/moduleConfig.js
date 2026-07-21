import {BanknotesIcon,CubeIcon,
  ClipboardDocumentListIcon,
  WrenchScrewdriverIcon,
  ChartBarIcon,
  GiftIcon,
  CurrencyDollarIcon,
  QrCodeIcon,
  ArchiveBoxIcon,
  BuildingStorefrontIcon,
} from 'react-native-heroicons/outline';

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

    alerts: [
      'cash_pending',
      'pending_expenses',
    ],

    quickActions: [
      'new_sale',
      'register_expense',
    ],
  },

  basic_inventory: {
    id: 'basic_inventory',
    name: 'Inventario Básico',
    icon: CubeIcon,
    enabled: true,

    dashboard: {
      summary: false,
      alerts: true,
      quickActions: true,
      finance: false,
      activity: false,
    },

    alerts: [
      'low_stock',
      'out_stock',
    ],

    quickActions: [
      'new_product',
      'inventory_entry',
    ],
  },

  advanced_inventory: {
    id: 'advanced_inventory',
    name: 'Inventario Avanzado',
    icon: ArchiveBoxIcon,
    enabled: true,

    dashboard: {
      summary: false,
      alerts: true,
      quickActions: true,
      finance: false,
      activity: false,
    },

    features: [
      'scanner',
      'expiry',
      'waste',
      'predictive_stock',
      'weight_control',
    ],

    alerts: [
      'low_stock',
      'out_stock',
      'expiry_products',
      'registered_waste',
      'predictive_stock',
    ],

    quickActions: [
      'scan_product',
      'inventory_entry',
      'inventory_adjustment',
    ],
  },

  recipes: {
    id: 'recipes',
    name: 'Recetas',
    icon: ClipboardDocumentListIcon,
    enabled: true,

    dashboard: {
      summary: false,
      alerts: true,
      quickActions: true,
    },

    alerts: [
      'missing_ingredients',
      'limited_production',
    ],

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

    dashboard: {
      summary: true,
      alerts: true,
      quickActions: true,
      activity: true,
    },

    alerts: [
      'pending_services',
      'late_services',
    ],

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

    dashboard: {
      summary: false,
      alerts: false,
      quickActions: true,
    },

    quickActions: [
      'new_offer',
    ],
  },

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
    icon: QrCodeIcon,
    enabled: true,

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