import { create } from "zustand";

import {
  getAutoTradingDashboard,
  getAutoTradingLogs,
  getAutoTradingStatus,
  getAutomatedStrategy,
  getAutomatedStrategyOrders,
  getAutomatedStrategyStatus,
  closeAutomatedStrategyOrder,
  closeTrade,
  listSignals,
  pauseAutoTrading,
  resumeAutoTrading,
  startAutomatedStrategy,
  startAutoTrading,
  stopAutomatedStrategy,
  stopAutoTrading,
  undeployPublicStrategy,
} from "@/lib/api";
import { resolveTradingStrategyId } from "@/lib/automatedStrategy";
import { extractApiErrorMessage } from "@/lib/errors";
import type {
  AutoTradingDashboard,
  AutoTradingLogItem,
  AutoTradingMetricsStatus,
  AutomatedStrategyItem,
  AutomatedStrategyStatus,
  SignalHistoryItem,
  StrategyOrderItem,
} from "@/lib/types";

type AutomatedStrategyDashboardState = {
  strategy: AutomatedStrategyItem | null;
  deploymentStatus: AutomatedStrategyStatus | null;
  tradingStrategyId: number | null;
  liveStatus: AutoTradingMetricsStatus | null;
  dashboard: AutoTradingDashboard | null;
  signals: SignalHistoryItem[];
  signalsTotal: number;
  orders: StrategyOrderItem[];
  logs: AutoTradingLogItem[];
  logsTotal: number;
  loading: boolean;
  actionLoading: boolean;
  error: string | null;
  message: string | null;
  loadStrategy: (automatedStrategyId: number) => Promise<void>;
  loadDashboard: (automatedStrategyId: number) => Promise<void>;
  loadSignals: (automatedStrategyId: number, page?: number) => Promise<void>;
  loadOrders: (automatedStrategyId: number) => Promise<void>;
  loadLogs: (automatedStrategyId: number, page?: number) => Promise<void>;
  refreshStatus: (automatedStrategyId: number) => Promise<void>;
  startStrategy: (automatedStrategyId: number) => Promise<void>;
  stopStrategy: (automatedStrategyId: number) => Promise<void>;
  pauseStrategy: (automatedStrategyId: number) => Promise<void>;
  resumeStrategy: (automatedStrategyId: number) => Promise<void>;
  undeployStrategy: (automatedStrategyId: number, strategyTag: string) => Promise<boolean>;
  closeOrder: (automatedStrategyId: number, order: StrategyOrderItem) => Promise<boolean>;
  clearMessage: () => void;
};

