import { create } from 'zustand';

export const useOrderStore = create((set, get) => ({
  orders: [],
  total: 0,
  loading: false,
  filters: { status: '', search: '', overdue: false },

  setFilters: (filters) => set({ filters: { ...get().filters, ...filters } }),
  setOrders: (orders, total) => set({ orders, total }),
  appendOrders: (newOrders, total) =>
    set((s) => ({ orders: [...s.orders, ...newOrders], total })),
  updateOrder: (updated) =>
    set((s) => ({ orders: s.orders.map((o) => (o.id === updated.id ? updated : o)) })),
  removeOrder: (id) =>
    set((s) => ({ orders: s.orders.filter((o) => o.id !== id), total: s.total - 1 })),
  addOrder: (order) =>
    set((s) => ({ orders: [order, ...s.orders], total: s.total + 1 })),
  setLoading: (loading) => set({ loading }),
}));
