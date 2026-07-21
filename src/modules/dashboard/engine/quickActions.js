import {
  BanknotesIcon,
  CubeIcon,
  ClipboardDocumentListIcon,
  WrenchScrewdriverIcon,
  CurrencyDollarIcon,
  GiftIcon,
  BuildingStorefrontIcon,
  ArchiveBoxIcon,
  QrCodeIcon,
  ChartBarIcon,
} from 'react-native-heroicons/outline';

const actionCatalog = {

  new_sale: {
    id: 'new_sale',
    title: 'Nueva Venta',
    subtitle: 'Registrar una venta',
    icon: BanknotesIcon,
    color: '#2563EB',
    route: 'Sales',
  },

  register_expense: {
    id: 'register_expense',
    title: 'Registrar Gasto',
    subtitle: 'Agregar un egreso',
    icon: CurrencyDollarIcon,
    color: '#DC2626',
    route: 'Accounting',
  },

  new_product: {
    id: 'new_product',
    title: 'Nuevo Producto',
    subtitle: 'Agregar inventario',
    icon: CubeIcon,
    color: '#059669',
    route: 'Inventory',
  },

  inventory_entry: {
    id: 'inventory_entry',
    title: 'Entrada Inventario',
    subtitle: 'Registrar ingreso',
    icon: ArchiveBoxIcon,
    color: '#0891B2',
    route: 'Inventory',
  },

  inventory_adjustment: {
    id: 'inventory_adjustment',
    title: 'Ajustar Inventario',
    subtitle: 'Modificar existencias',
    icon: ArchiveBoxIcon,
    color: '#0EA5E9',
    route: 'Inventory',
  },

  scan_product: {
    id: 'scan_product',
    title: 'Escanear',
    subtitle: 'Código de barras',
    icon: QrCodeIcon,
    color: '#7C3AED',
    route: 'Scanner',
  },

  new_recipe: {
    id: 'new_recipe',
    title: 'Nueva Receta',
    subtitle: 'Crear receta',
    icon: ClipboardDocumentListIcon,
    color: '#EA580C',
    route: 'Recipes',
  },

  register_production: {
    id: 'register_production',
    title: 'Producción',
    subtitle: 'Registrar producción',
    icon: ClipboardDocumentListIcon,
    color: '#D97706',
    route: 'Recipes',
  },

  new_service: {
    id: 'new_service',
    title: 'Nuevo Servicio',
    subtitle: 'Registrar servicio',
    icon: WrenchScrewdriverIcon,
    color: '#0284C7',
    route: 'Services',
  },

  new_appointment: {
    id: 'new_appointment',
    title: 'Nueva Cita',
    subtitle: 'Agendar servicio',
    icon: WrenchScrewdriverIcon,
    color: '#2563EB',
    route: 'Appointments',
  },

  view_commissions: {
    id: 'view_commissions',
    title: 'Comisiones',
    subtitle: 'Consultar comisiones',
    icon: ChartBarIcon,
    color: '#7C3AED',
    route: 'Commissions',
  },

  register_tip: {
    id: 'register_tip',
    title: 'Registrar Propina',
    subtitle: 'Agregar propina',
    icon: CurrencyDollarIcon,
    color: '#16A34A',
    route: 'Tips',
  },

  new_offer: {
    id: 'new_offer',
    title: 'Nueva Oferta',
    subtitle: 'Crear promoción',
    icon: GiftIcon,
    color: '#EC4899',
    route: 'Offers',
  },

  new_provider: {
    id: 'new_provider',
    title: 'Proveedor',
    subtitle: 'Agregar proveedor',
    icon: BuildingStorefrontIcon,
    color: '#6366F1',
    route: 'Providers',
  },

  new_purchase: {
    id: 'new_purchase',
    title: 'Nueva Compra',
    subtitle: 'Registrar compra',
    icon: ArchiveBoxIcon,
    color: '#0F766E',
    route: 'Purchases',
  },

};

export const buildQuickActions = ({
  activeModules = [],
  moduleConfig = {},
}) => {

  const actions = [];

  activeModules.forEach((moduleId) => {

    const config = moduleConfig[moduleId];

    if (!config?.quickActions) return;

    config.quickActions.forEach((actionId) => {

      const action = actionCatalog[actionId];

      if (!action) return;

      actions.push(action);

    });

  });

  const uniqueActions = [];

  const ids = new Set();

  actions.forEach((action) => {

    if (!ids.has(action.id)) {

      ids.add(action.id);

      uniqueActions.push(action);

    }

  });

  return uniqueActions;

};

export default buildQuickActions;