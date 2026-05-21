const users = [
  {
    id: '1',
    name: 'Miguel Zamora',
    email: 'test@test.com',
    password: 'Test1234*',
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
    },

    features: [
      {
        id: 1,
        module: 'inventory',
        is_active: true,
      },
      {
        id: 2,
        module: 'sales',
        is_active: true,
      },
      {
        id: 3,
        module: 'credit',
        is_active: true,
      },
      {
        id: 4,
        module: 'billing',
        is_active: true,
      },
    ],

    enabled_modules: [
      'dashboard',
      'profile',
      'inventory',
      'sales',
      'credit',
      'billing',
    ],

    userType: 'pyme',
  },
  {
    id: '2',
    name: 'Luis Zamora',
    email: 'test@test.com',
    password: 'Test1234**',
    role: 'admin',
    phone: '6000-0000',
    business_id: 'biz-2',
    created_at: new Date().toISOString(),

    business: {
      id: 'biz-2',
      name: 'CuentaClara Demo2',
      plan: 'premium',
      ui_mode: 'advanced',
      phone: '6000-0000',
      address: 'Panamá',
      created_at: new Date().toISOString(),
    },

    features: [
      {
        id: 1,
        module: 'inventory',
        is_active: true,
      },
      {
        id: 2,
        module: 'sales',
        is_active: true,
      },
      {
        id: 3,
        module: 'credit',
        is_active: true,
      },
      {
        id: 4,
        module: 'billing',
        is_active: true,
      },
    ],

    enabled_modules: [
      'dashboard',
      'profile',
      'inventory',
      'sales',
      'credit',
      'billing',
    ],

    userType: 'informal',
  },
];

export default users;