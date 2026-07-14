import { create } from "zustand";

import { getMyTrades } from "@/lib/api";
import { extractApiErrorMessage } from "@/lib/errors";
import type { Trade } from "@/lib/types";

type TradeStoreState = {
  trades: Trade[];
  loading: boolean;
  error: string | null;
  loadTrades: () => Promise<void>;
  clearError: () => void;
};

export const useTradeStore = create<TradeStoreState>((set) => ({
  trades: [],
  loading: false,
  error: null,
  clearError: () => set({ error: null }),
  loadTrades: async () => {
    set({ loading: true, error: null });
    try {
      const response = await getMyTrades();
      set({ trades: response.data ?? [], loading: false });
    } catch (err) {
      set({ loading: false, error: extractApiErrorMessage(err, "Unable to load trade history.") });
    }
  },
}));
