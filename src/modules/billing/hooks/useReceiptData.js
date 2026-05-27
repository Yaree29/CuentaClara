const DEFAULT_ITEMS = [
  { description: 'Cafe especial', quantity: 2, unitPrice: 3.50, subtotal: 7.00 },
  { description: 'Torta de chocolate', quantity: 1, unitPrice: 5.00, subtotal: 5.00 },
];

const useReceiptData = (route) => {
  const {
    invoiceNumber = 'CC-00123',
    invoiceMode = 'informal',
    date = new Date().toLocaleDateString('es-PA'),
    customer = 'Juan Perez',
    businessName = 'Mi Negocio Demo',
    items = DEFAULT_ITEMS,
    subtotal = 12.00,
    tax = 0.84,
    total = 12.84,
    customerRuc = '',
    customerDv = '',
    paymentMethod = '',
    paymentTerms = '',
    salesChannel = '',
    costCenter = '',
    seller = '',
    incomeAccount = '',
    notes = '',
  } = route?.params ?? {};

  return {
    invoiceNumber,
    invoiceMode,
    date,
    customer,
    businessName,
    items,
    subtotal,
    tax,
    total,
    customerRuc,
    customerDv,
    paymentMethod,
    paymentTerms,
    salesChannel,
    costCenter,
    seller,
    incomeAccount,
    notes,
  };
};

export default useReceiptData;
