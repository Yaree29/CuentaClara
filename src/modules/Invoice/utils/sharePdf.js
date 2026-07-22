// =============================================================================
// sharePdf.js — util compartido para compartir archivos generados en el backend.
// -----------------------------------------------------------------------------
// El backend genera el PDF (o el .zip de varios PDF) y lo sube a Supabase
// Storage, devolviendo una URL firmada temporal. Aquí se descarga esa URL a un
// archivo local y se abre la hoja nativa de compartir (expo-sharing), que ya
// incluye "Guardar en archivos" además de las apps de envío (Gmail, WhatsApp,
// etc.) — por eso no hace falta una acción "Descargar" aparte.
//
// Mismo patrón que tenía useBillingHistory.shareInvoicePdf, extraído para que
// lo reutilicen el historial (una o varias facturas) y la pantalla de detalle.
// =============================================================================
// SDK 54: la API clásica (downloadAsync / cacheDirectory) quedó deprecada en el
// import raíz 'expo-file-system' (lanza un error en runtime). Se importa desde
// 'expo-file-system/legacy', que expone la misma API sin la advertencia. La
// alternativa sería migrar a las clases File/Directory nuevas, pero legacy es el
// camino de menor riesgo y sigue soportado.
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';

/**
 * Descarga una URL firmada a la caché local y abre el share sheet nativo.
 * @param {string} url — URL firmada del archivo (PDF o ZIP)
 * @param {string} fileName — nombre del archivo local (ej. "Venta 12.pdf")
 * @param {object} options — { mimeType, dialogTitle }
 */
export async function downloadAndShare(url, fileName, { mimeType = 'application/pdf', dialogTitle } = {}) {
  const canShare = await Sharing.isAvailableAsync();
  if (!canShare) {
    throw new Error('Compartir archivos no está disponible en este dispositivo.');
  }

  const safeName = (fileName || 'archivo').replace(/[\\/:*?"<>|]/g, '_');
  const localUri = `${FileSystem.cacheDirectory}${safeName}`;
  const { uri } = await FileSystem.downloadAsync(url, localUri);

  await Sharing.shareAsync(uri, {
    mimeType,
    dialogTitle: dialogTitle || 'Compartir',
  });
}

export default downloadAndShare;
