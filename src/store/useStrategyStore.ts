import { create } from "zustand";

import { deployPublicStrategy, getPublicStrategies, getPublicStrategyDetail } from "@/lib/api";
import { extractApiErrorMessage } from "@/lib/errors";
import type {
  PublicStrategyFilters,
  StrategyCard,
  StrategyDetailResponse,
  StrategyDeployRequest,
  StrategyDeployResponse,
} from "@/lib/types";

function friendlyDeployError(err: unknown, fallback: string): string {
  const message = extractApiErrorMessage(err, fallback);
  const lower = message.toLowerCase();
  if (lower.includes("already deployed")) return "This strategy is already deployed for your account.";
  if (lower.includes("broker") && (lower.includes("connect") || lower.includes("account"))) {
    return "Broker not connected. Connect your broker before deploying.";
  }
  if (lower.includes("margin") || lower.includes("insufficient")) {
    return "Insufficient margin to deploy this strategy.";
  }
  if (lower.includes("session") && lower.includes("not")) return "Auto-trading session is not running.";
  return message;
}

type StrategyStoreState = {
  strategies: StrategyCard[];
  filters: PublicStrategyFilters;
  selectedStrategyTag: string | null;
  selectedStrategy: StrategyDetailResponse | null;
  loading: boolean;
  detailLoading: boolean;
  error: string | null;
  deployResult: StrategyDeployResponse | null;
  setFilters: (filters: Partial<PublicStrategyFilters>) => void;
  setSelectedStrategyTag: (tag: string | null) => void;
  clearStatus: () => void;
  loadStrategies: (filters?: Partial<PublicStrategyFilters>) => Promise<void>;
  loadStrategyDetail: (strategyTag: string) => Promise<void>;
  deployStrategy: (strategyTag: string, payload: StrategyDeployRequest) => Promise<StrategyDeployResponse | null>;
};

export const useStrategyStore = create<StrategyStoreState>((set, get) => ({
  strategies: [],
  filters: { page: 1, page_size: 100 },
  selectedStrategyTag: null,
  selectedStrategy: null,
  loading: false,
  detailLoading: false,
  error: null,
  deployResult: null,
  setFilters: (filters) => set((state) => ({ filters: { ...state.filters, ...filters } })),
  setSelectedStrategyTag: (tag) => set({ selectedStrategyTag: tag }),
  clearStatus: () => set({ error: null, deployResult: null }),
  loadStrategies: async (filters) => {
    const nextFilters = { ...get().filters, ...filters };
    set({ loading: true, error: null, filters: nextFilters });
    try {
      const params: Record<string, string | number> = {
        page: nextFilters.page ?? 1,
        page_size: nextFilters.page_size ?? 100,
      };
      if (nextFilters.exchange) params.exchange = nextFilters.exchange;
      if (nextFilters.strategy_tag) params.strategy_tag = nextFilters.strategy_tag;

      const response = await getPublicStrategies(params);
      let items = response.data ?? [];

      if (nextFilters.risk_level) {
        items = items.filter((s) => s.risk_level === nextFilters.risk_level);
      }
      if (nextFilters.featured_only) {
        items = items.filter((s) => s.is_featured);
      }
      if (nextFilters.search?.trim()) {
        const normalized = nextFilters.search.trim().toLowerCase();
        items = items.filter((strategy) => {
          const searchable = [
            strategy.name,
            strategy.strategy_tag,
            strategy.exchange,
            strategy.risk_level,
            strategy.description ?? "",
            strategy.tags ?? "",
          ]
            .join(" ")
            .toLowerCase();
          return searchable.includes(normalized);
        });
      }

      set({ strategies: items, loading: false });
    } catch (err) {
      set({ loading: false, error: extractApiErrorMessage(err, "Unable to load strategies.") });
    }
  },
  loadStrategyDetail: async (strategyTag) => {
    set({ detailLoading: true, error: null, selectedStrategyTag: strategyTag });
    try {
      const response = await getPublicStrategyDetail(strategyTag);
      set({ selectedStrategy: response.data, detailLoading: false });
    } catch (err) {
      set({ detailLoading: false, error: extractApiErrorMessage(err, "Unable to load strategy details.") });
    }
  },
  deployStrategy: async (strategyTag, payload) => {
    set({ error: null, deployResult: null });
    try {
      const response = await deployPublicStrategy(strategyTag, payload);
      const deployResult = {
        ...response.data,
        message: "Strategy deployed. Auto trading is now active.",
      };
      set({ deployResult });
      await get().loadStrategies();
      return deployResult;
    } catch (err) {
      set({ error: friendlyDeployError(err, "Unable to deploy strategy.") });
      return null;
    }
  },
}));
