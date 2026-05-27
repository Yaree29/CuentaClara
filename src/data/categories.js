// =============================================================================
// CREADO: 2026-05-27
// Propósito: Categorías placeholder. La fuente real es la API
//            GET /inventory/categories (tabla product_categories filtrada por
//            business_id). Este arreglo se mantiene como referencia visual
//            por si algún componente legado lo importa.
// =============================================================================
const categories = [
  { id: 1, name: 'Alimentos' },
  { id: 2, name: 'Servicios' },
  { id: 3, name: 'Comercio' },
  { id: 4, name: 'Restaurante' },
  { id: 5, name: 'General' },
];

export default categories;
