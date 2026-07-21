import {buildHeader,buildSummaryCards,buildDashboardAlerts,buildGoal,buildQuickActions,buildFinance,buildModules,buildActivity,buildBusiness,buildStatus,} from './summaryRules';
import { moduleConfig } from './moduleConfig';
import { getRolePermissions } from './permissions';

export const buildDashboard = ({
  user = {},
  businessData = {},
  preferences = {},
  dailySales = [],
  expenses = [],
  generalMovements = [],
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

  const settings = {
    taxRate: Number(
      rawSettings.taxRate ??
      businessData?.tax_rate ??
      businessData?.taxRate ??
      0
    ),

    manageTips:
      rawSettings.manageTips === 'Sí',

    salesFormat:
      rawSettings.salesFormat || 'Mostrador',

    useBarcodes:
      rawSettings.useBarcodes === 'Sí',

    wasteMargin:
      Number(rawSettings.wasteMargin ?? 0),

    basicReports:
      rawSettings.basicReports === 'Sí',

    unitOfMeasure:
      rawSettings.unitOfMeasure || 'Kg',

    useDigitalScale:
      rawSettings.useDigitalScale === 'Sí',

    employeeCommission:
      rawSettings.employeeCommission === 'Sí',

    simplifiedInventory:
      rawSettings.simplifiedInventory === 'Sí',

    sellPhysicalProducts:
      rawSettings.sellPhysicalProducts === 'Sí',

    transformsRawMaterial:
      rawSettings.transformsRawMaterial === 'Sí',
  };

  const totalSales = dailySales.reduce(
    (total, sale) => total + Number(sale.total || 0),
    0
  );

  const totalExpenses = expenses.reduce(
    (total, expense) => total + Number(expense.amount || 0),
    0
  );

  const cashAvailable = totalSales - totalExpenses;

  const totalTransactions = generalMovements.length;

  const totalOrders = dailySales.length;

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

  console.log('========== DASHBOARD ==========');
  console.log('Usuario:', user);
  console.log('Negocio:', businessData);
  console.log('Settings:', settings);
  console.log('Módulos:', activeModules);
  console.log('Ventas:', totalSales);
  console.log('Gastos:', totalExpenses);
  console.log('Caja:', cashAvailable);
  console.log('Transacciones:', totalTransactions);
  console.log('===============================');

  return {

    header:
      buildHeader(dashboardContext),

    summary:
      buildSummaryCards(dashboardContext),

    alerts:
      buildDashboardAlerts(dashboardContext),

    goals:
      buildGoal(dashboardContext),

    // quickActions:
    // buildQuickActions(dashboardContext),

    finance:
      buildFinance(dashboardContext),

    modules:
      buildModules(dashboardContext),

    activity:
      buildActivity(dashboardContext),

    business:
      buildBusiness(dashboardContext),

    status:
      buildStatus(dashboardContext),

  };

};