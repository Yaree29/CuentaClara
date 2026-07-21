/**
 * progress.js
 *
 * Utilidades para calcular el progreso de metas
 * del Dashboard.
 */

/**
 * Construye la información de progreso de una meta.
 *
 * @param {number} current - Valor actual.
 * @param {number} target - Meta objetivo.
 * @returns {Object}
 */
export const buildProgressData = (current = 0, target = 0) => {
  const currentValue = Number(current) || 0;
  const targetValue = Number(target) || 0;

  const percentage =
    targetValue > 0
      ? Math.min((currentValue / targetValue) * 100, 100)
      : 0;

  const remaining = Math.max(targetValue - currentValue, 0);

  const completed = currentValue >= targetValue && targetValue > 0;

  return {
    current: currentValue,
    target: targetValue,
    percentage,
    remaining,
    completed,
  };
};