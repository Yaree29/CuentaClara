import { Share } from 'react-native';

export const formatCurrency = (value) => `$${Number(value).toFixed(2)}`;

export const buildReceiptMessage = ({
  invoiceNumber,
  invoiceMode = 'informal',
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
}) => {
  const isPymeReceipt = invoiceMode === 'pyme';
  const lines = items
    .map((item) => {
      const detail = isPymeReceipt
        ? ` | ${item.category || 'Venta'}${item.sku ? ` | SKU ${item.sku}` : ''}${item.discount ? ` | Desc. ${formatCurrency(item.discount)}` : ''}`
        : '';
      return `  - ${item.description} x${item.quantity}  ${formatCurrency(item.subtotal)}${detail}`;
    })
    .join('\n');
  const pymeDetails = isPymeReceipt
    ? (
      `RUC/DV: ${customerRuc || 'N/A'}${customerDv ? `-${customerDv}` : ''}\n` +
      `Pago: ${paymentMethod || 'N/A'}   Condicion: ${paymentTerms || 'N/A'}\n` +
      `Canal: ${salesChannel || 'N/A'}   Cuenta ingreso: ${incomeAccount || 'N/A'}\n` +
      `Centro costo: ${costCenter || 'N/A'}   Vendedor: ${seller || 'N/A'}\n`
    )
    : '';

  return (
    `===== ${isPymeReceipt ? 'FACTURA PYME' : 'COMPROBANTE DE VENTA'} =====\n` +
    `Negocio: ${businessName}\n` +
    `Nro: ${invoiceNumber}   Fecha: ${date}\n` +
    `Cliente: ${customer}\n` +
    pymeDetails +
    `--------------------------------\n` +
    `${lines}\n` +
    `--------------------------------\n` +
    `${isPymeReceipt ? 'Subtotal ventas' : 'Subtotal'} : ${formatCurrency(subtotal)}\n` +
    `ITBMS 7% : ${formatCurrency(tax)}\n` +
    `${isPymeReceipt ? 'TOTAL INGRESOS' : 'TOTAL'}    : ${formatCurrency(total)}\n` +
    `${isPymeReceipt && notes ? `Notas: ${notes}\n` : ''}` +
    `================================\n` +
    `Gracias por su compra.`
  );
};

export const shareReceipt = async (receipt) => {
  const message = buildReceiptMessage(receipt);
  await Share.share({ message });
};
