import colors from '../../../theme/colors';
import {BanknotesIcon,ChartBarIcon,ArrowTrendingUpIcon,ExclamationTriangleIcon,TrophyIcon,BuildingStorefrontIcon,} from 'react-native-heroicons/outline';
import moduleConfig from './moduleConfig';

export const buildHeader = ({
  user = {},
  businessData = {},
  role = 'administrator',
}) => {
  return {
    userName:
      user?.name || 'Usuario',
    businessName:
      businessData?.name || 'Mi Negocio',
    role,
    currency:
      businessData?.currency || 'USD',
    language:
      businessData?.language || 'es',
    logo:
      businessData?.logo_url || null,
    primaryColor:
      businessData?.primary_color || null,
    category:
      businessData?.category_name ||
      businessData?.category ||
      'General',
    plan:
      businessData?.plan || 'free',
    uiMode:
      businessData?.ui_mode || 'advanced',
  };
};

export const buildSummaryCards = ({
  role,
  totalSales = 0,
  cashAvailable = 0,
  totalTransactions = 0,
  totalOrders = 0,
  settings = {},
  businessData = {},
}) => {
  const currency =
    businessData?.currency || 'USD';
  const cards = [
    {
      id: 'sales',
      title: 'Ventas',
      value: Number(totalSales),
      type: 'currency',
      currency,
      subtitle:
        settings.salesFormat === 'Mesa'
          ? 'Ventas por mesas'
          : 'Ventas del día',
      icon: BanknotesIcon,
      color: colors.success,
    },
    {
      id: 'cash',
      title: 'Caja',
      value: Number(cashAvailable),
      type: 'currency',
      currency,
      subtitle:
        settings.manageTips
          ? 'Caja + Propinas'
          : 'Caja disponible',
      icon: ChartBarIcon,
      color: colors.primary,
    },
    {
      id: 'transactions',
      title: 'Movimientos',
      value: Number(totalTransactions),
      subtitle:
        settings.basicReports
          ? 'Con reportes'
          : 'Registrados',
      icon: ArrowTrendingUpIcon,
      color: colors.warning,
    },
  ];
  if (settings.employeeCommission) {
    cards.push({
      id: 'orders',
      title: 'Órdenes',
      value: Number(totalOrders),
      subtitle: 'Atendidas',
      icon: BanknotesIcon,
      color: colors.secondary,
    });
  }
  if (role === 'assistant') {
    return cards.filter(
      card => card.id !== 'cash'
    );
  }
  return cards;
};

export const buildDashboardAlerts = ({
  activeModules = [],
  settings = {},
}) => {
  const alerts = [];
  activeModules.forEach((moduleId) => {
    const config = moduleConfig[moduleId];
    if (!config?.alerts) return;
    config.alerts.forEach((alert) => {
      alerts.push({
        id: `${moduleId}_${alert}`,
        type: moduleId,
        title: alert,
        message: 'Requiere atención',
        severity: 'warning',
        icon: ExclamationTriangleIcon,
      });
    });
  });
  if (settings.useDigitalScale) {
    alerts.push({
      id: 'digital_scale',
      type: 'configuration',
      title: 'Báscula digital',
      message: 'El negocio utiliza peso como parte de las ventas.',
      severity: 'info',
      icon: ExclamationTriangleIcon,
    });
  }
  if (settings.useBarcodes) {
    alerts.push({
      id: 'barcode',
      type: 'configuration',
      title: 'Código de barras',
      message: 'Inventario preparado para lectura de códigos.',
      severity: 'info',
      icon: ExclamationTriangleIcon,
    });
  }
  if (settings.transformsRawMaterial) {
    alerts.push({
      id: 'recipes',
      type: 'configuration',
      title: 'Producción',
      message: 'Este negocio transforma materia prima.',
      severity: 'info',
      icon: ExclamationTriangleIcon,
    });
  }
  return alerts;
};

export const buildGoal = ({
  businessData = {},
  totalSales = 0,
  settings = {},
}) => {
  const target =
    Number(
      businessData?.monthlyGoal ||
      businessData?.settings?.monthlyGoal ||
      10000
    );

  const current =
    Number(totalSales);

  const percentage =
    target > 0
      ? Math.min((current / target) * 100, 100)
      : 0;

  return {
    current,
    target,
    percentage,
    remaining:
      Math.max(target - current, 0),
    taxRate:
      settings.taxRate,
    salesFormat:
      settings.salesFormat,
    unitOfMeasure:
      settings.unitOfMeasure,
    icon:
      TrophyIcon,
  };
};

