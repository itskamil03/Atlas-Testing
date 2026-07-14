import { create } from "zustand";

import { listAutomatedStrategies, undeployPublicStrategy } from "@/lib/api";
import { extractApiErrorMessage } from "@/lib/errors";
import type { AutomatedStrategyItem } from "@/lib/types";

type AutomatedStrategyStoreState = {
  strategies: AutomatedStrategyItem[];
  loading: boolean;
  actionLoading: boolean;
  error: string | null;
  message: string | null;
  loadStrategies: () => Promise<void>;
  undeployStrategy: (strategyTag: string) => Promise<boolean>;
  clearStatus: () => void;
};

export const useAutomatedStrategyStore = create<AutomatedStrategyStoreState>((set, get) => ({
  strategies: [],
  loading: false,
  actionLoading: false,
  error: null,
  message: null,
  clearStatus: () => set({ error: null, message: null }),
  loadStrategies: async () => {
    set({ loading: true, error: null });
    try {
      const response = await listAutomatedStrategies();
      set({ strategies: response.data ?? [], loading: false });
    } catch (err) {
      set({ loading: false, error: extractApiErrorMessage(err, "Unable to load automated strategies.") });
    }
  },
  undeployStrategy: async (strategyTag) => {
    set({ actionLoading: true, error: null, message: null });
    try {
      const response = await undeployPublicStrategy(strategyTag);
      set({ actionLoading: false, message: response.data.message ?? "Strategy undeployed successfully." });
      await get().loadStrategies();
      return true;
    } catch (err) {
      set({ actionLoading: false, error: extractApiErrorMessage(err, "Unable to undeploy strategy.") });
      return false;
    }
  },
}));
