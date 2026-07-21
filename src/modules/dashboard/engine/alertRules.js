import { ExclamationTriangleIcon } from 'react-native-heroicons/outline';

const createAlert = ({
  id,
  module,
  title,
  description,
  severity = 'warning',
}) => ({
  id,
  module,
  title,
  description,
  severity,
  icon: ExclamationTriangleIcon,
});

const inventoryAlerts = ({ inventory = {} }) => {
  const alerts = [];

  if (inventory.lowStock > 0) {
    alerts.push(
      createAlert({
        id: 'low_stock',
        module: 'basic_inventory',
        title: 'Stock crítico',
        description: `${inventory.lowStock} productos con stock mínimo.`,
        severity: 'warning',
      })
    );
  }

  if (inventory.outStock > 0) {
    alerts.push(
      createAlert({
        id: 'out_stock',
        module: 'basic_inventory',
        title: 'Productos agotados',
        description: `${inventory.outStock} productos agotados.`,
        severity: 'danger',
      })
    );
  }

  return alerts;
};

const advancedInventoryAlerts = ({ inventory = {} }) => {
  const alerts = [];

  if (inventory.expiringProducts > 0) {
    alerts.push(
      createAlert({
        id: 'expiry_products',
        module: 'advanced_inventory',
        title: 'Productos próximos a vencer',
        description: `${inventory.expiringProducts} productos próximos a vencer.`,
      })
    );
  }

  if (inventory.waste > 0) {
    alerts.push(
      createAlert({
        id: 'registered_waste',
        module: 'advanced_inventory',
        title: 'Mermas registradas',
        description: `${inventory.waste} mermas registradas.`,
      })
    );
  }

  if (inventory.predictiveStock > 0) {
    alerts.push(
      createAlert({
        id: 'predictive_stock',
        module: 'advanced_inventory',
        title: 'Reposición recomendada',
        description: `${inventory.predictiveStock} productos requieren reposición.`,
      })
    );
  }

  return alerts;
};

const recipeAlerts = ({ recipes = {} }) => {
  const alerts = [];

  if (recipes.missingIngredients > 0) {
    alerts.push(
      createAlert({
        id: 'missing_ingredients',
        module: 'recipes',
        title: 'Ingredientes insuficientes',
        description: `${recipes.missingIngredients} recetas no pueden prepararse.`,
      })
    );
  }

  if (recipes.limitedProduction > 0) {
    alerts.push(
      createAlert({
        id: 'limited_production',
        module: 'recipes',
        title: 'Producción limitada',
        description: 'La producción está limitada por falta de insumos.',
      })
    );
  }

  return alerts;
};

const serviceAlerts = ({ services = {} }) => {
  const alerts = [];

  if (services.pending > 0) {
    alerts.push(
      createAlert({
        id: 'pending_services',
        module: 'services',
        title: 'Servicios pendientes',
        description: `${services.pending} servicios pendientes.`,
      })
    );
  }

  if (services.late > 0) {
    alerts.push(
      createAlert({
        id: 'late_services',
        module: 'services',
        title: 'Servicios atrasados',
        description: `${services.late} servicios atrasados.`,
        severity: 'danger',
      })
    );
  }

  return alerts;
};

const salesAlerts = ({ expenses = [], businessData = {} }) => {
  const alerts = [];

  if (businessData.pendingCashClose) {
    alerts.push(
      createAlert({
        id: 'cash_pending',
        module: 'sales',
        title: 'Caja pendiente de cierre',
        description: 'La caja aún no ha sido cerrada.',
      })
    );
  }

  if (expenses.length === 0) {
    alerts.push(
      createAlert({
        id: 'pending_expenses',
        module: 'sales',
        title: 'Sin gastos registrados',
        description: 'No existen gastos registrados para la jornada.',
        severity: 'info',
      })
    );
  }

  return alerts;
};

export const buildAlertRules = ({
  activeModules = [],
  inventory = {},
  recipes = {},
  services = {},
  expenses = [],
  businessData = {},
}) => {
  const alerts = [];

  if (
    activeModules.includes('basic_inventory') ||
    activeModules.includes('inventory')
  ) {
    alerts.push(...inventoryAlerts({ inventory }));
  }

  if (activeModules.includes('advanced_inventory')) {
    alerts.push(...advancedInventoryAlerts({ inventory }));
  }

  if (activeModules.includes('recipes')) {
    alerts.push(...recipeAlerts({ recipes }));
  }

  if (activeModules.includes('services')) {
    alerts.push(...serviceAlerts({ services }));
  }

  if (activeModules.includes('sales')) {
    alerts.push(
      ...salesAlerts({
        expenses,
        businessData,
      })
    );
  }

  return alerts;
};

export default buildAlertRules;