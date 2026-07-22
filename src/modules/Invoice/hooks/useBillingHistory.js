import { useCallback, useEffect, useState } from 'react';
import billingService from '../services/billingService';
import { downloadAndShare } from '../utils/sharePdf';

// Historial de facturas de MiRUC (GET /invoices/) + compartir el/los PDF ya
// generables en el backend (invoice_pdf_service.py). Al compartir:
//   - 1 factura  → se comparte su PDF individual.
//   - ≥2 facturas → el backend las empaqueta en un .zip y se comparte ese zip.
// En ambos casos se abre la hoja nativa de compartir (ver utils/sharePdf.js),
// que ya permite guardar en archivos además de enviar por Gmail/WhatsApp/etc.
export const useBillingHistory = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sharing, setSharing] = useState(false);

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await billingService.getInvoices(null, { limit: 200 });
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

  // Comparte una o varias facturas. `invoices` puede ser una lista de objetos
  // factura o de ids. Devuelve tras abrir la hoja de compartir.
  const shareInvoices = async (selected) => {
    const ids = (selected || [])
      .map((inv) => (typeof inv === 'object' ? inv.id : inv))
      .filter((id) => id != null);

    if (ids.length === 0) return;

    setSharing(true);
    try {
      if (ids.length === 1) {
        const { url } = await billingService.getInvoicePdfUrl(ids[0]);
        await downloadAndShare(url, `Factura ${ids[0]}.pdf`, {
          mimeType: 'application/pdf',
          dialogTitle: 'Compartir factura',
        });
      } else {
        const { url } = await billingService.getInvoicesPdfBatchUrl(ids);
        await downloadAndShare(url, `Facturas (${ids.length}).zip`, {
          mimeType: 'application/zip',
          dialogTitle: `Compartir ${ids.length} facturas`,
        });
      }
    } finally {
      setSharing(false);
    }
  };

  return {
    invoices,
    loading,
    error,
    refresh: fetchInvoices,
    shareInvoices,
    sharing,
  };
};

export default useBillingHistory;
