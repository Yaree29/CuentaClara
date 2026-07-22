// =============================================================================
// strategicAnalysisService.js
// -----------------------------------------------------------------------------
// Reemplaza el mock (mock.js, eliminado) por datos reales — solo donde ya
// existe un endpoint real (ver auditoría del módulo Analytics):
//   - Ventas:     salesService.getProfitsAndExpenses (GET /sales/profits),
//                 el mismo agregado ya usado en el Dashboard.
//   - Finanzas:   billingService.getProfitability (GET /invoices/reports/
//                 profitability), ya construido para MiRUC/Ganancias.
//   - Inventario: products.expiration_date + inventory_movements
//                 (reason=waste) — a propósito NO usa lowStockAlerts(): esas
//                 mismas dos cifras ("Alertas activas"/"En riesgo") ya se
//                 muestran tal cual en PymeInventory.jsx; repetirlas aquí no
//                 aporta análisis nuevo (ver auditoría de redundancia).
//
// Sección "Servicios" eliminada de esta pantalla: usaba el mismo hook
// (useStaffPerformance) y la misma ventana de datos (hoy) que ya muestran
// StaffCommissionWidget/StaffList en ServicesScreen.jsx — era una
// re-visualización 1:1 en gráficas de barra, sin ningún dato adicional.
//
// Cualquier gráfica del mock original sin un endpoint real detrás (rotación,
// rentabilidad por producto en Inventario, gastos por categoría, balance
// histórico, calendario de servicios, etc.) se deja fuera a propósito — ver
// nota al final de cada función.
// =============================================================================
import salesService from '../../sales/services/salesService';
import billingService from '../../Invoice/services/billingService';
import inventoryService from '../../inventory/services/inventoryService';

const toISODate = (date) => date.toISOString().split('T')[0];

// mes actual (día 1 → hoy) y mes anterior completo (día 1 → último día)
const monthRange = (offsetMonths = 0) => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() + offsetMonths, 1);
  const end =
    offsetMonths === 0
      ? now
      : new Date(now.getFullYear(), now.getMonth() + offsetMonths + 1, 0);
  return { dateFrom: toISODate(start), dateTo: toISODate(end) };
};

const last30DaysRange = () => {
  const now = new Date();
  const start = new Date(now);
  start.setDate(start.getDate() - 29);
  return { dateFrom: toISODate(start), dateTo: toISODate(now) };
};

const daysUntil = (isoDate) => {
  const target = new Date(`${isoDate}T00:00:00`);
  if (Number.isNaN(target.getTime())) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / 86400000);
};

const money = (value) => `$${Number(value || 0).toFixed(2)}`;

// ─── Ventas — GET /sales/profits (agregado, no da desglose por producto/hora/
// día: "Ventas mensuales", "Ventas anuales", "Horas de mayor venta", "Días
// con mayores ingresos", "Productos/categorías más vendidos", "Métodos de
// pago", "Tendencia de crecimiento" quedan fuera — necesitarían un endpoint
// nuevo de ventas por producto/hora/día, no construido en esta fase) ──────
export const getVentasSection = async () => {
  const current = monthRange(0);
  const previous = monthRange(-1);

  const [currentData, previousData] = await Promise.all([
    salesService.getProfitsAndExpenses(current.dateFrom, current.dateTo),
    salesService.getProfitsAndExpenses(previous.dateFrom, previous.dateTo),
  ]);

  return {
    cards: [
      { label: 'Ingresos del mes', value: money(currentData?.income) },
      { label: 'Facturas del mes', value: String(currentData?.invoices_count || 0) },
    ],
    charts: [
      {
        id: 'period-comparison',
        title: 'Comparación entre períodos',
        description: 'Ingresos: mes anterior vs. mes actual.',
        type: 'bar',
        data: {
          labels: ['Mes Anterior', 'Mes Actual'],
          datasets: [
            {
              label: 'Ingresos',
              data: [Number(previousData?.income) || 0, Number(currentData?.income) || 0],
            },
          ],
        },
        options: { showLegend: true },
      },
    ],
    tables: [],
    calendars: [],
  };
};

