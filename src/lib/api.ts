import axios from "axios";
import type { AxiosRequestConfig } from "axios";

import { clearTokens, getAccessToken, getRefreshToken, setTokens } from "@/lib/auth";
import { brokerSyncWarningMessage, formatBrokerSyncWarningText } from "@/lib/errors";
import type {
  AutoTradingDashboard,
  AutoTradingLogsResponse,
  AutoTradingStartRequest,
  AutoTradingStartResponse,
  AutoTradingStopResponse,
  AutoTradingMetricsStatus,
  AutoTradingStatus,
  AutoTradingStrategiesResponse,
  AutomatedStrategyItem,
  AutomatedStrategyStatus,
  CreateAutomatedStrategyRequest,
  SignalHistoryResponse,
  SignalHistoryItem,
  RiskSettings,
  StrategyDeployRequest,
  StrategyDeployResponse,
  StrategyUndeployResponse,
  Trade,
  StrategyHealth,
  StrategyOrderItem,
  StrategyRunItem,
  StrategySignalRequest,
  StrategySignalResponse,
  StrategySignalOtpChallenge,
  StrategyStats,
  StrategyDetailResponse,
  StrategyCard,
  SubscriptionPlan,
  SubscriptionStatus,
  StrategyAccessSummary,
  PaymentInitiateRequest,
  PaymentInitiateResponse,
  PaymentSubmitRequest,
  SubscriptionPayment,
  MentorSupportRequest,
  MentorSupportCreateRequest,
} from "@/lib/types";

const rawApiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

const API_BASE_URL = rawApiBaseUrl ? rawApiBaseUrl.replace(/\/+$/, "") : "";

export const api = axios.create({
  baseURL: API_BASE_URL || "/api/v1",
  timeout: 10000,
});

api.defaults.withCredentials = false;

// ─── In-memory cache for GET requests ────────────────────────────────────────
// Prevents hammering the API with the same request repeatedly (fixes 429 errors)
const cache = new Map<string, { data: any; expiresAt: number }>();

function getCacheKey(url: string, params?: Record<string, any>) {
  return url + (params ? "?" + new URLSearchParams(params).toString() : "");
}

function cachedGet<T = any>(
  url: string,
  params?: Record<string, any>,
  ttlMs = 5000, // default 5 second cache
) {
  const key = getCacheKey(url, params);
  const cached = cache.get(key);
  if (cached && Date.now() < cached.expiresAt) {
    return Promise.resolve({ data: cached.data as T });
  }
  return api.get<T>(url, { params }).then((res) => {
    cache.set(key, { data: res.data, expiresAt: Date.now() + ttlMs });
    return res;
  });
}

// ─── In-flight deduplication ─────────────────────────────────────────────────
// If the same request is already in-flight, reuse it instead of firing again
const inFlight = new Map<string, Promise<any>>();

function deduplicatedGet<T = any>(
  url: string,
  params?: Record<string, any>,
  ttlMs = 5000,
) {
  const key = getCacheKey(url, params);
  if (inFlight.has(key)) return inFlight.get(key)! as Promise<{ data: T }>;
  const req = cachedGet<T>(url, params, ttlMs).finally(() => inFlight.delete(key));
  inFlight.set(key, req);
  return req;
}

// ─── Auth interceptors ────────────────────────────────────────────────────────
type HeadersWithOptionalSet = Record<string, string> & { set?: (key: string, value: string) => void };
type RetriableAxiosRequestConfig = AxiosRequestConfig & { _retry?: boolean };

