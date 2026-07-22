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

// `route` debe ser el nombre real registrado en MainNavigator.jsx (tabs) o
// MainStackNavigator.jsx (stack) — antes tenían nombres en PascalCase
// inventados ('Sales', 'Inventory', 'Recipes'...) que no correspondían a
// ninguna screen real, así que navigation.navigate() nunca hacía nada.
// scan_product / new_appointment / new_provider quedan SIN pantalla real
// todavía (no existe Scanner/Appointments/Providers en ningún navigator) —
// se dejan en el catálogo por si el módulo correspondiente se activa, pero
// QuickActions.jsx captura el error de navegación en vez de romper.
const actionCatalog = {

  register_expense: {
    id: 'register_expense',
    title: 'Registrar Gasto',
    subtitle: 'Agregar un egreso',
    icon: CurrencyDollarIcon,
    color: '#DC2626',
    route: 'CreateTransaction',
    params: { type: 'expense' },
  },

  new_product: {
    id: 'new_product',
    title: 'Nuevo Producto',
    subtitle: 'Agregar inventario',
    icon: CubeIcon,
    color: '#059669',
    route: 'PymeInventory',
  },

  inventory_entry: {
    id: 'inventory_entry',
    title: 'Entrada Inventario',
    subtitle: 'Registrar ingreso',
    icon: ArchiveBoxIcon,
    color: '#0891B2',
    route: 'PymeInventory',
  },

  inventory_adjustment: {
    id: 'inventory_adjustment',
    title: 'Ajustar Inventario',
    subtitle: 'Modificar existencias',
    icon: ArchiveBoxIcon,
    color: '#0EA5E9',
    route: 'PymeInventory',
  },

  scan_product: {
    id: 'scan_product',
    title: 'Escanear',
    subtitle: 'Código de barras',
    icon: QrCodeIcon,
    color: '#7C3AED',
    route: 'Scanner', // sin pantalla real todavía — ver comentario arriba
  },

  new_recipe: {
    id: 'new_recipe',
    title: 'Nueva Receta',
    subtitle: 'Crear receta',
    icon: ClipboardDocumentListIcon,
    color: '#EA580C',
    route: 'recipes',
  },

  register_production: {
    id: 'register_production',
    title: 'Producción',
    subtitle: 'Registrar producción',
    icon: ClipboardDocumentListIcon,
    color: '#D97706',
    route: 'recipes',
  },

  new_service: {
    id: 'new_service',
    title: 'Nuevo Servicio',
    subtitle: 'Registrar servicio',
    icon: WrenchScrewdriverIcon,
    color: '#0284C7',
    route: 'services',
  },

  new_appointment: {
    id: 'new_appointment',
    title: 'Nueva Cita',
    subtitle: 'Agendar servicio',
    icon: WrenchScrewdriverIcon,
    color: '#2563EB',
    route: 'Appointments', // sin pantalla real todavía — ver comentario arriba
  },

  view_commissions: {
    id: 'view_commissions',
    title: 'Comisiones',
    subtitle: 'Consultar comisiones',
    icon: ChartBarIcon,
    color: '#7C3AED',
    route: 'commissions',
  },

  register_tip: {
    id: 'register_tip',
    title: 'Registrar Propina',
    subtitle: 'Agregar propina',
    icon: CurrencyDollarIcon,
    color: '#16A34A',
    route: 'tips',
  },

  new_offer: {
    id: 'new_offer',
    title: 'Nueva Oferta',
    subtitle: 'Crear promoción',
    icon: GiftIcon,
    color: '#EC4899',
    route: 'offers',
  },

  new_provider: {
    id: 'new_provider',
    title: 'Proveedor',
    subtitle: 'Agregar proveedor',
    icon: BuildingStorefrontIcon,
    color: '#6366F1',
    route: 'Providers', // sin pantalla real todavía — ver comentario arriba
  },

  new_purchase: {
    id: 'new_purchase',
    title: 'Nueva Compra',
    subtitle: 'Registrar compra',
    icon: ArchiveBoxIcon,
    color: '#0F766E',
    route: 'purchases',
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