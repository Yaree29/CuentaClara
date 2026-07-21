// =============================================================================
// inventoryAlerts.js
// -----------------------------------------------------------------------------
// Deriva la presentación (message, level) de una alerta de stock bajo a partir
// de la respuesta cruda de GET /inventory/stock/low
// ({product_id, product_name, sku, current_stock, min_stock, unit, deficit}).
//
// `unit` puede llegar null en filas de inventario antiguas sin unidad
// configurada — fallback a string vacío para no romper el mensaje.
// =============================================================================

export const deriveAlertLevel = (currentStock) => (currentStock === 0 ? 'danger' : 'warning');

export const deriveAlertMessage = ({ current_stock, product_name, unit }) => {
  const remainingLabel = unit ? `${current_stock} ${unit}` : `${current_stock}`;
  return `Quedan ${remainingLabel} de ${product_name}`;
};

export const mapLowStockAlert = (alert) => ({
  id: alert.product_id,
  productName: alert.product_name,
  message: deriveAlertMessage(alert),
  remaining: alert.current_stock,
  unit: alert.unit || '',
  level: deriveAlertLevel(alert.current_stock),
});