api.interceptors.request.use((config) => {
  if (!rawApiBaseUrl && typeof window !== "undefined") {
    throw new Error("Missing required env: NEXT_PUBLIC_API_BASE_URL");
  }
  const token = getAccessToken();
  if (token) {
    config.headers = config.headers ?? {};
    const headers = config.headers as unknown as HeadersWithOptionalSet;
    if (typeof headers.set === "function") headers.set("Authorization", `Bearer ${token}`);
    else headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as RetriableAxiosRequestConfig | undefined;

    if (!originalRequest) return Promise.reject(error);

    // ── Broker endpoints: 400 means exchange unavailable, not a code bug ──
    // Resolve with empty data so Promise.allSettled marks it "rejected" cleanly
    // without a red console error that confuses developers.
    const brokerEndpoints = ["/broker/positions", "/broker/balance", "/broker/account", "/broker/accounts"];
    const url: string = originalRequest.url ?? "";
    if (
      error.response?.status === 400 &&
      brokerEndpoints.some((ep) => url.includes(ep))
    ) {
      return Promise.reject(error); // already handled by Promise.allSettled in page
    }

    // ── 429 Too Many Requests: back off and retry once after delay ──
    if (error.response?.status === 429 && !originalRequest._retry) {
      originalRequest._retry = true;
      const retryAfter = Number(error.response.headers?.["retry-after"] ?? 2);
      await new Promise((r) => setTimeout(r, retryAfter * 1000));
      return api(originalRequest);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        clearTokens();
        return Promise.reject(error);
      }

      try {
        const refreshResponse = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refresh_token: refreshToken,
        });

        setTokens(refreshResponse.data.access_token, refreshResponse.data.refresh_token);
        originalRequest.headers = originalRequest.headers ?? {};
        const headers = originalRequest.headers as unknown as HeadersWithOptionalSet;
        if (typeof headers.set === "function")
          headers.set("Authorization", `Bearer ${refreshResponse.data.access_token}`);
        else headers.Authorization = `Bearer ${refreshResponse.data.access_token}`;
        return api(originalRequest);
      } catch (refreshError) {
        clearTokens();
        if (typeof window !== "undefined" && window.location.pathname !== "/login") {
          window.location.replace("/login");
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

// ─── Market Data ──────────────────────────────────────────────────────────────

// FIX: cache candles for 10s — same candle endpoint was being hammered (429)
// Added sync_if_empty to auto-sync historical candles on first load
export const getCandles = (symbol: string, period: string, limit = 100, syncIfEmpty = true) =>
  deduplicatedGet(
    `/market-data/candles/${encodeURIComponent(symbol)}`,
    { period, limit, sync_if_empty: syncIfEmpty },
    10_000,
  );

// FIX: cache latest candle for 5s — was the main 429 culprit
export const getLatestCandle = (symbol: string, period: string) =>
  deduplicatedGet(
    `/market-data/candles/${encodeURIComponent(symbol)}/latest`,
    { period },
    5_000,
  );

export const marketDataSyncStatus = () =>
  deduplicatedGet("/market-data/sync-status", undefined, 15_000);

export const getMarketSymbols = () =>
  deduplicatedGet("/market-data/symbols/list", undefined, 60_000); // stable list, cache 1 min

export const getAvailablePeriods = () =>
  deduplicatedGet("/market-data/candles/periods/available", undefined, 60_000);

// ─── Automated Strategies ─────────────────────────────────────────────────────
export const createAutomatedStrategy = (data: CreateAutomatedStrategyRequest) => api.post<AutomatedStrategyItem>("/automated-strategies", data);
export const listAutomatedStrategies = () => api.get<AutomatedStrategyItem[]>("/automated-strategies");
export const getAutomatedStrategy = (id: number) => api.get<AutomatedStrategyItem>(`/automated-strategies/${id}`);
export const updateAutomatedStrategy = (id: number, data: Partial<CreateAutomatedStrategyRequest>) =>
  api.patch(`/automated-strategies/${id}`, data);
export const startAutomatedStrategy = (id: number, data?: { account_id?: number } | any) =>
  api.post(`/automated-strategies/${id}/start`, data ?? undefined);
export const stopAutomatedStrategy = (id: number) => api.post(`/automated-strategies/${id}/stop`);
export const getAutomatedStrategyStats = (id: number) => api.get<StrategyStats>(`/automated-strategies/${id}/stats`);
export const getAutomatedStrategyRuns = (id: number) => api.get<StrategyRunItem[]>(`/automated-strategies/${id}/runs`);
export const getAutomatedStrategyOrders = (id: number) => api.get<StrategyOrderItem[]>(`/automated-strategies/${id}/orders`);
export const closeAutomatedStrategyOrder = (strategyId: number, orderId: number) =>
  api.post<StrategyOrderItem>(`/automated-strategies/${strategyId}/orders/${orderId}/close`);
export const closeTrade = (tradeId: number) => api.post(`/trades/${tradeId}/close`);
export const deleteAutomatedStrategy = (id: number) =>
  api.delete(`/automated-strategies/${id}`);
export const getAutomatedStrategyHealth = () => api.get<StrategyHealth>("/automated-strategies/health/status");
export const getAutomatedStrategyStatus = (id: number) =>
  api.get<AutomatedStrategyStatus>(`/automated-strategies/${id}/status`);

// ─── Broker ───────────────────────────────────────────────────────────────────
const BROKER_SOFT_FAIL_STATUSES = new Set([400, 401, 403, 404, 502, 503, 504]);

export function isBrokerUnavailableError(err: unknown): boolean {
  const status = (err as { response?: { status?: number } }).response?.status;
  return typeof status === "number" && BROKER_SOFT_FAIL_STATUSES.has(status);
}

export async function getBrokerBalanceSafe() {
  try {
    const res = await api.get<{ broker: string; balance: string; currency: string }>("/broker/balance");
    return { balance: res.data, unavailable: false as const };
  } catch (err) {
    if (isBrokerUnavailableError(err)) {
      return { balance: null, unavailable: true as const };
    }
    throw err;
  }
}

export type BrokerSnapshotPayload = {
  balance?: { broker: string; balance: string; currency: string; available_balance?: string | null } | null;
  positions?: Array<{
    symbol: string;
    quantity: string;
    avg_entry_price?: string;
    unrealized_pnl: string;
  }>;
  sync_warning?: string | null;
  environment?: "live" | "testnet" | string | null;
  base_url?: string | null;
  delta_client_ip?: string | null;
  error_code?: string | null;
};

export type BrokerSnapshotResult = {
  snapshot: BrokerSnapshotPayload | null;
  syncWarning: string | null;
  environment?: string | null;
  baseUrl?: string | null;
  deltaClientIp?: string | null;
  errorCode?: string | null;
};

async function getBrokerSnapshotFallback(
  previous: BrokerSnapshotResult | undefined,
  whitelistIp?: string | null,
): Promise<BrokerSnapshotResult> {
  const [balanceResult, positionsResult] = await Promise.allSettled([
    getBrokerBalanceSafe(),
    api.get<BrokerSnapshotPayload["positions"]>("/broker/positions", { timeout: 30000 }),
  ]);

  let syncWarning: string | null = null;
  let balance = previous?.snapshot?.balance ?? undefined;
  let positions = previous?.snapshot?.positions ?? [];

  if (balanceResult.status === "fulfilled") {
    if (balanceResult.value.balance) {
      balance = balanceResult.value.balance;
    }
    if (balanceResult.value.unavailable) {
      syncWarning = brokerSyncWarningMessage({ response: { status: 400 } }, whitelistIp);
    }
  } else if (isBrokerUnavailableError(balanceResult.reason)) {
    syncWarning = brokerSyncWarningMessage(balanceResult.reason, whitelistIp);
  }

  if (positionsResult.status === "fulfilled") {
    positions = positionsResult.value.data ?? [];
  } else if (isBrokerUnavailableError(positionsResult.reason) && !syncWarning) {
    syncWarning = brokerSyncWarningMessage(positionsResult.reason, whitelistIp);
  }

  return {
    snapshot: { balance, positions },
    syncWarning,
    environment: previous?.environment ?? null,
    baseUrl: previous?.baseUrl ?? null,
    deltaClientIp: previous?.deltaClientIp ?? null,
    errorCode: previous?.errorCode ?? null,
  };
}

export async function getBrokerSnapshotSafe(
  previous: BrokerSnapshotResult | undefined,
  whitelistIp?: string | null,
): Promise<BrokerSnapshotResult> {
  try {
    const res = await api.get<BrokerSnapshotPayload>("/broker/account", { timeout: 30000 });
    const syncWarning = res.data.sync_warning
      ? formatBrokerSyncWarningText(res.data.sync_warning, whitelistIp, {
          deltaClientIp: res.data.delta_client_ip,
          errorCode: res.data.error_code,
          environment: res.data.environment,
          baseUrl: res.data.base_url,
        })
      : null;

    return {
      snapshot: {
        balance: res.data.balance ?? undefined,
        positions: res.data.positions ?? [],
      },
      syncWarning,
      environment: res.data.environment ?? null,
      baseUrl: res.data.base_url ?? null,
      deltaClientIp: res.data.delta_client_ip ?? null,
      errorCode: res.data.error_code ?? null,
    };
  } catch (err) {
    const status = (err as { response?: { status?: number } }).response?.status;
    if (status === 404) {
      try {
        return await getBrokerSnapshotFallback(previous, whitelistIp);
      } catch {
        return {
          snapshot: previous?.snapshot ?? null,
          syncWarning: "Broker snapshot endpoint unavailable. Using balance and positions fallback.",
          environment: previous?.environment ?? null,
          baseUrl: previous?.baseUrl ?? null,
          deltaClientIp: previous?.deltaClientIp ?? null,
          errorCode: previous?.errorCode ?? null,
        };
      }
    }

    if (isBrokerUnavailableError(err)) {
      return {
        snapshot: previous?.snapshot ?? null,
        syncWarning: brokerSyncWarningMessage(err, whitelistIp),
        environment: previous?.environment ?? null,
        baseUrl: previous?.baseUrl ?? null,
        deltaClientIp: previous?.deltaClientIp ?? null,
        errorCode: previous?.errorCode ?? null,
      };
    }
    throw err;
  }
}

export const getBrokerAccounts = () => api.get("/broker/accounts");
export const getBrokerPositions = () => api.get("/broker/positions");
export const getBrokerOrderStatus = (orderId: string) => api.get(`/broker/orders/${orderId}`);

// ─── Copy Trading ─────────────────────────────────────────────────────────────
export const getFollowingLeaders = () => api.get("/copy/following");
export const getLeaderStats = (leaderId: number) => api.get(`/copy/leaders/${leaderId}/stats`);

// ─── Trades ───────────────────────────────────────────────────────────────────
// FIX: was returning 400. Use broker/positions instead — trades/positions doesn't exist.
// Kept old export as alias so existing imports don't break.
export const getTradePositions = () => api.get("/broker/positions");

// ─── Auth helpers ─────────────────────────────────────────────────────────────
export const uploadAvatar = (file: File) => {
  const formData = new FormData();
  formData.append("avatar", file);
  return api.post("/auth/me/avatar", formData);
};

export const logout = () => api.post("/auth/logout");
export const logoutAllDevices = () => api.post("/auth/logout-all");
export const getSessions = () => api.get("/auth/sessions");
export const trustSession = (sessionId: number) =>
  api.post(`/auth/sessions/${sessionId}/trust`);
export const revokeSession = (sessionId: number) =>
  api.delete(`/auth/sessions/${sessionId}`);
export const getTrustedDevices = () => api.get("/auth/trusted-devices");
export const revokeTrustedDevice = (deviceId: number) =>
  api.delete(`/auth/trusted-devices/${deviceId}`);


// ─── Auto Trading ───────────────────────────────────────────────────────────
export const startAutoTrading = (data: AutoTradingStartRequest) => api.post<AutoTradingStartResponse>('/auto-trading/start', data);
export const stopAutoTrading = (strategyId: number) => api.post<AutoTradingStopResponse>('/auto-trading/stop', { strategy_id: strategyId });
export const getAutoTradingStatus = (strategyId: number) => api.get<AutoTradingMetricsStatus>(`/auto-trading/status/${strategyId}`);
export const listActiveAutoStrategies = () => api.get<AutoTradingStrategiesResponse>('/auto-trading/strategies');
export const getAutoTradingLogs = (params?: Record<string, any>) => api.get<AutoTradingLogsResponse>('/auto-trading/logs', { params });
export const getAutoTradingDashboard = (strategyId: number) =>
  api.get<AutoTradingDashboard>(`/auto-trading/dashboard/${strategyId}`);
export const pauseAutoTrading = (strategyId: number) =>
  api.post<AutoTradingStopResponse>('/auto-trading/pause', { strategy_id: strategyId });
export const resumeAutoTrading = (strategyId: number) =>
  api.post<AutoTradingStartResponse>('/auto-trading/resume', { strategy_id: strategyId });
export const listSignals = (params?: Record<string, unknown>) =>
  api.get<SignalHistoryResponse>('/signals', { params });
export const getSignal = (signalId: number) => api.get<SignalHistoryItem>(`/signals/${signalId}`);
export const getRiskSettings = () => api.get<RiskSettings>('/settings/risk');
export const getStrategyTypeDefinitions = () =>
  api.get<{ types: import('./strategySchemas').StrategyTypeDefinition[] }>('/strategy/type-definitions');

// ─── Strategy (helpers) ─────────────────────────────────────────────────────
export const createStrategy = (data: Record<string, unknown>) => api.post('/strategy', data);
export const listStrategies = (params?: Record<string, any>) => api.get('/strategy', { params });
export const getStrategy = (id: string | number) => api.get(`/strategy/${id}`);
export const getPublicStrategies = (params?: Record<string, any>) => api.get<StrategyCard[]>('/strategy/public', { params });
export const getPublicStrategyDetail = (strategyTag: string) => api.get<StrategyDetailResponse>(`/strategy/public/${encodeURIComponent(strategyTag)}`);
export const deployPublicStrategy = (strategyTag: string, data: StrategyDeployRequest) =>
  api.post<StrategyDeployResponse>(`/strategy/public/${encodeURIComponent(strategyTag)}/deploy`, data, {
    timeout: 45000,
  });
export const undeployPublicStrategy = (strategyTag: string) =>
  api.post<StrategyUndeployResponse>(`/strategy/public/${encodeURIComponent(strategyTag)}/undeploy`);

// ─── Subscriptions ───────────────────────────────────────────────────────────
export const getSubscriptionPlans = () => api.get<SubscriptionPlan[]>('/subscriptions/plans');
export const getMySubscription = () => api.get<SubscriptionStatus>('/subscriptions/me');
export const getMyStrategyAccess = () => api.get<StrategyAccessSummary>('/subscriptions/access');
export const initiateSubscriptionPayment = (data: PaymentInitiateRequest) =>
  api.post<PaymentInitiateResponse>('/subscriptions/payments/initiate', data);
export const submitSubscriptionPayment = (paymentId: number, data: PaymentSubmitRequest) =>
  api.post<SubscriptionPayment>(`/subscriptions/payments/${paymentId}/submit`, data);
export const listMySubscriptionPayments = () => api.get<SubscriptionPayment[]>('/subscriptions/payments');
export const createMentorSupportRequest = (data: MentorSupportCreateRequest) =>
  api.post<MentorSupportRequest>('/subscriptions/mentor-requests', data);
export const listMyMentorSupportRequests = () => api.get<MentorSupportRequest[]>('/subscriptions/mentor-requests');

// ─── Admin Subscriptions ─────────────────────────────────────────────────────
export const adminListSubscriptionPayments = (statusFilter?: string) =>
  api.get<SubscriptionPayment[]>('/admin/subscriptions/payments', {
    params: statusFilter ? { status_filter: statusFilter } : undefined,
  });
export const adminVerifyPayment = (paymentId: number, data: { admin_notes?: string | null }) =>
  api.post<SubscriptionPayment>(`/admin/subscriptions/payments/${paymentId}/verify`, data);
export const adminRejectPayment = (paymentId: number, data: { admin_notes: string }) =>
  api.post<SubscriptionPayment>(`/admin/subscriptions/payments/${paymentId}/reject`, data);
export const adminListMentorRequests = (statusFilter?: string) =>
  api.get<MentorSupportRequest[]>('/admin/subscriptions/mentor-requests', {
    params: statusFilter ? { status_filter: statusFilter } : undefined,
  });
export const adminUpdateMentorRequest = (
  requestId: number,
  data: { status: string; admin_response?: string | null },
) => api.patch<MentorSupportRequest>(`/admin/subscriptions/mentor-requests/${requestId}`, data);
export const adminRecalculateAllAccess = () =>
  api.post<{ message: string }>('/admin/subscriptions/recalculate-all');

export const sendStrategySignal = (data: StrategySignalRequest) =>
  api.post<StrategySignalResponse>('/strategy/signal', data);
export const sendStrategySignalOtp = (data: StrategySignalRequest & { channel?: "email" | "phone" }) =>
  api.post<StrategySignalOtpChallenge>('/strategy/signal/send-otp', { channel: "email", ...data });
export const verifyStrategySignalOtp = (challengeId: string, otpCode: string) =>
  api.post<StrategySignalResponse>('/strategy/signal/verify-otp', {
    challenge_id: challengeId,
    otp_code: otpCode,
  });

// ─── User Trades ─────────────────────────────────────────────────────────────
export const getMyTrades = () => api.get<Trade[]>('/trades/me');