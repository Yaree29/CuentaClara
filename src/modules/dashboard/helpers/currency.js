/**
 * currency.js
 *
 * Utilidades para formateo de monedas.
 */

/**
 * Formatea un número como moneda.
 *
 * @param {number} value
 * @param {string} currency
 * @returns {string}
 */
export const formatMoney = (value = 0, currency = "USD") => {
  try {
    return new Intl.NumberFormat("es-PA", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number(value) || 0);
  } catch (error) {
    return `$${Number(value || 0).toFixed(2)}`;
  }
};