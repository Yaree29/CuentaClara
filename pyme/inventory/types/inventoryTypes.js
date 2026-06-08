/**
 * @typedef {Object} InventoryAlert
 * @property {string} id
 * @property {string} productName
 * @property {string} message
 * @property {number} remaining
 * @property {string} unit
 * @property {'danger' | 'warning'} level
 */

/**
 * @typedef {Object} ScannerProduct
 * @property {string} code
 * @property {string} name
 * @property {string} category
 * @property {number} stock
 * @property {string} unit
 */

export {};
/**
 * @typedef {'critical' | 'warning'} InventorySeverity
 * @typedef {Object} InventoryAlert
 * @property {string} id
 * @property {string} name
 * @property {string} message
 * @property {number} remaining
 * @property {number} threshold
 * @property {string} unit
 * @property {InventorySeverity} severity
 * @property {string} category
 */

export const inventoryTypeHints = {};