// ─── Finanzas — GET /invoices/reports/profitability (ganancias/márgenes
// reales de MiRUC. "Márgenes %"/"Utilidad neta/bruta"/"Gastos por
// categoría"/"Balance diario-mensual-anual"/"Costos operativos" quedan fuera
// — no hay endpoint de gastos categorizados ni de balance histórico) ──────
export const getFinanzasSection = async () => {
  const { dateFrom, dateTo } = last30DaysRange();
  const data = await billingService.getProfitability(dateFrom, dateTo);

  const validProducts = (data?.products || []).filter((p) => !p.has_missing_cost);
  const topProducts = [...validProducts].sort((a, b) => b.margin - a.margin).slice(0, 6);

  const validInvoices = (data?.invoices || []).filter((inv) => !inv.has_missing_cost);
  const recentInvoices = [...validInvoices].reverse().slice(0, 8);

  const charts = [];
  if (topProducts.length > 0) {
    charts.push({
      id: 'margin-by-product',
      title: 'Margen por producto',
      description: 'Top productos por margen real (últimos 30 días).',
      type: 'horizontalBar',
      data: {
        labels: topProducts.map((p) => p.product_name),
        datasets: [{ label: 'Margen', data: topProducts.map((p) => Number(p.margin) || 0) }],
      },
      options: { showLegend: true },
    });
  }
  if (recentInvoices.length > 1) {
    charts.push({
      id: 'margin-by-invoice',
      title: 'Margen por factura',
      description: 'Últimas facturas con margen calculado (30 días).',
      type: 'line',
      data: {
        labels: recentInvoices.map((inv) => inv.invoice_number || `#${inv.invoice_id}`),
        datasets: [{ label: 'Margen', data: recentInvoices.map((inv) => Number(inv.margin) || 0) }],
      },
      options: { showLegend: true },
    });
  }

  return {
    cards: [
      { label: 'Ingresos (30 días)', value: money(data?.total_revenue) },
      {
        label: 'Margen (30 días)',
        value: data?.has_missing_cost ? 'Parcial' : money(data?.total_margin),
      },
    ],
    charts,
    tables: [],
    calendars: [],
  };
};

// ─── Inventario — products.expiration_date + inventory_movements
// (reason=waste). "Rotación"/"Sin movimiento"/"Más y menos rentables"/
// "Productos dañados"/"Inventario valorizado" quedan fuera — no hay endpoint
// de rotación ni de clasificación de daño. "Alertas activas"/"En riesgo"
// (GET /inventory/stock/low) NO se repiten aquí — ya viven en
// PymeInventory.jsx con el mismo cálculo exacto ──────
export const getInventarioSection = async () => {
  const [products, movements] = await Promise.all([
    inventoryService.getProducts(),
    inventoryService.getMovements(200),
  ]);

  // Horizonte de 30 días (vs. 7 días de PymeInventory): esta pantalla es de
  // análisis estratégico, no de alerta operativa diaria.
  const expiringSoon = (Array.isArray(products) ? products : [])
    .filter((p) => !!p.expirationDate)
    .map((p) => ({ ...p, daysLeft: daysUntil(p.expirationDate) }))
    .filter((p) => p.daysLeft !== null && p.daysLeft <= 30)
    .sort((a, b) => a.daysLeft - b.daysLeft)
    .slice(0, 8);

  const wasteByProduct = {};
  (Array.isArray(movements) ? movements : [])
    .filter((m) => m.reason === 'waste')
    .forEach((m) => {
      wasteByProduct[m.product_name] = (wasteByProduct[m.product_name] || 0) + Number(m.quantity || 0);
    });
  const lossEntries = Object.entries(wasteByProduct).sort((a, b) => b[1] - a[1]);
  const topLosses = lossEntries.slice(0, 6);
  const totalLostUnits = lossEntries.reduce((sum, [, qty]) => sum + qty, 0);

  const charts = [];
  if (expiringSoon.length > 0) {
    charts.push({
      id: 'expiring-products',
      title: 'Productos por vencer',
      description: 'Próximos 30 días (products.expiration_date).',
      type: 'horizontalBar',
      data: {
        labels: expiringSoon.map((p) => p.name),
        datasets: [{ label: 'Días restantes', data: expiringSoon.map((p) => p.daysLeft) }],
      },
      options: { showLegend: true },
    });
  }
  if (topLosses.length > 0) {
    charts.push({
      id: 'highest-loss',
      title: 'Productos con mayor pérdida',
      description: 'Mermas registradas (inventory_movements, reason=waste).',
      type: 'horizontalBar',
      data: {
        labels: topLosses.map(([name]) => name),
        datasets: [{ label: 'Cantidad perdida', data: topLosses.map(([, qty]) => qty) }],
      },
      options: { showLegend: true },
    });
  }

  return {
    // Tarjetas propias de este análisis (no repiten "Alertas activas"/"En
    // riesgo" de PymeInventory.jsx) — apoyan directamente a las 2 gráficas
    // de abajo, que son las que sí aportan algo nuevo.
    cards: [
      { label: 'Productos por vencer (30 días)', value: String(expiringSoon.length) },
      { label: 'Unidades perdidas (mermas)', value: String(totalLostUnits) },
    ],
    charts,
    tables: [],
    calendars: [],
  };
};
