import { create } from 'zustand';

const initialOpenSales = [
  {
    id: 1,
    products: [],
    note: '',
    status: 'open',
    saved: false,
  },
];

const useSalesStore = create((set) => ({

  /* ===========================
     VENTAS ABIERTAS (PRECUENTAS)
     =========================== */

  openSales: initialOpenSales,

  selectedSale: 1,

  setOpenSales: (sales) =>
    set({
      openSales: sales,
    }),

  setSelectedSale: (saleId) =>
    set({
      selectedSale: saleId,
    }),

  resetOpenSales: () =>
    set({
      openSales: [
        {
          id: 1,
          products: [],
          note: '',
          status: 'open',
          saved: false,
        },
      ],
      selectedSale: 1,
    }),

  /* ===========================
     VENTAS GUARDADAS
     =========================== */

  dailySales: [],

  addSale: (sale) =>
    set((state) => ({
      dailySales: [
        ...state.dailySales,
        {
          ...sale,
          savedAt: new Date(),
        },
      ],
    })),

  removeSale: (saleId) =>
    set((state) => ({
      dailySales: state.dailySales.filter(
        (sale) => sale.id !== saleId
      ),
    })),

  clearDailySales: () =>
    set({
      dailySales: [],
    }),

  /* ===========================
     REGISTRO GENERAL
     =========================== */

  generalMovements: [],

  addGeneralMovement: (movement) =>
    set((state) => ({
      generalMovements: [
        ...state.generalMovements,
        movement,
      ],
    })),

  clearGeneralMovements: () =>
    set({
      generalMovements: [],
    }),

  /* ===========================
     GASTOS
     =========================== */

  expenses: [],

  addExpense: (expense) =>
    set((state) => ({
      expenses: [
        ...state.expenses,
        {
          ...expense,
          createdAt: new Date(),
        },
      ],
    })),

  clearExpenses: () =>
    set({
      expenses: [],
    }),

  /* ===========================
     TOTALES REALES DEL DÍA (hidratados desde GET /sales/profits)
     ===========================
     Campo separado de dailySales/expenses a propósito: esos dos arrays los
     consumen CashRegisterScreen.jsx (arqueo de caja) y SalesHistoryScreen.jsx
     (desglose por cajero) con cada venta/gasto individual de la sesión —
     sobreescribirlos con un total agregado rompería esas pantallas. Home usa
     dailyTotals cuando está disponible; si no (sin conexión, rol sin permiso),
     cae de vuelta a sumar dailySales/expenses como antes.
     =========================== */

  dailyTotals: null,

  setDailyTotals: (totals) =>
    set({
      dailyTotals: {
        income: Number(totals?.income) || 0,
        expenses: Number(totals?.expenses) || 0,
        profit: Number(totals?.profit) || 0,
        invoicesCount: Number(totals?.invoices_count) || 0,
      },
    }),

}));

export default useSalesStore;