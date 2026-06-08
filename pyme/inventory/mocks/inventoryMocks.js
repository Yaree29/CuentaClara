export const inventoryAlertsMock = [
  {
    id: 'carne',
    productName: 'carne',
    message: '¡Peligro, te quedas sin carne!',
    remaining: 2,
    unit: 'kg',
    level: 'danger',
  },
  {
    id: 'tintes',
    productName: 'tintes',
    message: 'Solo quedan 3 tintes',
    remaining: 3,
    unit: 'und',
    level: 'warning',
  },
  {
    id: 'shampoo',
    productName: 'botellas de shampoo',
    message: 'Quedan 2 botellas de shampoo',
    remaining: 2,
    unit: 'botellas',
    level: 'warning',
  },
];

export const scannerCatalogMock = [
  { code: 'CAR-001', name: 'Carne', category: 'Abasto', stock: 2, unit: 'kg' },
  { code: 'TIN-003', name: 'Tintes', category: 'Belleza', stock: 3, unit: 'und' },
  { code: 'SHA-002', name: 'Shampoo', category: 'Belleza', stock: 2, unit: 'botellas' },
  { code: 'PAN-014', name: 'Panadería', category: 'Alimentos', stock: 8, unit: 'piezas' },
];

export const inventorySummaryMock = {
  totalAlerts: inventoryAlertsMock.length,
  criticalProducts: 1,
  warningProducts: 2,
  itemsAtRisk: 7,
};
