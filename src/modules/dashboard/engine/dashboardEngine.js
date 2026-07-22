import {buildHeader,buildSummaryCards,buildGoal,buildFinance,buildActivity,buildBusiness,buildStatus,} from './summaryRules';
import { buildQuickActions } from './quickActions';
import { buildAlertRules } from './alertRules';
import { moduleConfig } from './moduleConfig';
import { getRolePermissions } from './permissions';

export const buildDashboard = ({
  user = {},
  businessData = {},
  preferences = {},
  dailySales = [],
  expenses = [],
  generalMovements = [],
  // Totales reales del día (GET /sales/profits), cuando ya se hidrataron —
  // ver useSaleStore.dailyTotals. Si viene null, se cae a sumar los arrays
  // de sesión como antes (comportamiento previo, sin romper nada).
  dailyTotals = null,
  // Alertas reales de inventario (GET /inventory/stock/low). recipes/services
  // no tienen fuente de datos real todavía — se pasan en 0 explícitamente
  // para que buildAlertRules no falle por undefined, no porque ya estén
  // conectadas (ver auditoría: sin endpoint agregado para recetas/servicios).
  inventory = { lowStock: 0, outStock: 0 },
  recipes = { missingIngredients: 0, limitedProduction: 0 },
  services = { pending: 0, late: 0 },
}) => {

  const role =
    user?.role === 'owner'
      ? 'administrator'
      : user?.role || 'assistant';

  const permissions = getRolePermissions(role);

  const activeModules =
    businessData?.enabled_modules?.length > 0
      ? businessData.enabled_modules
      : user?.enabled_modules || [];

  const rawSettings = businessData?.settings || {};

  // Se quitaron salesFormat/useBarcodes/wasteMargin/basicReports/
  // unitOfMeasure/useDigitalScale/simplifiedInventory: se leían de vuelta
  // en summaryRules.js pero solo como passthrough hacia goal/finance/
  // business/status, objetos que PymeDashboard.jsx nunca destructura ni
  // renderiza — datos guardados sin ningún efecto visual real (ver
  // auditoría). Quedan solo los que sí cambian algo visible o de negocio.
  const settings = {
    taxRate: Number(
      rawSettings.taxRate ??
      businessData?.tax_rate ??
      businessData?.taxRate ??
      0
    ),

    manageTips:
      rawSettings.manageTips === 'Sí',

    employeeCommission:
      rawSettings.employeeCommission === 'Sí',

    sellPhysicalProducts:
      rawSettings.sellPhysicalProducts === 'Sí',

    transformsRawMaterial:
      rawSettings.transformsRawMaterial === 'Sí',
  };

  // Preferir los totales reales hidratados desde el backend; si todavía no
  // llegaron (recién montado, sin conexión, rol sin permiso a /sales/profits),
  // caer de vuelta a sumar lo registrado en esta sesión.
  const totalSales = dailyTotals
    ? Number(dailyTotals.income) || 0
    : dailySales.reduce((total, sale) => total + Number(sale.total || 0), 0);

  const totalExpenses = dailyTotals
    ? Number(dailyTotals.expenses) || 0
    : expenses.reduce((total, expense) => total + Number(expense.amount || 0), 0);

  const cashAvailable = totalSales - totalExpenses;

  const totalTransactions = generalMovements.length;

  const totalOrders = dailyTotals
    ? Number(dailyTotals.invoicesCount) || 0
    : dailySales.length;

  const dashboardContext = {
    user,
    role,
    permissions,
    preferences,
    businessData,
    settings,
    activeModules,
    moduleConfig,
    dailySales,
    expenses,
    generalMovements,
    inventory,
    recipes,
    services,
    totalSales,
    totalExpenses,
    cashAvailable,
    totalTransactions,
    totalOrders,
    currency:
      businessData?.currency || 'USD',
    language:
      businessData?.language || 'es',
    logo:
      businessData?.logo_url || null,
    primaryColor:
      businessData?.primary_color || null,
    businessName:
      businessData?.name || 'Mi Negocio',
    category:
      businessData?.category_name ||
      businessData?.category ||
      'General',
    uiMode:
      businessData?.ui_mode || 'advanced',
    plan:
      businessData?.plan || 'free',
  };

  return {

    header:
      buildHeader(dashboardContext),

    summary:
      buildSummaryCards(dashboardContext),

    alerts:
      buildAlertRules(dashboardContext),

    goals:
      buildGoal(dashboardContext),

    quickActions:
      buildQuickActions(dashboardContext),

    finance:
      buildFinance(dashboardContext),

    activity:
      buildActivity(dashboardContext),

    business:
      buildBusiness(dashboardContext),

    status:
      buildStatus(dashboardContext),

  };

};