export const useAutomatedStrategyDashboardStore = create<AutomatedStrategyDashboardState>((set, get) => ({
  strategy: null,
  deploymentStatus: null,
  tradingStrategyId: null,
  liveStatus: null,
  dashboard: null,
  signals: [],
  signalsTotal: 0,
  orders: [],
  logs: [],
  logsTotal: 0,
  loading: false,
  actionLoading: false,
  error: null,
  message: null,
  clearMessage: () => set({ message: null, error: null }),
  loadStrategy: async (automatedStrategyId) => {
    set({ loading: true, error: null });
    try {
      const [strategyResponse, statusResponse, tradingStrategyId] = await Promise.all([
        getAutomatedStrategy(automatedStrategyId),
        getAutomatedStrategyStatus(automatedStrategyId),
        resolveTradingStrategyId(automatedStrategyId),
      ]);

      let liveStatus: AutoTradingMetricsStatus | null = null;
      if (tradingStrategyId !== null) {
        try {
          const liveStatusResponse = await getAutoTradingStatus(tradingStrategyId);
          liveStatus = liveStatusResponse.data;
        } catch {
          liveStatus = null;
        }
      }

      set({
        strategy: strategyResponse.data,
        deploymentStatus: statusResponse.data,
        tradingStrategyId,
        liveStatus,
        loading: false,
      });
    } catch (err) {
      set({ loading: false, error: extractApiErrorMessage(err, "Unable to load strategy details.") });
    }
  },
  loadDashboard: async (automatedStrategyId) => {
    set({ loading: true, error: null });
    try {
      await get().loadStrategy(automatedStrategyId);
      const tradingStrategyId = get().tradingStrategyId;
      if (tradingStrategyId === null) {
        set({ dashboard: null, loading: false });
        return;
      }

      const [dashboardResponse, liveStatusResponse] = await Promise.all([
        getAutoTradingDashboard(tradingStrategyId),
        getAutoTradingStatus(tradingStrategyId),
      ]);

      set({
        dashboard: dashboardResponse.data,
        liveStatus: liveStatusResponse.data,
        loading: false,
      });
    } catch (err) {
      set({ loading: false, error: extractApiErrorMessage(err, "Unable to load strategy dashboard.") });
    }
  },
  loadSignals: async (automatedStrategyId, page = 1) => {
    set({ loading: true, error: null });
    try {
      const tradingStrategyId = get().tradingStrategyId ?? (await resolveTradingStrategyId(automatedStrategyId));
      const response = await listSignals({
        strategy_id: tradingStrategyId ?? undefined,
        page,
        page_size: 20,
      });
      set({
        tradingStrategyId,
        signals: response.data.items ?? [],
        signalsTotal: response.data.total ?? 0,
        loading: false,
      });
    } catch (err) {
      set({ loading: false, error: extractApiErrorMessage(err, "Unable to load signal history.") });
    }
  },
  loadOrders: async (automatedStrategyId) => {
    set({ loading: true, error: null });
    try {
      const response = await getAutomatedStrategyOrders(automatedStrategyId);
      set({ orders: response.data ?? [], loading: false });
    } catch (err) {
      set({ loading: false, error: extractApiErrorMessage(err, "Unable to load trade history.") });
    }
  },
  loadLogs: async (automatedStrategyId, page = 1) => {
    set({ loading: true, error: null });
    try {
      const tradingStrategyId = get().tradingStrategyId ?? (await resolveTradingStrategyId(automatedStrategyId));
      const response = await getAutoTradingLogs({
        strategy_id: tradingStrategyId ?? undefined,
        page,
        page_size: 20,
      });
      set({
        tradingStrategyId,
        logs: response.data.items ?? [],
        logsTotal: response.data.total ?? 0,
        loading: false,
      });
    } catch (err) {
      set({ loading: false, error: extractApiErrorMessage(err, "Unable to load auto trading logs.") });
    }
  },
  refreshStatus: async (automatedStrategyId) => {
    try {
      const [statusResponse, tradingStrategyId] = await Promise.all([
        getAutomatedStrategyStatus(automatedStrategyId),
        get().tradingStrategyId ?? resolveTradingStrategyId(automatedStrategyId),
      ]);

      let liveStatus: AutoTradingMetricsStatus | null = null;
      if (tradingStrategyId !== null) {
        const liveStatusResponse = await getAutoTradingStatus(tradingStrategyId);
        liveStatus = liveStatusResponse.data;
      }

      set({
        deploymentStatus: statusResponse.data,
        tradingStrategyId,
        liveStatus,
      });
    } catch (err) {
      set({ error: extractApiErrorMessage(err, "Unable to refresh strategy status.") });
    }
  },
  startStrategy: async (automatedStrategyId) => {
    set({ actionLoading: true, error: null, message: null });
    try {
      await startAutomatedStrategy(automatedStrategyId);
      const tradingStrategyId = get().tradingStrategyId ?? (await resolveTradingStrategyId(automatedStrategyId));
      if (tradingStrategyId !== null) {
        await startAutoTrading({
          strategy_id: tradingStrategyId,
          mode: "live",
          max_position_size: get().strategy?.max_loss_limit ?? "1000",
          daily_loss_limit: get().strategy?.max_loss_limit ?? "500",
          max_open_positions: 5,
        });
      }
      await get().refreshStatus(automatedStrategyId);
      set({ actionLoading: false, message: "Strategy started successfully." });
    } catch (err) {
      set({ actionLoading: false, error: extractApiErrorMessage(err, "Unable to start strategy.") });
    }
  },
  stopStrategy: async (automatedStrategyId) => {
    set({ actionLoading: true, error: null, message: null });
    try {
      const tradingStrategyId = get().tradingStrategyId ?? (await resolveTradingStrategyId(automatedStrategyId));
      if (tradingStrategyId !== null) {
        await stopAutoTrading(tradingStrategyId);
      }
      await stopAutomatedStrategy(automatedStrategyId);
      await get().refreshStatus(automatedStrategyId);
      set({ actionLoading: false, message: "Strategy stopped successfully." });
    } catch (err) {
      set({ actionLoading: false, error: extractApiErrorMessage(err, "Unable to stop strategy.") });
    }
  },
  pauseStrategy: async (automatedStrategyId) => {
    set({ actionLoading: true, error: null, message: null });
    try {
      const tradingStrategyId = get().tradingStrategyId ?? (await resolveTradingStrategyId(automatedStrategyId));
      if (tradingStrategyId === null) {
        throw new Error("Trading strategy is not linked yet.");
      }
      await pauseAutoTrading(tradingStrategyId);
      await get().refreshStatus(automatedStrategyId);
      set({ actionLoading: false, message: "Strategy paused successfully." });
    } catch (err) {
      set({ actionLoading: false, error: extractApiErrorMessage(err, "Unable to pause strategy.") });
    }
  },
  resumeStrategy: async (automatedStrategyId) => {
    set({ actionLoading: true, error: null, message: null });
    try {
      const tradingStrategyId = get().tradingStrategyId ?? (await resolveTradingStrategyId(automatedStrategyId));
      if (tradingStrategyId === null) {
        throw new Error("Trading strategy is not linked yet.");
      }
      await resumeAutoTrading(tradingStrategyId);
      await get().refreshStatus(automatedStrategyId);
      set({ actionLoading: false, message: "Strategy resumed successfully." });
    } catch (err) {
      set({ actionLoading: false, error: extractApiErrorMessage(err, "Unable to resume strategy.") });
    }
  },
  undeployStrategy: async (automatedStrategyId, strategyTag) => {
    set({ actionLoading: true, error: null, message: null });
    try {
      const tradingStrategyId = get().tradingStrategyId ?? (await resolveTradingStrategyId(automatedStrategyId));
      if (tradingStrategyId !== null) {
        try {
          await stopAutoTrading(tradingStrategyId);
        } catch {
          // Session may already be stopped during undeploy.
        }
      }
      const response = await undeployPublicStrategy(strategyTag);
      set({
        actionLoading: false,
        message: response.data.message ?? "Strategy undeployed successfully.",
        strategy: null,
        deploymentStatus: null,
        tradingStrategyId: null,
        liveStatus: null,
        dashboard: null,
      });
      return true;
    } catch (err) {
      set({ actionLoading: false, error: extractApiErrorMessage(err, "Unable to undeploy strategy.") });
      return false;
    }
  },
  closeOrder: async (automatedStrategyId, order) => {
    set({ actionLoading: true, error: null, message: null });
    try {
      if (order.id > 0) {
        await closeAutomatedStrategyOrder(automatedStrategyId, order.id);
      } else if (order.trade_id) {
        await closeTrade(order.trade_id);
      } else {
        throw new Error("This trade record cannot be closed from the dashboard.");
      }
      await get().loadOrders(automatedStrategyId);
      set({ actionLoading: false, message: `${order.symbol} position closed successfully.` });
      return true;
    } catch (err) {
      set({
        actionLoading: false,
        error: extractApiErrorMessage(err, "Unable to close this trade."),
      });
      return false;
    }
  },
}));
