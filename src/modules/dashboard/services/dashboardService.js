import { apiRequest } from "./apiClient";


const dashboardService = {

  /**
   * Obtener resumen general del negocio
   */
  getDashboardSummary: async () => {
    return apiRequest("/dashboard/summary");
  },


  /**
   * Obtener información financiera
   */
  getDashboardFinance: async () => {
    return apiRequest("/dashboard/finance");
  },


  /**
   * Obtener actividad reciente
   */
  getDashboardActivity: async () => {
    return apiRequest("/dashboard/activity");
  },


  /**
   * Obtener alertas
   */
  getDashboardAlerts: async () => {
    return apiRequest("/dashboard/alerts");
  },


};


export default dashboardService;