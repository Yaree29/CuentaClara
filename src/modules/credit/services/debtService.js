const debtService = {
  getDebts: async () => {
    // Simulación de carga de cuentas por cobrar
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return [
      { id: '1', customer: 'Carlos Ruiz', amount: 45.00, lastUpdate: '2026-05-01', status: 'pending' },
      { id: '2', customer: 'Elena Gómez', amount: 12.50, lastUpdate: '2026-04-28', status: 'overdue' },
      { id: '3', customer: 'Roberto Sosa', amount: 85.00, lastUpdate: '2026-05-04', status: 'pending' },
    ];
  },

  registerPayment: async (debtId, paymentAmount) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { success: true, remaining: 0 };
  }
};

export default debtService;