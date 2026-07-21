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

}));

export default useSalesStore;