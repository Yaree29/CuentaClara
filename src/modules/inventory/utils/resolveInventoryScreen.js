// =============================================================================
// resolveInventoryScreen.js
// -------------------------
// Punto de extensión para el tab de Inventario del Modo Asistente. Hoy
// PymeInventory es literalmente el único componente que existe para ese tab
// ("en construcción") — esta función no branchea nada todavía, solo deja el
// lugar listo para que MainNavigator.jsx la use sin refactor cuando exista
// una configuración real por negocio.
//
// TODO: cuando exista business.inventory_mode ('simple' | 'advanced'),
// branchear aquí (ej. 'simple' -> InformalInventory, 'advanced' -> PymeInventory).
// Por ahora, PymeInventory ("en construcción") es la única opción real.
// =============================================================================
import PymeInventory from '../components/PymeInventory';

export const resolveAssistantInventoryComponent = (business) => {
  return PymeInventory;
};

export default resolveAssistantInventoryComponent;
