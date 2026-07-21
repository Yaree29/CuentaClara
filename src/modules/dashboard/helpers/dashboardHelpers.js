/**
 * dashboardHelpers.js
 *
 * Funciones auxiliares para el Dashboard.
 */

/**
 * Devuelve una descripción según el crecimiento.
 *
 * @param {number} growth
 * @returns {string}
 */
export const getGrowthLabel = (growth = 0) => {
  if (growth > 0) {
    return "Respecto al período anterior";
  }

  if (growth < 0) {
    return "Respecto al período anterior";
  }

  return "Sin cambios";
};