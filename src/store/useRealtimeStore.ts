// import create from "zustand";
import { create } from "zustand";

type RealtimeState = {
  latestPrices: Record<string, number>;
  notifications: Array<{ id: number; title: string; message: string; created_at: string }>;
  setPrice: (symbol: string, price: number) => void;
  addNotification: (n: { id: number; title: string; message: string; created_at: string }) => void;
};

export const useRealtimeStore = create<RealtimeState>((set) => ({
  latestPrices: {},
  notifications: [],
  setPrice: (symbol, price) => set((s) => ({ latestPrices: { ...s.latestPrices, [symbol]: price } })),
  addNotification: (n) => set((s) => ({ notifications: [n, ...s.notifications] })),
}));
