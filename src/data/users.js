const users = [
  {
    id: '1',
    name: 'Miguel Zamora',
    email: 'test@test.com',
    password: 'Test1234*', // Contraseña con 1 asterisco -> Inicia como PYME
    role: 'admin',
    phone: '6000-0000',
    business_id: 'biz-1',
    created_at: new Date().toISOString(),

    business: {
      id: 'biz-1',
      name: 'CuentaClara Demo',
      plan: 'premium',
      ui_mode: 'advanced',
      phone: '6000-0000',
      address: 'Panamá',
      created_at: new Date().toISOString(),
      category: 'food' // cambiar categoria del negocio para mostrar el dashboard específico
      //categorias: service, retail, prepared_food, food, general
    },

    features: [
      { id: 1, module: 'inventory', is_active: true },
      { id: 2, module: 'sales', is_active: true },
      { id: 3, module: 'credit', is_active: true },
      { id: 4, module: 'billing', is_active: true },
    ],

    enabled_modules: ['dashboard', 'profile', 'inventory', 'sales', 'credit', 'billing'],
    userType: 'pyme',
  },
  {
    id: '2',
    name: 'Yarlenis Pimentel',
    email: 'test@test.com',
    password: 'Test1234**', // Contraseña con 2 asteriscos -> Inicia como Informal
    role: 'admin',
    phone: '6000-0000',
    business_id: 'biz-2',
    created_at: new Date().toISOString(),

    business: {
      id: 'biz-2',
      name: 'CuentaClara Demo',
    },

    features: [
      { id: 1, module: 'inventory', is_active: true },
      { id: 2, module: 'sales', is_active: true },
      { id: 3, module: 'credit', is_active: true },
      { id: 4, module: 'billing', is_active: true },
    ],

    enabled_modules: ['dashboard', 'profile', 'inventory', 'sales', 'credit', 'billing'],
    userType: 'informal',
  },
];

export default users;