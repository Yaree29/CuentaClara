const products = [
  {
    id: 'prod-1',
    business_id: 'biz-1',

    name: 'Arroz Premium',
    sku: 'ARZ-001',
    price: 2.50,

    unitType: 'kg',

    category: 'Alimentos',
    categoryColor: '#22c55e',

    stock: 45,
    unit: 'kg',

    minStock: 10,

    updatedAt: new Date().toISOString(),
  },

  {
    id: 'prod-2',
    business_id: 'biz-1',

    name: 'Aceite Vegetal',
    sku: 'ACE-002',
    price: 4.75,

    unitType: 'litro',

    category: 'Comercio',
    categoryColor: '#3b82f6',

    stock: 12,
    unit: 'botellas',

    minStock: 5,

    updatedAt: new Date().toISOString(),
  },

  {
    id: 'prod-3',
    business_id: 'biz-1',

    name: 'Azúcar Morena',
    sku: 'AZU-003',
    price: 1.80,

    unitType: 'kg',

    category: 'Alimentos',
    categoryColor: '#f59e0b',

    stock: 6,
    unit: 'kg',

    minStock: 8,

    updatedAt: new Date().toISOString(),
  },
];

export default products;