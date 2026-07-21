const permissions = {

  administrator: {

    role: 'administrator',

    canViewDashboard: true,

    canViewFinance: true,

    canViewAlerts: true,

    canViewSummary: true,

    canViewGoals: true,

    canViewModules: true,

    canViewBusiness: true,

    canViewActivity: true,

    canViewStatus: true,

    canViewQuickActions: true,

    canManageSales: true,

    canManageInventory: true,

    canManageServices: true,

    canManageRecipes: true,

    canManagePurchases: true,

    canManageProviders: true,

    canManageOffers: true,

    canManageCommissions: true,

    canManageTips: true,

    canRegisterExpenses: true,

    canViewReports: true,

    canExportReports: true,

    canManageEmployees: true,

    canEditBusiness: true,

    canCloseCashRegister: true,

  },

  assistant: {

    role: 'assistant',

    canViewDashboard: true,

    canViewFinance: false,

    canViewAlerts: true,

    canViewSummary: true,

    canViewGoals: false,

    canViewModules: true,

    canViewBusiness: false,

    canViewActivity: true,

    canViewStatus: false,

    canViewQuickActions: true,

    canManageSales: true,

    canManageInventory: false,

    canManageServices: true,

    canManageRecipes: false,

    canManagePurchases: false,

    canManageProviders: false,

    canManageOffers: false,

    canManageCommissions: false,

    canManageTips: true,

    canRegisterExpenses: false,

    canViewReports: false,

    canExportReports: false,

    canManageEmployees: false,

    canEditBusiness: false,

    canCloseCashRegister: false,

  },

};

export const getRolePermissions = (role = 'assistant') => {

  return permissions[role] || permissions.assistant;

};

export const hasPermission = (
  role,
  permission
) => {

  const permissionsByRole = getRolePermissions(role);

  return Boolean(permissionsByRole?.[permission]);

};

export const isAdministrator = (role) => {

  return role === 'administrator';

};

export const isAssistant = (role) => {

  return role === 'assistant';

};

export default permissions;