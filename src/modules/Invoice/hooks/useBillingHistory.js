import { useCallback, useEffect, useState } from 'react';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import billingService from '../services/billingService';

// Historial de facturas de MiRUC (GET /invoices/) + exportación real del PDF
// ya generado en el backend (invoice_pdf_service.py): se descarga la URL
// firmada a un archivo local y se abre el share sheet nativo, para que el
// usuario pueda guardarlo o enviarlo por cualquier app instalada — no solo
// abrir el link como hace el envío por WhatsApp.
export const useBillingHistory = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sharingInvoiceId, setSharingInvoiceId] = useState(null);

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await billingService.getInvoices(null, { limit: 100 });
      setInvoices(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'No se pudo cargar el historial de facturas.');
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const shareInvoicePdf = async (invoiceId, invoiceNumber) => {
    setSharingInvoiceId(invoiceId);
    try {
      const { url } = await billingService.getInvoicePdfUrl(invoiceId);

      const canShare = await Sharing.isAvailableAsync();
      if (!canShare) {
        throw new Error('Compartir archivos no está disponible en este dispositivo.');
      }

      const fileName = `${invoiceNumber || invoiceId}.pdf`;
      const localUri = `${FileSystem.cacheDirectory}${fileName}`;
      const { uri } = await FileSystem.downloadAsync(url, localUri);

      await Sharing.shareAsync(uri, {
        mimeType: 'application/pdf',
        dialogTitle: `Factura ${invoiceNumber || invoiceId}`,
      });
    } finally {
      setSharingInvoiceId(null);
    }
  };

  return {
    invoices,
    loading,
    error,
    refresh: fetchInvoices,
    shareInvoicePdf,
    sharingInvoiceId,
  };
};

export default useBillingHistory;
