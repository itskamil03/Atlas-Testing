import { create } from "zustand";

import { api, getAutomatedStrategyHealth, listAutomatedStrategies } from "@/lib/api";
import { extractApiErrorMessage } from "@/lib/errors";
import type { AutomatedStrategyItem, BrokerAccount, DashboardSummary, StrategyHealth } from "@/lib/types";

export type DashboardWidgets = {
  totalStrategies: number;
  activeStrategies: number;
  signalsToday: number;
  executedTrades: number;
  failedTrades: number;
  pnl: string;
  connectedBroker: string | null;
};

type DashboardStoreState = {
  summary: DashboardSummary | null;
  health: StrategyHealth | null;
  strategies: AutomatedStrategyItem[];
  brokerAccounts: BrokerAccount[];
  widgets: DashboardWidgets;
  loading: boolean;
  error: string | null;
  loadDashboard: () => Promise<void>;
};

const emptyWidgets: DashboardWidgets = {
  totalStrategies: 0,
  activeStrategies: 0,
  signalsToday: 0,
  executedTrades: 0,
  failedTrades: 0,
  pnl: "0",
  connectedBroker: null,
};

export const useDashboardStore = create<DashboardStoreState>((set) => ({
  summary: null,
  health: null,
  strategies: [],
  brokerAccounts: [],
  widgets: emptyWidgets,
  loading: false,
  error: null,
  loadDashboard: async () => {
    set({ loading: true, error: null });
    try {
      const [summaryRes, healthRes, strategiesRes, accountsRes] = await Promise.allSettled([
        api.get<DashboardSummary>("/dashboard/summary"),
        getAutomatedStrategyHealth(),
        listAutomatedStrategies(),
        api.get<BrokerAccount[]>("/broker/accounts"),
      ]);

      const summary = summaryRes.status === "fulfilled" ? summaryRes.value.data : null;
      const health = healthRes.status === "fulfilled" ? healthRes.value.data : null;
      const strategies = strategiesRes.status === "fulfilled" ? strategiesRes.value.data ?? [] : [];
      const brokerAccounts =
        accountsRes.status === "fulfilled" ? accountsRes.value.data ?? [] : [];

      const activeStrategies =
        summary?.active_auto_strategies ??
        strategies.filter((s) => ["ACTIVE", "RUNNING"].includes((s.status ?? "").toUpperCase())).length;

      const connected = brokerAccounts.find((account) => account.is_active);

      set({
        summary,
        health,
        strategies,
        brokerAccounts,
        widgets: {
          totalStrategies: strategies.length,
          activeStrategies,
          signalsToday: health?.total_trades_today ?? summary?.auto_trades_today ?? 0,
          executedTrades: health?.total_trades_today ?? summary?.auto_trades_today ?? 0,
          failedTrades: health?.error_count ?? 0,
          pnl: health?.total_pnl_today ?? summary?.cumulative_pnl ?? "0",
          connectedBroker: connected?.broker_name ?? null,
        },
        loading: false,
      });
    } catch (err) {
      set({ loading: false, error: extractApiErrorMessage(err, "Unable to load dashboard data.") });
    }
  },
}));
