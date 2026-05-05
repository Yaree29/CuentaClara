const billingService = {
  generateInvoice: async (invoiceData) => {
    // Simulación de generación de factura y guardado en base de datos
    await new Promise(resolve => setTimeout(resolve, 1200));
    return { 
      success: true, 
      invoiceNumber: `FAC-${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toLocaleDateString(),
      url: 'https://cdn.cuentaclara.pa/invoices/sample.pdf' // Simulación de PDF generado
    };
  },

  getInvoices: async () => {
    await new Promise(resolve => setTimeout(resolve, 800));
    return [
      { id: '1', number: 'FAC-8821', customer: 'Distribuidora Central', total: 150.75, status: 'paid' },
      { id: '2', number: 'FAC-8822', customer: 'Abarrotes Miguel', total: 85.00, status: 'pending' },
    ];
  }
};

export default billingService;