export const buildFinance = ({
  totalSales = 0,
  totalExpenses = 0,
  cashAvailable = 0,
  totalTransactions = 0,
  settings = {},
  businessData = {},
}) => {
  return {
    income: Number(totalSales),
    expenses: Number(totalExpenses),
    balance: Number(cashAvailable),
    movements: Number(totalTransactions),
    currency:
      businessData?.currency || "USD",
    taxRate:
      settings.taxRate,
    manageTips:
      settings.manageTips,
    salesFormat:
      settings.salesFormat,
    unitOfMeasure:
      settings.unitOfMeasure,
    simplifiedInventory:
      settings.simplifiedInventory,
  };
};

export const buildModules = ({
  activeModules = [],
  settings = {},
}) => {
  return activeModules
    .map((moduleId) => {
      const config = moduleConfig[moduleId];
      if (!config) return null;
      return {
        id: config.id,
        name: config.name,
        title: config.name,
        enabled: true,
        icon: config.icon,
        settings: {
          useBarcodes:
            settings.useBarcodes,
          manageTips:
            settings.manageTips,
          simplifiedInventory:
            settings.simplifiedInventory,
          sellPhysicalProducts:
            settings.sellPhysicalProducts,
          transformsRawMaterial:
            settings.transformsRawMaterial,
          employeeCommission:
            settings.employeeCommission,
          useDigitalScale:
            settings.useDigitalScale,
          unitOfMeasure:
            settings.unitOfMeasure,
          salesFormat:
            settings.salesFormat,
        },
      };
    })
    .filter(Boolean);
};

export const buildActivity = ({
  dailySales = [],
  expenses = [],
  generalMovements = [],
  businessData = {},
}) => {
  const currency =
    businessData?.currency || "USD";
  const activities = [];
  dailySales.forEach((sale) => {
    activities.push({
      id: `sale_${sale.id}`,
      type: "sale",
      title: "Venta realizada",
      description: `${currency} ${Number(sale.total || 0).toFixed(2)}`,
      amount: Number(sale.total || 0),
      createdAt:
        sale.created_at ||
        sale.savedAt ||
        null,
    });
  });

  expenses.forEach((expense) => {
    activities.push({
      id: `expense_${expense.id}`,
      type: "expense",
      title: "Gasto registrado",
      description: `${currency} ${Number(expense.amount || 0).toFixed(2)}`,
      amount:
        Number(expense.amount || 0),
      createdAt:
        expense.createdAt ||
        expense.created_at ||
        null,
    });
  });

  generalMovements.forEach((movement, index) => {
    activities.push({
      id:
        movement.id ||
        `movement_${index}`,
      type: "movement",
      title:
        movement.title ||
        "Movimiento",
      description:
        movement.description ||
        "",
      amount:
        Number(movement.amount || 0),
      createdAt:
        movement.createdAt ||
        null,
    });
  });

  activities.sort((a, b) => {
    if (!a.createdAt) return 1;
    if (!b.createdAt) return -1;
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  return activities;
};

export const buildBusiness = ({
  businessData = {},
  settings = {},
  role,
}) => {
  return {
    id:
      businessData?.id,
    name:
      businessData?.name || "Mi Negocio",
    category:
      businessData?.category_name ||
      businessData?.category ||
      "General",
    currency:
      businessData?.currency || "USD",
    language:
      businessData?.language || "es",
    logo:
      businessData?.logo_url || null,
    primaryColor:
      businessData?.primary_color || null,
    taxRate:
      settings.taxRate,
    salesFormat:
      settings.salesFormat,
    unitOfMeasure:
      settings.unitOfMeasure,
    manageTips:
      settings.manageTips,
    useBarcodes:
      settings.useBarcodes,
    useDigitalScale:
      settings.useDigitalScale,
    simplifiedInventory:
      settings.simplifiedInventory,
    sellPhysicalProducts:
      settings.sellPhysicalProducts,
    transformsRawMaterial:
      settings.transformsRawMaterial,
    employeeCommission:
      settings.employeeCommission,
    uiMode:
      businessData?.ui_mode,
    plan:
      businessData?.plan,
    role,
  };
};

export const buildStatus = ({
  activeModules = [],
  businessData = {},
  settings = {},
}) => {
  return {
    business:
      businessData?.plan
        ? "active"
        : "inactive",
    sync:
      "synced",
    lastUpdate:
      new Date().toLocaleString(),
    system:
      activeModules.length > 0
        ? "active"
        : "inactive",
    totalModules:
      activeModules.length,
    title:
      "Estado del Sistema",
    icon:
      BuildingStorefrontIcon,
    plan:
      businessData?.plan ||
      "free",
    uiMode:
      businessData?.ui_mode ||
      "advanced",
    currency:
      businessData?.currency ||
      "USD",
    language:
      businessData?.language ||
      "es",
    taxRate:
      settings.taxRate,
    salesFormat:
      settings.salesFormat,
    useBarcodes:
      settings.useBarcodes,
    useDigitalScale:
      settings.useDigitalScale,
    simplifiedInventory:
      settings.simplifiedInventory,
    employeeCommission:
      settings.employeeCommission,
  };
};