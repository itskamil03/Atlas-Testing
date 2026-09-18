"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import axios from "axios";

import { StrategyStatusBadges } from "@/components/auto-trading/StrategyStatusBadges";
import { AdminSubscriptionsTab } from "@/components/admin/AdminSubscriptionsTab";
import { AdminUsersTab } from "@/components/admin/AdminUsersTab";
import { AdminKYCTab } from "@/components/admin/AdminKYCTab";
import { AdminTradesTab } from "@/components/admin/AdminTradesTab";
import { parametersFromDefaults, StrategyParameterFields } from "@/components/admin/StrategyParameterFields";
import { api, getStrategyTypeDefinitions } from "@/lib/api";
import { clearTokens, getAccessToken } from "@/lib/auth";
import { formatIST } from "@/lib/datetime";
import {
  FALLBACK_STRATEGY_TYPES,
  getStrategyTypeDefinition,
  type StrategyTypeDefinition,
} from "@/lib/strategySchemas";
import type {
  AcademyArticle,
  AcademyArticleCreateRequest,
  AcademyArticleUpdateRequest,
  ActivityItem,
  AdminDashboardMetrics,
  AdminUserListResponse,
  AuditLogListResponse,
  ChartPoint,
  PlatformSettings,
  PlatformSettingsUpdateRequest,
  StrategyCard,
  StrategyPerformance,
  UserProfile,
} from "@/lib/types";

type AdminTab =
  | "overview"
  | "strategies"
  | "subscriptions"
  | "performance"
  | "academy"
  | "users"
  | "kyc"
  | "trades"
  | "notifications"
  | "settings"
  | "security";

type StrategyFormState = {
  name: string;
  description: string;
  strategy_tag: string;
  exchange: string;
  risk_level: "low" | "medium" | "high";
  strategy_type: "RSI" | "EMA_CROSSOVER" | "LONDON_BREAKOUT" | "CUSTOM";
  parameters: Record<string, string>;
  symbol: string;
  timeframe: string;
  signal_source: "platform_engine" | "creator_webhook";
  logo_url: string;
  image_url: string;
  tags: string[];
  followers: number;
  recommended_margin: string;
  mdd_percent: string;
  win_rate_percent: string;
  pnl: string;
  roi_percent: string;
  chart_points: string[];
  academy_slugs: string[];
  is_public: boolean;
  is_featured: boolean;
};

const buildDefaultParameters = (
  strategyType: StrategyFormState["strategy_type"],
  definitions: StrategyTypeDefinition[],
) => {
  const definition = getStrategyTypeDefinition(definitions, strategyType);
  if (!definition) {
    return parametersFromDefaults(FALLBACK_STRATEGY_TYPES[0].parameters);
  }
  return parametersFromDefaults(definition.parameters);
};

const emptyStrategy: StrategyFormState = {
  name: "",
  description: "",
  strategy_tag: "",
  exchange: "Delta Exchange",
  risk_level: "medium",
  strategy_type: "RSI",
  parameters: buildDefaultParameters("RSI", FALLBACK_STRATEGY_TYPES),
  symbol: "BTCUSD",
  timeframe: "1h",
  signal_source: "platform_engine",
  logo_url: "",
  image_url: "",
  tags: [] as string[],
  followers: 0,
  recommended_margin: "100",
  mdd_percent: "0",
  win_rate_percent: "0",
  pnl: "0",
  roi_percent: "0",
  chart_points: ["0", "5", "8", "12", "10", "15"],
  academy_slugs: [] as string[],
  is_public: true,
  is_featured: false,
};

const tabs: { id: AdminTab; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "strategies", label: "Strategies" },
  { id: "subscriptions", label: "Subscriptions" },
  { id: "users", label: "Users" },
  { id: "kyc", label: "KYC" },
  { id: "trades", label: "Trades" },
  { id: "academy", label: "Academy" },
  { id: "notifications", label: "Notifications" },
  { id: "settings", label: "Settings" },
  { id: "security", label: "Security" },
];

const tabIds = new Set<AdminTab>(tabs.map((tab) => tab.id));

function parseAdminTab(value: string | null): AdminTab {
  if (!value) return "overview";
  return tabIds.has(value as AdminTab) ? (value as AdminTab) : "overview";
}

const emptyArticle: AcademyArticleCreateRequest = {
  title: "",
  slug: "",
  category: "general",
  summary: "",
  content_markdown: "",
  is_published: true,
};

function formatCurrency(value: string | number): string {
  const numeric = Number(value);
  if (Number.isNaN(numeric)) return "0.00";
  return numeric.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatDate(value: string): string {
  return formatIST(value);
}

function getApiErrorMessage(err: unknown, fallback: string): string {
  const detail = axios.isAxiosError(err) ? err.response?.data?.detail : undefined;
  if (typeof detail === "string" && detail) return detail;
  if (Array.isArray(detail)) {
    return detail.map((item) => item?.msg || "").filter(Boolean).join("; ") || fallback;
  }
  return fallback;
}

function getAdminWebSocketUrl(): string | null {
  const wsBaseUrl = process.env.NEXT_PUBLIC_WS_BASE_URL;
  if (wsBaseUrl) {
    try {
      const url = new URL(wsBaseUrl);
      if (url.protocol === "http:") url.protocol = "ws:";
      if (url.protocol === "https:") url.protocol = "wss:";
      if (!url.pathname || url.pathname === "/") {
        url.pathname = "/api/v1/ws/live";
      } else if (!url.pathname.startsWith("/api/v1/ws/")) {
        url.pathname = `${url.pathname.replace(/\/+$/, "")}/api/v1/ws/live`;
      }
      url.search = "";
      url.hash = "";
      return url.toString().replace(/\/$/, "");
    } catch {
      // fall through to API-derived URL
    }
  }

  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!baseUrl) {
    return null;
  }

  const normalized = baseUrl.replace(/\/+$/, "");
  const root = normalized.replace(/\/api\/v1$/, "");
  if (root.startsWith("https://")) {
    return `${root.replace("https://", "wss://")}/api/v1/ws/live`;
  }
  if (root.startsWith("http://")) {
    return `${root.replace("http://", "ws://")}/api/v1/ws/live`;
  }
  return null;
}

export default function AdminPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [activeTab, setActiveTab] = useState<AdminTab>(() => parseAdminTab(searchParams.get("tab")));
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [metrics, setMetrics] = useState<AdminDashboardMetrics | null>(null);
  const [growth, setGrowth] = useState<ChartPoint[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);

  const [strategies, setStrategies] = useState<StrategyCard[]>([]);
  const [strategySearch, setStrategySearch] = useState("");
  const [selectedStrategyIds, setSelectedStrategyIds] = useState<number[]>([]);
  const [editingStrategyId, setEditingStrategyId] = useState<number | null>(null);
  const [strategyForm, setStrategyForm] = useState<StrategyFormState>(emptyStrategy);
  const [strategyTypeDefinitions, setStrategyTypeDefinitions] = useState<StrategyTypeDefinition[]>(
    FALLBACK_STRATEGY_TYPES,
  );
  const [tagInput, setTagInput] = useState("");
  const [backtesting, setBacktesting] = useState(false);
  const [backtestSummary, setBacktestSummary] = useState<string | null>(null);

  const [performanceStrategyId, setPerformanceStrategyId] = useState<number | null>(null);
  const [performanceData, setPerformanceData] = useState<StrategyPerformance | null>(null);
  const [editingPerformance, setEditingPerformance] = useState<StrategyPerformance | null>(null);

  const [articles, setArticles] = useState<AcademyArticle[]>([]);
  const [editingArticleId, setEditingArticleId] = useState<number | null>(null);
  const [articleForm, setArticleForm] = useState<AcademyArticleCreateRequest>(emptyArticle);
  const [articleSearch, setArticleSearch] = useState("");

  const [users, setUsers] = useState<AdminUserListResponse | null>(null);
  const [userSearch, setUserSearch] = useState("");
  const [kycFilter, setKycFilter] = useState("all");
  const [subscriptionFilter, setSubscriptionFilter] = useState("all");

  const [notificationTitle, setNotificationTitle] = useState("");
  const [notificationMessage, setNotificationMessage] = useState("");
  const [notificationCategory, setNotificationCategory] = useState("admin");

  const [platformSettings, setPlatformSettings] = useState<PlatformSettings | null>(null);

  const [auditLogs, setAuditLogs] = useState<AuditLogListResponse | null>(null);
  const [auditSeverity, setAuditSeverity] = useState("all");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const filteredArticles = useMemo(
    () => articles.filter((item) => item.title.toLowerCase().includes(articleSearch.toLowerCase()) || item.slug.toLowerCase().includes(articleSearch.toLowerCase())),
    [articles, articleSearch],
  );

  const activeStrategyDefinition = useMemo(
    () => getStrategyTypeDefinition(strategyTypeDefinitions, strategyForm.strategy_type),
    [strategyForm.strategy_type, strategyTypeDefinitions],
  );

  const strategyPreview = useMemo(() => {
    const points = strategyForm.chart_points
      .map((item) => Number(item))
      .filter((item) => !Number.isNaN(item));
    const avg = points.length ? points.reduce((sum, item) => sum + item, 0) / points.length : 0;
    return {
      points,
      avg,
      roi: Number(strategyForm.roi_percent || 0),
      winRate: Number(strategyForm.win_rate_percent || 0),
    };
  }, [strategyForm]);

  const setTab = useCallback(
    (nextTab: AdminTab) => {
      setActiveTab(nextTab);
      const params = new URLSearchParams(searchParams.toString());
      params.set("tab", nextTab);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  useEffect(() => {
    void getStrategyTypeDefinitions()
      .then((res) => {
        if (res.data.types?.length) {
          setStrategyTypeDefinitions(res.data.types);
        }
      })
      .catch(() => {
        setStrategyTypeDefinitions(FALLBACK_STRATEGY_TYPES);
      });
  }, []);

  useEffect(() => {
    const routeTab = parseAdminTab(searchParams.get("tab"));
    setActiveTab(routeTab);
  }, [searchParams]);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const me = await api.get<UserProfile>("/auth/me");
      if (me.data.role !== "admin") {
        router.replace("/dashboard");
        return;
      }
      setProfile(me.data);

      const [
        metricsRes,
        growthRes,
        activitiesRes,
        strategiesRes,
        articlesRes,
        usersRes,
        settingsRes,
        logsRes,
      ] = await Promise.all([
        api.get<AdminDashboardMetrics>("/admin/metrics"),
        api.get<ChartPoint[]>("/admin/growth"),
        api.get<ActivityItem[]>("/admin/activities"),
        api.get<StrategyCard[]>("/admin/strategies"),
        api.get<AcademyArticle[]>("/admin/academy/articles"),
        api.get<AdminUserListResponse>("/admin/users", { params: { page: 1, page_size: 20 } }),
        api.get<PlatformSettings>("/admin/platform-settings"),
        api.get<AuditLogListResponse>("/admin/audit-logs", { params: { page: 1, page_size: 20 } }),
      ]);

      setMetrics(metricsRes.data);
      setGrowth(growthRes.data);
      setActivities(activitiesRes.data);
      setStrategies(strategiesRes.data);
      setArticles(articlesRes.data);
      setUsers(usersRes.data);
      setPlatformSettings(settingsRes.data);
      setAuditLogs(logsRes.data);

      if (strategiesRes.data.length > 0) {
        setPerformanceStrategyId(strategiesRes.data[0].id);
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        clearTokens();
        router.push("/login");
        return;
      }
      setError(getApiErrorMessage(err, "Failed to load admin data."));
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    if (!getAccessToken()) {
      router.push("/login");
      return;
    }
    void loadAll();
  }, [loadAll, router]);

  useEffect(() => {
    const loadPerformance = async () => {
      if (!performanceStrategyId) {
        setPerformanceData(null);
        return;
      }
      try {
        const res = await api.get<StrategyPerformance>(`/admin/strategies/${performanceStrategyId}/performance`);
        setPerformanceData(res.data);
      } catch {
        setPerformanceData(null);
      }
    };
    void loadPerformance();
  }, [performanceStrategyId]);

  useEffect(() => {
    const loadEditingPerformance = async () => {
      if (!editingStrategyId) {
        setEditingPerformance(null);
        return;
      }
      try {
        const res = await api.get<StrategyPerformance>(`/admin/strategies/${editingStrategyId}/performance`);
        setEditingPerformance(res.data);
      } catch {
        setEditingPerformance(null);
      }
    };
    void loadEditingPerformance();
  }, [editingStrategyId]);

  useEffect(() => {
    if (!getAccessToken()) {
      return;
    }

    const wsUrl = getAdminWebSocketUrl();
    if (!wsUrl) {
      return;
    }

    const socket = new WebSocket(wsUrl);

    socket.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data) as {
          type?: string;
          metrics?: AdminDashboardMetrics;
          activities?: ActivityItem[];
        };
        if (payload.type !== "admin.live_update") {
          return;
        }

        if (payload.metrics) {
          setMetrics(payload.metrics);
        }
        if (payload.activities) {
          setActivities(payload.activities);
        }
      } catch {
        return;
      }
    };

    return () => {
      socket.close();
    };
  }, []);

  const onLogout = () => {
    clearTokens();
    router.push("/login");
  };

  const loadUsers = async () => {
    const params: Record<string, string | number> = { page: 1, page_size: 50 };
    if (userSearch) params.search = userSearch;
    if (kycFilter !== "all") params.kyc_status = kycFilter;
    if (subscriptionFilter !== "all") params.subscription_status = subscriptionFilter;
    const res = await api.get<AdminUserListResponse>("/admin/users", { params });
    setUsers(res.data);
  };

  const loadAudit = async () => {
    const params: Record<string, string | number> = { page: 1, page_size: 20 };
    if (auditSeverity !== "all") params.severity = auditSeverity;
    const res = await api.get<AuditLogListResponse>("/admin/audit-logs", { params });
    setAuditLogs(res.data);
  };

  const searchStrategies = async () => {
    try {
      const params: Record<string, string> = {};
      if (strategySearch) params.search = strategySearch;
      const res = await api.get<StrategyCard[]>("/admin/strategies", { params });
      setStrategies(res.data);
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "Failed to search strategies"));
    }
  };

  const startEditStrategy = (item: StrategyCard) => {
    setEditingStrategyId(item.id);
    const strategyType = (item.strategy_type ?? "RSI") as StrategyFormState["strategy_type"];
    const definition = getStrategyTypeDefinition(strategyTypeDefinitions, strategyType);
    const defaults = definition ? parametersFromDefaults(definition.parameters) : buildDefaultParameters(strategyType, strategyTypeDefinitions);
    const params = item.parameters ?? defaults;
    setStrategyForm({
      name: item.name,
      description: item.description ?? "",
      strategy_tag: item.strategy_tag,
      exchange: item.exchange,
      risk_level: item.risk_level,
      strategy_type: strategyType,
      parameters: Object.fromEntries(
        Object.entries(params).map(([key, value]) => [key, String(value)]),
      ),
      symbol: item.symbol ?? "BTCUSD",
      timeframe: item.timeframe ?? "1h",
      signal_source: item.signal_source ?? "platform_engine",
      logo_url: item.logo_url ?? "",
      image_url: item.image_url ?? "",
      tags: item.tags ? item.tags.split(",").map((tag) => tag.trim()).filter(Boolean) : [],
      followers: item.followers,
      recommended_margin: item.recommended_margin,
      mdd_percent: item.mdd_percent,
      win_rate_percent: item.win_rate_percent,
      pnl: item.pnl,
      roi_percent: item.roi_percent,
      chart_points: item.chart_points ? item.chart_points.split(",").map((point) => point.trim()) : ["0"],
      academy_slugs: item.academy_slugs ? item.academy_slugs.split(",").map((slug) => slug.trim()) : [],
      is_public: item.is_public,
      is_featured: item.is_featured,
    });
    setTab("strategies");
  };

  const resetStrategyForm = () => {
    setEditingStrategyId(null);
    setStrategyForm({
      ...emptyStrategy,
      parameters: buildDefaultParameters("RSI", strategyTypeDefinitions),
    });
    setTagInput("");
    setBacktestSummary(null);
  };

  const runStrategyBacktest = async () => {
    if (!strategyForm.strategy_tag) {
      setError("Strategy tag is required before running a backtest.");
      return;
    }
    if (strategyForm.strategy_type === "CUSTOM") {
      setError("CUSTOM strategies cannot be backtested on-platform.");
      return;
    }
    setBacktesting(true);
    setError(null);
    setMessage(null);
    setBacktestSummary(null);
    try {
      const res = await api.post<{
        id: number;
        roi: number;
        drawdown: number;
        win_rate: number;
        total_trades?: number;
        profit_factor?: number;
        net_profit?: number;
        applied_to_strategy: boolean;
      }>("/backtesting/run", {
        strategy_tag: strategyForm.strategy_tag,
        symbol: strategyForm.symbol,
        timeframe: strategyForm.timeframe,
        strategy_type: strategyForm.strategy_type,
        parameters: Object.fromEntries(
          Object.entries(strategyForm.parameters).map(([key, value]) => [key, Number.isNaN(Number(value)) ? value : Number(value)]),
        ),
        periods: 200,
        initial_capital: Number(strategyForm.recommended_margin || 1000),
        apply_to_strategy: true,
      });
      setStrategyForm((prev) => ({
        ...prev,
        roi_percent: String(res.data.roi),
        mdd_percent: String(res.data.drawdown),
        win_rate_percent: String(res.data.win_rate),
        pnl: res.data.net_profit != null ? String(res.data.net_profit) : prev.pnl,
      }));
      setBacktestSummary(
        [
          `ROI ${res.data.roi}%`,
          `Win rate ${res.data.win_rate}%`,
          `Max drawdown ${res.data.drawdown}%`,
          res.data.total_trades != null ? `${res.data.total_trades} trades` : null,
          res.data.profit_factor != null ? `Profit factor ${res.data.profit_factor}` : null,
          res.data.net_profit != null ? `Net profit ${res.data.net_profit}` : null,
        ]
          .filter(Boolean)
          .join(" · "),
      );
      setMessage(`Backtest completed (run #${res.data.id}). Metrics auto-filled from results.`);
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "Backtest failed."));
    } finally {
      setBacktesting(false);
    }
  };

  const saveStrategy = async () => {
    setSaving(true);
    setError(null);
    setMessage(null);

    try {
      const payload = {
        ...strategyForm,
        description: strategyForm.description || null,
        logo_url: strategyForm.logo_url || null,
        image_url: strategyForm.image_url || null,
        tags: Array.isArray(strategyForm.tags)
          ? strategyForm.tags.filter(Boolean).join(",") || null
          : strategyForm.tags || null,
        chart_points: Array.isArray(strategyForm.chart_points)
          ? strategyForm.chart_points.filter(Boolean).join(",") || null
          : strategyForm.chart_points || null,
        academy_slugs: Array.isArray(strategyForm.academy_slugs)
          ? strategyForm.academy_slugs.filter(Boolean).join(",") || null
          : strategyForm.academy_slugs || null,
        parameters: Object.fromEntries(
          Object.entries(strategyForm.parameters).map(([key, value]) => [key, Number.isNaN(Number(value)) ? value : Number(value)]),
        ),
      };
      if (editingStrategyId) {
        const res = await api.patch<StrategyCard>(`/admin/strategies/${editingStrategyId}`, payload);
        setStrategies((prev) => prev.map((item) => (item.id === editingStrategyId ? res.data : item)));
        setMessage("Strategy updated.");
      } else {
        const res = await api.post<StrategyCard>("/admin/strategies", payload);
        setStrategies((prev) => [res.data, ...prev]);
        setMessage("Strategy created.");
      }
      resetStrategyForm();
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "Failed to save strategy."));
    } finally {
      setSaving(false);
    }
  };

  const deleteStrategy = async (strategyId: number) => {
    if (!window.confirm("Delete strategy permanently?")) return;
    try {
      await api.delete(`/admin/strategies/${strategyId}`);
      setStrategies((prev) => prev.filter((item) => item.id !== strategyId));
      if (editingStrategyId === strategyId) resetStrategyForm();
      setMessage("Strategy deleted.");
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "Failed to delete strategy."));
    }
  };

  const runBulkAction = async (action: "publish" | "unpublish" | "feature" | "unfeature" | "delete" | "duplicate" | "archive") => {
    if (selectedStrategyIds.length === 0) {
      setError("Select at least one strategy first.");
      return;
    }
    try {
      const apiAction = action === "archive" ? "unpublish" : action;
      await api.post("/admin/strategies/bulk", { strategy_ids: selectedStrategyIds, action: apiAction });
      await searchStrategies();
      setSelectedStrategyIds([]);
      setMessage(`Bulk action completed: ${action}`);
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "Failed to run bulk action."));
    }
  };

  const runStrategyAction = async (strategyId: number, action: "publish" | "unpublish" | "feature" | "unfeature" | "archive") => {
    try {
      const apiAction = action === "archive" ? "unpublish" : action;
      await api.post("/admin/strategies/bulk", { strategy_ids: [strategyId], action: apiAction });
      await searchStrategies();
      setMessage(`Strategy ${action} completed.`);
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, `Failed to ${action} strategy.`));
    }
  };

  const saveArticle = async () => {
    try {
      if (editingArticleId) {
        const payload: AcademyArticleUpdateRequest = articleForm;
        const res = await api.patch<AcademyArticle>(`/admin/academy/articles/${editingArticleId}`, payload);
        setArticles((prev) => prev.map((item) => (item.id === editingArticleId ? res.data : item)));
        setMessage("Article updated.");
      } else {
        const res = await api.post<AcademyArticle>("/admin/academy/articles", articleForm);
        setArticles((prev) => [res.data, ...prev]);
        setMessage("Article created.");
      }
      setEditingArticleId(null);
      setArticleForm(emptyArticle);
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "Failed to save article."));
    }
  };

  const removeArticle = async (id: number) => {
    if (!window.confirm("Delete this article?")) return;
    try {
      await api.delete(`/admin/academy/articles/${id}`);
      setArticles((prev) => prev.filter((item) => item.id !== id));
      setMessage("Article deleted.");
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "Failed to delete article."));
    }
  };

  const banToggleUser = async (userId: number, isActive: boolean) => {
    try {
      await api.patch(`/admin/users/${userId}/ban`, { is_active: !isActive });
      await loadUsers();
      setMessage(`User ${isActive ? "banned" : "unbanned"}.`);
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "Failed to update user status."));
    }
  };

  const saveUserRiskLimits = async (userId: number, maxDailyLoss: number, maxTradesPerDay: number) => {
    try {
      await api.patch(`/admin/users/${userId}/risk-limits`, {
        max_daily_loss: maxDailyLoss,
        max_trades_per_day: maxTradesPerDay,
      });
      await loadUsers();
      setMessage(`Risk limits updated (max daily loss $${maxDailyLoss}).`);
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "Failed to update risk limits."));
      throw err;
    }
  };

  const broadcastNotification = async () => {
    try {
      await api.post("/admin/notifications/broadcast", {
        title: notificationTitle,
        message: notificationMessage,
        category: notificationCategory,
      });
      setNotificationTitle("");
      setNotificationMessage("");
      setMessage("Notification broadcast sent.");
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "Failed to send notification."));
    }
  };

  const saveSettings = async () => {
    if (!platformSettings) return;
    try {
      const payload: PlatformSettingsUpdateRequest = {
        site_name: platformSettings.site_name,
        support_email: platformSettings.support_email,
        fee_percent: platformSettings.fee_percent,
        profit_share_percent: platformSettings.profit_share_percent,
        maintenance_mode: platformSettings.maintenance_mode,
        telegram_alerts_enabled: platformSettings.telegram_alerts_enabled,
        telegram_chat_id: platformSettings.telegram_chat_id,
        exchange_api_key: platformSettings.exchange_api_key,
        exchange_api_secret: platformSettings.exchange_api_secret,
      };
      const res = await api.patch<PlatformSettings>("/admin/platform-settings", payload);
      setPlatformSettings(res.data);
      setMessage("Platform settings updated.");
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "Failed to save settings."));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050607]">
        <div className="mx-auto max-w-[1480px] px-4 py-8 sm:px-6 lg:px-8">
          <div className="animate-pulse rounded-[28px] border border-[#1A212A] bg-[#0B1118] p-8">
            <div className="h-8 w-56 rounded bg-[#1A212A]" />
            <div className="mt-6 grid gap-4 md:grid-cols-4">
              <div className="h-28 rounded-2xl bg-[#121820]" />
              <div className="h-28 rounded-2xl bg-[#121820]" />
              <div className="h-28 rounded-2xl bg-[#121820]" />
              <div className="h-28 rounded-2xl bg-[#121820]" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050607]">
      <div className="mx-auto max-w-[1480px] px-4 py-6 sm:px-6 lg:px-8">
        <header className="rounded-[28px] border border-[#1A212A] bg-[linear-gradient(180deg,#0D1218,#090D12)] p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-[#9BFF00]">Admin Console</p>
              <h1 className="mt-1 text-3xl font-semibold text-[#F3F7FB]">Atlas Control Center</h1>
              <p className="mt-1 text-sm text-[#8E9AAA]">
                Signed in as {profile?.full_name ?? "Admin"} · {profile?.email}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => void loadAll()}
                className="rounded-xl bg-[#9BFF00] hover:bg-[#B7FF45] active:scale-95 text-[#11140D] px-4 py-2 text-sm font-semibold transition-all duration-100"
              >
                Refresh
              </button>
              <button
                type="button"
                onClick={() => {
                  if (typeof window !== "undefined") {
                    sessionStorage.setItem("viewMode", "trader");
                  }
                  router.push("/dashboard");
                }}
                className="rounded-xl bg-[#9BFF00] hover:bg-[#B7FF45] active:scale-95 text-[#11140D] px-4 py-2 text-sm font-semibold transition-all duration-100"
              >
                Trader Dashboard
              </button>
              <button
                type="button"
                onClick={onLogout}
                className="rounded-xl bg-[#9BFF00] hover:bg-[#B7FF45] active:scale-95 text-[#11140D] px-4 py-2 text-sm font-semibold transition-all duration-100"
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        {error ? (
          <p className="mt-4 rounded-2xl border border-[#5A2A2A] bg-[#2A1414] px-4 py-3 text-sm text-[#FFB4B4]">{error}</p>
        ) : null}
        {message ? (
          <p className="mt-4 rounded-2xl border border-[#2A4A1A] bg-[#142A14] px-4 py-3 text-sm text-[#B7FF45]">{message}</p>
        ) : null}

        <nav className="sticky top-3 z-20 mt-5 flex gap-1 overflow-x-auto rounded-[24px] border border-[#1A212A] bg-[#0B1118]/95 p-1.5 backdrop-blur">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setTab(tab.id)}
              className={`whitespace-nowrap rounded-[18px] px-4 py-2.5 text-sm font-medium transition active:scale-95 duration-100 ${
                activeTab === tab.id
                  ? "bg-[#9BFF00] text-[#11140D]"
                  : "text-[#8E9AAA] hover:bg-[#121820] hover:text-[#F3F7FB]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {activeTab === "overview" ? (
          <section className="mt-5 space-y-5">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {[
                { label: "Total Users", value: metrics?.total_users ?? 0 },
                { label: "Active Subscriptions", value: metrics?.total_subscriptions ?? 0 },
                { label: "Published Strategies", value: metrics?.total_strategies ?? 0 },
                { label: "Trades Today", value: metrics?.trades_today ?? 0 },
              ].map((card) => (
                <div
                  key={card.label}
                  className="rounded-[24px] border border-[#1A212A] bg-[#0B1118] p-5 transition hover:border-[#9BFF00]/30"
                >
                  <p className="text-xs uppercase tracking-wide text-[#6B7785]">{card.label}</p>
                  <p className="mt-3 text-3xl font-semibold text-[#F3F7FB]">{card.value}</p>
                </div>
              ))}
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {[
                { label: "Active Traders", value: metrics?.active_traders ?? 0 },
                { label: "Revenue", value: `$${formatCurrency(metrics?.revenue ?? "0")}` },
                { label: "Profit Share", value: `$${formatCurrency(metrics?.profit_share ?? "0")}` },
                { label: "Total Followers", value: metrics?.total_followers ?? 0 },
              ].map((card) => (
                <div
                  key={card.label}
                  className="rounded-[24px] border border-[#1A212A] bg-[#0B1118] p-5"
                >
                  <p className="text-xs uppercase tracking-wide text-[#6B7785]">{card.label}</p>
                  <p className="mt-3 text-2xl font-semibold text-[#9BFF00]">{card.value}</p>
                </div>
              ))}
            </div>

            <div className="grid gap-5 lg:grid-cols-[1.3fr_0.7fr]">
              <div className="rounded-[28px] border border-[#1A212A] bg-[#0B1118] p-6">
                <h2 className="text-lg font-semibold text-[#F3F7FB]">Growth Chart (Trades)</h2>
                <div className="mt-4 flex h-44 items-end gap-2">
                  {growth.map((point) => {
                    const max = Math.max(...growth.map((item) => Number(item.value || 0)), 1);
                    const height = (Number(point.value || 0) / max) * 100;
                    return (
                      <div key={point.label} className="group flex flex-1 flex-col items-center gap-1">
                        <div
                          className="w-full rounded-md bg-gradient-to-t from-[#9BFF00]/30 to-[#9BFF00] transition group-hover:to-[#B7FF45]"
                          style={{ height: `${Math.max(height, 8)}%` }}
                        />
                        <span className="text-[10px] text-[#6B7785]">{point.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-[28px] border border-[#1A212A] bg-[#0B1118] p-6">
                <h2 className="text-lg font-semibold text-[#F3F7FB]">Recent Activities</h2>
                <div className="mt-4 max-h-52 space-y-2 overflow-auto pr-1">
                  {activities.map((item) => (
                    <div key={item.id} className="rounded-xl border border-[#242D37] bg-[#050607] px-3 py-2">
                      <p className="text-sm font-medium text-[#F3F7FB]">{item.title}</p>
                      <p className="mt-1 text-xs text-[#8E9AAA]">
                        {item.category} · {formatDate(item.created_at)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { tab: "subscriptions" as AdminTab, label: "Verify UPI Payments" },
                { tab: "users" as AdminTab, label: "Manage Users" },
                { tab: "strategies" as AdminTab, label: "Publish Strategies" },
                { tab: "notifications" as AdminTab, label: "Broadcast Alerts" },
              ].map((action) => (
                <button
                  key={action.tab}
                  type="button"
                  onClick={() => setTab(action.tab)}
                  className="rounded-2xl border border-[#242D37] bg-[#0B1118] px-4 py-4 text-left text-sm font-medium text-[#F3F7FB] transition hover:border-[#9BFF00]/40"
                >
                  {action.label}
                </button>
              ))}
            </div>
          </section>
        ) : null}

        {activeTab === "subscriptions" ? (
          <AdminSubscriptionsTab
            onMessage={setMessage}
            onError={setError}
          />
        ) : null}

        {activeTab === "strategies" ? (
          <section className="mt-5 grid gap-5 xl:grid-cols-[1.35fr_0.65fr]">
            <div className="space-y-5">
              <div className="rounded-2xl border border-[#1E2A39] bg-[#0D1725]/70 p-5 backdrop-blur">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2 className="text-lg font-semibold">Strategy Management</h2>
                  <div className="flex gap-2">
                    <input value={strategySearch} onChange={(e) => setStrategySearch(e.target.value)} placeholder="Search strategy" className="rounded-lg border border-[#2A3B50] bg-[#0F1B2B] px-3 py-2 text-sm text-white" />
                    <button onClick={searchStrategies} className="rounded-lg border border-[#242D37] px-3 py-2 text-sm text-[#C9D4E0] hover:border-[#9BFF00]/40 hover:text-[#9BFF00] hover:bg-[#9BFF00]/5 transition duration-150 active:scale-95">Search</button>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  <button onClick={() => runBulkAction("publish")} className="rounded-md border border-[#242D37] px-3 py-1 text-xs text-[#C9D4E0] hover:border-[#9BFF00]/40 hover:text-[#9BFF00] hover:bg-[#9BFF00]/5 transition duration-150 active:scale-95">Publish</button>
                  <button onClick={() => runBulkAction("unpublish")} className="rounded-md border border-[#242D37] px-3 py-1 text-xs text-[#C9D4E0] hover:border-[#9BFF00]/40 hover:text-[#9BFF00] hover:bg-[#9BFF00]/5 transition duration-150 active:scale-95">Unpublish</button>
                  <button onClick={() => runBulkAction("feature")} className="rounded-md border border-[#242D37] px-3 py-1 text-xs text-[#C9D4E0] hover:border-[#9BFF00]/40 hover:text-[#9BFF00] hover:bg-[#9BFF00]/5 transition duration-150 active:scale-95">Feature</button>
                  <button onClick={() => runBulkAction("archive")} className="rounded-md border border-[#242D37] px-3 py-1 text-xs text-[#C9D4E0] hover:border-[#9BFF00]/40 hover:text-[#9BFF00] hover:bg-[#9BFF00]/5 transition duration-150 active:scale-95">Archive</button>
                  <button onClick={() => runBulkAction("duplicate")} className="rounded-md border border-[#242D37] px-3 py-1 text-xs text-[#C9D4E0] hover:border-[#9BFF00]/40 hover:text-[#9BFF00] hover:bg-[#9BFF00]/5 transition duration-150 active:scale-95">Duplicate</button>
                  <button onClick={() => runBulkAction("delete")} className="rounded-md border border-[#5C2A35] px-3 py-1 text-xs text-[#FFC2CC] hover:border-red-500/40 hover:text-red-400 hover:bg-red-500/10 transition duration-150 active:scale-95">Delete</button>
                </div>

                <div className="mt-4 max-h-[440px] space-y-2 overflow-auto pr-1">
                  {strategies.map((item) => (
                    <div key={item.id} className="rounded-xl border border-[#27384D] bg-[#0F1D2F] p-3">
                      <div className="flex items-start justify-between gap-2">
                        <label className="flex items-start gap-2">
                          <input
                            type="checkbox"
                            checked={selectedStrategyIds.includes(item.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedStrategyIds((prev) => [...prev, item.id]);
                              } else {
                                setSelectedStrategyIds((prev) => prev.filter((id) => id !== item.id));
                              }
                            }}
                          />
                          <div>
                            <p className="font-medium">{item.name}</p>
                            <p className="text-xs text-[#8EA9C9]">{item.strategy_tag} - {item.risk_level.toUpperCase()} - ROI {item.roi_percent}%</p>
                            <div className="mt-2">
                              <StrategyStatusBadges strategy={item} />
                            </div>
                          </div>
                        </label>
                        <div className="flex flex-wrap gap-2">
                          <button onClick={() => startEditStrategy(item)} className="rounded-md border border-[#242D37] px-2 py-1 text-xs text-[#C9D4E0] hover:border-[#9BFF00]/40 hover:text-[#9BFF00] hover:bg-[#9BFF00]/5 transition duration-150 active:scale-95">Edit</button>
                          <button onClick={() => runStrategyAction(item.id, "publish")} className="rounded-md border border-[#242D37] px-2 py-1 text-xs text-[#C9D4E0] hover:border-[#9BFF00]/40 hover:text-[#9BFF00] hover:bg-[#9BFF00]/5 transition duration-150 active:scale-95">Publish</button>
                          <button onClick={() => runStrategyAction(item.id, "unpublish")} className="rounded-md border border-[#242D37] px-2 py-1 text-xs text-[#C9D4E0] hover:border-[#9BFF00]/40 hover:text-[#9BFF00] hover:bg-[#9BFF00]/5 transition duration-150 active:scale-95">Unpublish</button>
                          <button onClick={() => runStrategyAction(item.id, "feature")} className="rounded-md border border-[#242D37] px-2 py-1 text-xs text-[#C9D4E0] hover:border-[#9BFF00]/40 hover:text-[#9BFF00] hover:bg-[#9BFF00]/5 transition duration-150 active:scale-95">Feature</button>
                          <button onClick={() => runStrategyAction(item.id, "archive")} className="rounded-md border border-[#242D37] px-2 py-1 text-xs text-[#C9D4E0] hover:border-[#9BFF00]/40 hover:text-[#9BFF00] hover:bg-[#9BFF00]/5 transition duration-150 active:scale-95">Archive</button>
                          <button onClick={() => deleteStrategy(item.id)} className="rounded-md border border-[#5C2A35] px-2 py-1 text-xs text-[#FFBAC8] hover:border-red-500/40 hover:text-red-400 hover:bg-red-500/10 transition duration-150 active:scale-95">Delete</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-[#1E2A39] bg-[#0D1725]/70 p-5 backdrop-blur">
                <h3 className="text-lg font-semibold">{editingStrategyId ? "Edit Strategy" : "Create Strategy"}</h3>
                <p className="mt-1 text-sm text-[#8EA9C9]">Upload a strategy for users to discover and deploy.</p>

                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <label className="text-sm text-[#A9C3DE]">
                    Strategy name *
                    <input value={strategyForm.name} onChange={(e) => setStrategyForm((prev) => ({ ...prev, name: e.target.value }))} placeholder="BankNifty Momentum" className="mt-1 w-full rounded-lg border border-[#2A3B50] bg-[#0F1B2B] px-3 py-2" />
                  </label>
                  <label className="text-sm text-[#A9C3DE]">
                    Strategy tag (unique slug) *
                    <input value={strategyForm.strategy_tag} onChange={(e) => setStrategyForm((prev) => ({ ...prev, strategy_tag: e.target.value }))} placeholder="banknifty-momentum" className="mt-1 w-full rounded-lg border border-[#2A3B50] bg-[#0F1B2B] px-3 py-2" />
                  </label>
                  <label className="text-sm text-[#A9C3DE]">
                    Exchange
                    <select value={strategyForm.exchange} onChange={(e) => setStrategyForm((prev) => ({ ...prev, exchange: e.target.value }))} className="mt-1 w-full rounded-lg border border-[#2A3B50] bg-[#0F1B2B] px-3 py-2">
                      <option value="Delta Exchange">Delta Exchange</option>
                      <option value="Zerodha">Zerodha</option>
                      <option value="Binance">Binance</option>
                    </select>
                  </label>
                  <label className="text-sm text-[#A9C3DE]">
                    Risk level
                    <select value={strategyForm.risk_level} onChange={(e) => setStrategyForm((prev) => ({ ...prev, risk_level: e.target.value as "low" | "medium" | "high" }))} className="mt-1 w-full rounded-lg border border-[#2A3B50] bg-[#0F1B2B] px-3 py-2">
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </label>
                  <label className="text-sm text-[#A9C3DE]">
                    Strategy type *
                    <select
                      value={strategyForm.strategy_type}
                      onChange={(e) => {
                        const nextType = e.target.value as StrategyFormState["strategy_type"];
                        const definition = getStrategyTypeDefinition(strategyTypeDefinitions, nextType);
                        setStrategyForm((prev) => ({
                          ...prev,
                          strategy_type: nextType,
                          parameters: definition
                            ? parametersFromDefaults(definition.parameters)
                            : buildDefaultParameters(nextType, strategyTypeDefinitions),
                          signal_source:
                            definition?.default_signal_source ??
                            (nextType === "CUSTOM" ? "creator_webhook" : prev.signal_source),
                          symbol: nextType === "LONDON_BREAKOUT" ? "XAUUSD" : prev.symbol,
                          timeframe: nextType === "LONDON_BREAKOUT" ? "15m" : prev.timeframe,
                        }));
                      }}
                      className="mt-1 w-full rounded-lg border border-[#2A3B50] bg-[#0F1B2B] px-3 py-2"
                    >
                      {strategyTypeDefinitions.map((definition) => (
                        <option key={definition.type} value={definition.type}>
                          {definition.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="text-sm text-[#A9C3DE]">
                    Signal source *
                    <select
                      value={strategyForm.signal_source}
                      onChange={(e) => setStrategyForm((prev) => ({ ...prev, signal_source: e.target.value as StrategyFormState["signal_source"] }))}
                      disabled={strategyForm.strategy_type === "CUSTOM"}
                      className="mt-1 w-full rounded-lg border border-[#2A3B50] bg-[#0F1B2B] px-3 py-2 disabled:opacity-60"
                    >
                      <option value="platform_engine">Platform engine (auto)</option>
                      <option value="creator_webhook">Creator webhook</option>
                    </select>
                  </label>
                  <label className="text-sm text-[#A9C3DE]">
                    Symbol *
                    <input value={strategyForm.symbol} onChange={(e) => setStrategyForm((prev) => ({ ...prev, symbol: e.target.value.toUpperCase().replace(/^[#$]+/, "") }))} placeholder="XAUUSD (maps to XAUTUSD on Delta)" className="mt-1 w-full rounded-lg border border-[#2A3B50] bg-[#0F1B2B] px-3 py-2" />
                    <p className="mt-1 text-xs text-[#8EA9C9]">Gold on Delta India is listed as XAUTUSD. You can enter XAUUSD — the platform resolves it automatically.</p>
                  </label>
                  <label className="text-sm text-[#A9C3DE]">
                    Timeframe *
                    <select value={strategyForm.timeframe} onChange={(e) => setStrategyForm((prev) => ({ ...prev, timeframe: e.target.value }))} className="mt-1 w-full rounded-lg border border-[#2A3B50] bg-[#0F1B2B] px-3 py-2">
                      <option value="1m">1m</option>
                      <option value="5m">5m</option>
                      <option value="15m">15m</option>
                      <option value="1h">1h</option>
                      <option value="4h">4h</option>
                      <option value="1d">1d</option>
                    </select>
                  </label>
                  <label className="text-sm text-[#A9C3DE]">
                    Recommended margin ($)
                    <input value={strategyForm.recommended_margin} onChange={(e) => setStrategyForm((prev) => ({ ...prev, recommended_margin: e.target.value }))} placeholder="1000" className="mt-1 w-full rounded-lg border border-[#2A3B50] bg-[#0F1B2B] px-3 py-2" />
                  </label>
                  <label className="text-sm text-[#A9C3DE]">
                    ROI % (display)
                    <input value={strategyForm.roi_percent} onChange={(e) => setStrategyForm((prev) => ({ ...prev, roi_percent: e.target.value }))} placeholder="12.5" className="mt-1 w-full rounded-lg border border-[#2A3B50] bg-[#0F1B2B] px-3 py-2" />
                  </label>
                  <label className="text-sm text-[#A9C3DE]">
                    Win rate % (display)
                    <input value={strategyForm.win_rate_percent} onChange={(e) => setStrategyForm((prev) => ({ ...prev, win_rate_percent: e.target.value }))} placeholder="68" className="mt-1 w-full rounded-lg border border-[#2A3B50] bg-[#0F1B2B] px-3 py-2" />
                  </label>
                  <label className="text-sm text-[#A9C3DE]">
                    Max drawdown % (display)
                    <input value={strategyForm.mdd_percent} onChange={(e) => setStrategyForm((prev) => ({ ...prev, mdd_percent: e.target.value }))} placeholder="8" className="mt-1 w-full rounded-lg border border-[#2A3B50] bg-[#0F1B2B] px-3 py-2" />
                  </label>
                  <label className="text-sm text-[#A9C3DE] sm:col-span-2">
                    Logo URL (optional)
                    <input value={strategyForm.logo_url} onChange={(e) => setStrategyForm((prev) => ({ ...prev, logo_url: e.target.value }))} placeholder="https://..." className="mt-1 w-full rounded-lg border border-[#2A3B50] bg-[#0F1B2B] px-3 py-2" />
                  </label>
                  <label className="text-sm text-[#A9C3DE] sm:col-span-2">
                    Cover image URL (optional)
                    <input value={strategyForm.image_url} onChange={(e) => setStrategyForm((prev) => ({ ...prev, image_url: e.target.value }))} placeholder="https://..." className="mt-1 w-full rounded-lg border border-[#2A3B50] bg-[#0F1B2B] px-3 py-2" />
                  </label>
                </div>

                <div className="mt-4 rounded-xl border border-[#243447] bg-[#0B1522] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h4 className="text-sm font-semibold text-[#D7E8FA]">Strategy parameters</h4>
                      <p className="text-xs text-[#8EA9C9]">Used for backtest, deploy, and live runner.</p>
                    </div>
                    <button
                      type="button"
                      onClick={runStrategyBacktest}
                      disabled={backtesting || strategyForm.strategy_type === "CUSTOM"}
                      className="rounded-lg border border-[#2F6F9B] px-3 py-2 text-xs font-semibold text-[#B9DCFF] disabled:opacity-50"
                    >
                      {backtesting ? "Running..." : "Run Backtest & Fill Stats"}
                    </button>
                  </div>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <StrategyParameterFields
                      fields={activeStrategyDefinition?.parameters ?? []}
                      values={strategyForm.parameters}
                      onChange={(key, value) =>
                        setStrategyForm((prev) => ({
                          ...prev,
                          parameters: { ...prev.parameters, [key]: value },
                        }))
                      }
                    />
                  </div>
                  {backtestSummary ? (
                    <p className="mt-3 text-xs text-[#AEE7B8]">{backtestSummary}</p>
                  ) : null}
                  {strategyForm.signal_source === "creator_webhook" && strategyForm.strategy_tag ? (
                    <p className="mt-3 text-xs text-[#8EA9C9]">
                      Webhook URL: POST /api/v1/strategy/webhook/{strategyForm.strategy_tag}
                    </p>
                  ) : null}
                </div>

                <label className="mt-4 block text-sm text-[#A9C3DE]">
                  Description
                  <textarea value={strategyForm.description} onChange={(e) => setStrategyForm((prev) => ({ ...prev, description: e.target.value }))} placeholder="Explain how this strategy works..." rows={4} className="mt-1 w-full rounded-lg border border-[#2A3B50] bg-[#0F1B2B] px-3 py-2" />
                </label>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <input value={tagInput} onChange={(e) => setTagInput(e.target.value)} placeholder="Add tag" className="rounded-lg border border-[#2A3B50] bg-[#0F1B2B] px-3 py-2 text-sm" />
                  <button
                    onClick={() => {
                      const normalized = tagInput.trim().toLowerCase();
                      if (!normalized) return;
                      if (!strategyForm.tags.includes(normalized)) {
                        setStrategyForm((prev) => ({ ...prev, tags: [...prev.tags, normalized] }));
                      }
                      setTagInput("");
                    }}
                    className="rounded-lg border border-[#242D37] px-3 py-2 text-sm text-[#C9D4E0] hover:border-[#9BFF00]/40 hover:text-[#9BFF00] hover:bg-[#9BFF00]/5 transition duration-150 active:scale-95"
                  >
                    Add Tag
                  </button>
                  <div className="flex flex-wrap gap-1">
                    {strategyForm.tags.map((tag) => (
                      <button key={tag} onClick={() => setStrategyForm((prev) => ({ ...prev, tags: prev.tags.filter((item) => item !== tag) }))} className="rounded-full border border-[#242D37] hover:border-red-500/40 hover:text-red-400 px-2 py-1 text-xs text-[#A9C3DE]">#{tag}</button>
                    ))}
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-4 text-sm text-[#A9C3DE]">
                  <label className="flex items-center gap-2"><input type="checkbox" checked={strategyForm.is_public} onChange={(e) => setStrategyForm((prev) => ({ ...prev, is_public: e.target.checked }))} />Public</label>
                  <label className="flex items-center gap-2"><input type="checkbox" checked={strategyForm.is_featured} onChange={(e) => setStrategyForm((prev) => ({ ...prev, is_featured: e.target.checked }))} />Featured</label>
                </div>

                <div className="mt-4 flex gap-2">
                  <button onClick={saveStrategy} disabled={saving} className="rounded-xl bg-[#9BFF00] hover:bg-[#B7FF45] active:scale-95 text-[#11140D] px-4 py-2 text-sm font-semibold transition-all duration-100 disabled:opacity-60">{saving ? "Saving..." : editingStrategyId ? "Update Strategy" : "Create Strategy"}</button>
                  {editingStrategyId ? <button onClick={resetStrategyForm} className="rounded-xl border border-[#242D37] px-4 py-2 text-sm text-[#C9D4E0] hover:border-[#9BFF00]/40 hover:text-[#9BFF00] hover:bg-[#9BFF00]/5 transition duration-150 active:scale-95">Cancel</button> : null}
                </div>

                {editingStrategyId ? (
                  <div className="mt-5 rounded-xl border border-[#27384D] bg-[#0F1D2F] p-4">
                    <h4 className="text-sm font-semibold text-[#DDE9F7]">Additional analytics</h4>
                    <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                      <div className="rounded-lg border border-[#35506E] bg-[#0C1624] p-3 text-xs"><p className="text-[#80A8CE]">Followers</p><p className="mt-1 text-base font-semibold">{strategyForm.followers}</p></div>
                      <div className="rounded-lg border border-[#35506E] bg-[#0C1624] p-3 text-xs"><p className="text-[#80A8CE]">Live PnL</p><p className="mt-1 text-base font-semibold">{strategyForm.pnl}</p></div>
                      <div className="rounded-lg border border-[#35506E] bg-[#0C1624] p-3 text-xs"><p className="text-[#80A8CE]">ROI %</p><p className="mt-1 text-base font-semibold">{strategyForm.roi_percent}%</p></div>
                      <div className="rounded-lg border border-[#35506E] bg-[#0C1624] p-3 text-xs"><p className="text-[#80A8CE]">Win Rate %</p><p className="mt-1 text-base font-semibold">{strategyForm.win_rate_percent}%</p></div>
                      <div className="rounded-lg border border-[#35506E] bg-[#0C1624] p-3 text-xs"><p className="text-[#80A8CE]">MDD %</p><p className="mt-1 text-base font-semibold">{strategyForm.mdd_percent}%</p></div>
                      <div className="rounded-lg border border-[#35506E] bg-[#0C1624] p-3 text-xs"><p className="text-[#80A8CE]">Win/Loss Ratio</p><p className="mt-1 text-base font-semibold">{editingPerformance?.win_loss_ratio ?? "-"}</p></div>
                      <div className="rounded-lg border border-[#35506E] bg-[#0C1624] p-3 text-xs"><p className="text-[#80A8CE]">Risk Reward Ratio</p><p className="mt-1 text-base font-semibold">{editingPerformance?.average_rr ?? "-"}</p></div>
                      <div className="rounded-lg border border-[#35506E] bg-[#0C1624] p-3 text-xs"><p className="text-[#80A8CE]">Open Positions</p><p className="mt-1 text-base font-semibold">{editingPerformance?.open_positions ?? 0}</p></div>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>

            <aside className="rounded-2xl border border-[#1E2A39] bg-[#0D1725]/70 p-5 backdrop-blur">
              <h3 className="text-lg font-semibold">Real-Time Card Preview</h3>
              <div className="mt-4 overflow-hidden rounded-2xl border border-[#2A3D55] bg-[#111E31]">
                {strategyForm.image_url ? (
                  <div className="relative h-36 w-full">
                    <Image src={strategyForm.image_url} alt="strategy-cover" fill sizes="(max-width: 768px) 100vw, 400px" className="object-cover" unoptimized />
                  </div>
                ) : (
                  <div className="h-36 bg-gradient-to-r from-[#1E3A8A] via-[#0EA5E9] to-[#10B981]" />
                )}
                <div className="p-4">
                  <div className="flex items-center gap-3">
                    {strategyForm.logo_url ? (
                      <Image src={strategyForm.logo_url} alt="strategy-logo" width={44} height={44} className="h-11 w-11 rounded-xl border border-[#35506E] object-cover" unoptimized />
                    ) : (
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#35506E] bg-[#13243A] text-xs text-[#A8C0DB]">LOGO</div>
                    )}
                    <div>
                      <p className="font-semibold">{strategyForm.name || "Strategy Name"}</p>
                      <p className="text-xs text-[#9AB4CF]">{strategyForm.strategy_tag || "strategy-tag"}</p>
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-[#A7C0D9]">{strategyForm.description || "Strategy description preview appears here."}</p>
                  <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                    <div className="rounded-lg border border-[#35506E] bg-[#0C1624] p-2"><p className="text-[#80A8CE]">ROI</p><p className="mt-1 font-semibold">{strategyPreview.roi.toFixed(2)}%</p></div>
                    <div className="rounded-lg border border-[#35506E] bg-[#0C1624] p-2"><p className="text-[#80A8CE]">Win Rate</p><p className="mt-1 font-semibold">{strategyPreview.winRate.toFixed(2)}%</p></div>
                    <div className="rounded-lg border border-[#35506E] bg-[#0C1624] p-2"><p className="text-[#80A8CE]">Avg Curve</p><p className="mt-1 font-semibold">{strategyPreview.avg.toFixed(2)}</p></div>
                  </div>
                </div>
              </div>
            </aside>
          </section>
        ) : null}

        {activeTab === "performance" ? (
          <section className="mt-5 rounded-2xl border border-[#1E2A39] bg-[#0D1725]/70 p-5 backdrop-blur">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-lg font-semibold">Strategy Performance</h2>
              <select value={performanceStrategyId ?? ""} onChange={(e) => setPerformanceStrategyId(Number(e.target.value))} className="rounded-lg border border-[#2A3B50] bg-[#0F1B2B] px-3 py-2 text-sm">
                {strategies.map((item) => (
                  <option key={item.id} value={item.id}>{item.name}</option>
                ))}
              </select>
            </div>

            {performanceData ? (
              <div className="mt-4 grid gap-4 lg:grid-cols-2">
                <div className="rounded-xl border border-[#29415A] bg-[#101D2E] p-4">
                  <h3 className="font-medium">Equity Curve</h3>
                  <div className="mt-3 flex h-36 items-end gap-2">
                    {performanceData.equity_curve.map((point) => {
                      const max = Math.max(...performanceData.equity_curve.map((item) => Number(item.value || 0)), 1);
                      const height = (Number(point.value) / max) * 100;
                      return <div key={point.label} className="flex-1 rounded bg-gradient-to-t from-[#0EA5E9] to-[#22D3EE]" style={{ height: `${Math.max(height, 8)}%` }} />;
                    })}
                  </div>
                </div>

                <div className="rounded-xl border border-[#29415A] bg-[#101D2E] p-4">
                  <h3 className="font-medium">Drawdown Curve</h3>
                  <div className="mt-3 flex h-36 items-end gap-2">
                    {performanceData.drawdown_curve.map((point) => {
                      const max = Math.max(...performanceData.drawdown_curve.map((item) => Number(item.value || 0)), 1);
                      const height = (Number(point.value) / max) * 100;
                      return <div key={point.label} className="flex-1 rounded bg-gradient-to-t from-[#EF4444] to-[#F97316]" style={{ height: `${Math.max(height, 8)}%` }} />;
                    })}
                  </div>
                </div>

                <div className="rounded-xl border border-[#29415A] bg-[#101D2E] p-4">
                  <p className="text-sm text-[#90ADCA]">Win/Loss Ratio</p>
                  <p className="mt-2 text-2xl font-semibold">{performanceData.win_loss_ratio}</p>
                </div>
                <div className="rounded-xl border border-[#29415A] bg-[#101D2E] p-4">
                  <p className="text-sm text-[#90ADCA]">Average RR</p>
                  <p className="mt-2 text-2xl font-semibold">{performanceData.average_rr}</p>
                </div>
              </div>
            ) : (
              <p className="mt-4 text-sm text-[#8DA7C5]">No performance data yet.</p>
            )}
          </section>
        ) : null}

        {activeTab === "academy" ? (
          <section className="mt-5 grid gap-5 xl:grid-cols-[1fr_1fr]">
            <div className="rounded-2xl border border-[#1E2A39] bg-[#0D1725]/70 p-5 backdrop-blur">
              <h2 className="text-lg font-semibold">Academy CMS</h2>
              <div className="mt-3 space-y-3">
                <input value={articleForm.title} onChange={(e) => setArticleForm((prev) => ({ ...prev, title: e.target.value }))} placeholder="Article Title" className="w-full rounded-lg border border-[#2A3B50] bg-[#0F1B2B] px-3 py-2" />
                <input value={articleForm.slug} onChange={(e) => setArticleForm((prev) => ({ ...prev, slug: e.target.value }))} placeholder="SEO Slug" className="w-full rounded-lg border border-[#2A3B50] bg-[#0F1B2B] px-3 py-2" />
                <input value={articleForm.category} onChange={(e) => setArticleForm((prev) => ({ ...prev, category: e.target.value }))} placeholder="Category" className="w-full rounded-lg border border-[#2A3B50] bg-[#0F1B2B] px-3 py-2" />
                <textarea value={articleForm.summary} onChange={(e) => setArticleForm((prev) => ({ ...prev, summary: e.target.value }))} placeholder="Summary" rows={2} className="w-full rounded-lg border border-[#2A3B50] bg-[#0F1B2B] px-3 py-2" />
                <textarea value={articleForm.content_markdown} onChange={(e) => setArticleForm((prev) => ({ ...prev, content_markdown: e.target.value }))} placeholder="Markdown content" rows={8} className="w-full rounded-lg border border-[#2A3B50] bg-[#0F1B2B] px-3 py-2 font-mono text-sm" />
                <label className="flex items-center gap-2 text-sm text-[#A8C2DE]"><input type="checkbox" checked={articleForm.is_published} onChange={(e) => setArticleForm((prev) => ({ ...prev, is_published: e.target.checked }))} />Publish</label>
                <div className="flex gap-2">
                  <button onClick={saveArticle} className="rounded-xl bg-[#9BFF00] hover:bg-[#B7FF45] active:scale-95 text-[#11140D] px-4 py-2 text-sm font-semibold transition-all duration-100 disabled:opacity-60">{editingArticleId ? "Update" : "Create"} Article</button>
                  {editingArticleId ? <button onClick={() => { setEditingArticleId(null); setArticleForm(emptyArticle); }} className="rounded-xl border border-[#242D37] px-4 py-2 text-sm text-[#C9D4E0] hover:border-[#9BFF00]/40 hover:text-[#9BFF00] hover:bg-[#9BFF00]/5 transition duration-150 active:scale-95">Cancel</button> : null}
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-[#1E2A39] bg-[#0D1725]/70 p-5 backdrop-blur">
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-semibold">Articles</h3>
                <input value={articleSearch} onChange={(e) => setArticleSearch(e.target.value)} placeholder="Search articles" className="rounded-lg border border-[#2A3B50] bg-[#0F1B2B] px-3 py-2 text-sm text-white" />
              </div>
              <div className="mt-3 max-h-[420px] space-y-2 overflow-auto pr-1">
                {filteredArticles.map((item) => (
                  <div key={item.id} className="rounded-xl border border-[#27384D] bg-[#0F1D2F] p-3">
                    <div className="flex justify-between gap-2">
                      <div>
                        <p className="font-medium">{item.title}</p>
                        <p className="text-xs text-[#8EA8C7]">{item.slug} - {item.is_published ? "Published" : "Draft"}</p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => { setEditingArticleId(item.id); setArticleForm({ title: item.title, slug: item.slug, category: item.category, summary: item.summary, content_markdown: item.content_markdown, is_published: item.is_published }); }} className="rounded-md border border-[#242D37] px-2 py-1 text-xs text-[#C9D4E0] hover:border-[#9BFF00]/40 hover:text-[#9BFF00] hover:bg-[#9BFF00]/5 transition duration-150 active:scale-95">Edit</button>
                        <button onClick={() => removeArticle(item.id)} className="rounded-md border border-[#5C2A35] px-2 py-1 text-xs text-[#FFBAC8] hover:border-red-500/40 hover:text-red-400 hover:bg-red-500/10 transition duration-150 active:scale-95">Delete</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        {activeTab === "users" ? (
          <AdminUsersTab
            users={users}
            userSearch={userSearch}
            kycFilter={kycFilter}
            subscriptionFilter={subscriptionFilter}
            onUserSearchChange={setUserSearch}
            onKycFilterChange={setKycFilter}
            onSubscriptionFilterChange={setSubscriptionFilter}
            onApply={() => void loadUsers()}
            onBanToggle={banToggleUser}
            onSaveRiskLimits={saveUserRiskLimits}
            formatCurrency={formatCurrency}
          />
        ) : null}

        {activeTab === "kyc" ? <AdminKYCTab onMessage={setMessage} /> : null}

        {activeTab === "trades" ? <AdminTradesTab onMessage={setMessage} /> : null}

        {activeTab === "notifications" ? (
          <section className="mt-5 rounded-2xl border border-[#1E2A39] bg-[#0D1725]/70 p-5 backdrop-blur">
            <h2 className="text-lg font-semibold">Notifications & Alerts</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <input value={notificationTitle} onChange={(e) => setNotificationTitle(e.target.value)} placeholder="Alert title" className="rounded-lg border border-[#2A3B50] bg-[#0F1B2B] px-3 py-2" />
              <select value={notificationCategory} onChange={(e) => setNotificationCategory(e.target.value)} className="rounded-lg border border-[#2A3B50] bg-[#0F1B2B] px-3 py-2">
                <option value="admin">Admin</option>
                <option value="system">System</option>
                <option value="telegram">Telegram</option>
                <option value="email">Email</option>
              </select>
            </div>
             <textarea value={notificationMessage} onChange={(e) => setNotificationMessage(e.target.value)} placeholder="Notification message" rows={4} className="mt-3 w-full rounded-lg border border-[#2A3B50] bg-[#0F1B2B] px-3 py-2 text-white" />
            <button onClick={broadcastNotification} className="mt-3 rounded-xl bg-[#9BFF00] hover:bg-[#B7FF45] active:scale-95 text-[#11140D] px-4 py-2 text-sm font-semibold transition-all duration-100">Broadcast to Users</button>
          </section>
        ) : null}

        {activeTab === "settings" ? (
          <section className="mt-5 rounded-2xl border border-[#1E2A39] bg-[#0D1725]/70 p-5 backdrop-blur">
            <h2 className="text-lg font-semibold">Platform Settings</h2>
            {platformSettings ? (
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <input value={platformSettings.site_name} onChange={(e) => setPlatformSettings((prev) => (prev ? { ...prev, site_name: e.target.value } : prev))} placeholder="Site name" className="rounded-lg border border-[#2A3B50] bg-[#0F1B2B] px-3 py-2 text-white" />
                <input value={platformSettings.support_email} onChange={(e) => setPlatformSettings((prev) => (prev ? { ...prev, support_email: e.target.value } : prev))} placeholder="Support email" className="rounded-lg border border-[#2A3B50] bg-[#0F1B2B] px-3 py-2 text-white" />
                <input type="number" value={platformSettings.fee_percent} onChange={(e) => setPlatformSettings((prev) => (prev ? { ...prev, fee_percent: Number(e.target.value) } : prev))} placeholder="Fee %" className="rounded-lg border border-[#2A3B50] bg-[#0F1B2B] px-3 py-2 text-white" />
                <input type="number" value={platformSettings.profit_share_percent} onChange={(e) => setPlatformSettings((prev) => (prev ? { ...prev, profit_share_percent: Number(e.target.value) } : prev))} placeholder="Profit share %" className="rounded-lg border border-[#2A3B50] bg-[#0F1B2B] px-3 py-2 text-white" />
                <input value={platformSettings.exchange_api_key ?? ""} onChange={(e) => setPlatformSettings((prev) => (prev ? { ...prev, exchange_api_key: e.target.value } : prev))} placeholder="Exchange API key" className="rounded-lg border border-[#2A3B50] bg-[#0F1B2B] px-3 py-2 text-white" />
                <input value={platformSettings.exchange_api_secret ?? ""} onChange={(e) => setPlatformSettings((prev) => (prev ? { ...prev, exchange_api_secret: e.target.value } : prev))} placeholder="Exchange API secret" className="rounded-lg border border-[#2A3B50] bg-[#0F1B2B] px-3 py-2 text-white" />
                <label className="flex items-center gap-2 text-sm text-[#A8C2DE]"><input type="checkbox" checked={platformSettings.telegram_alerts_enabled} onChange={(e) => setPlatformSettings((prev) => (prev ? { ...prev, telegram_alerts_enabled: e.target.checked } : prev))} />Telegram Alerts</label>
                <label className="flex items-center gap-2 text-sm text-[#A8C2DE]"><input type="checkbox" checked={platformSettings.maintenance_mode} onChange={(e) => setPlatformSettings((prev) => (prev ? { ...prev, maintenance_mode: e.target.checked } : prev))} />Maintenance Mode</label>
              </div>
            ) : null}
            <button onClick={saveSettings} className="mt-4 rounded-xl bg-[#9BFF00] hover:bg-[#B7FF45] active:scale-95 text-[#11140D] px-4 py-2 text-sm font-semibold transition-all duration-100">Save Settings</button>
          </section>
        ) : null}

        {activeTab === "security" ? (
          <section className="mt-5 rounded-2xl border border-[#1E2A39] bg-[#0D1725]/70 p-5 backdrop-blur">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-lg font-semibold">Audit & Security Logs</h2>
              <div className="flex gap-2">
                <select value={auditSeverity} onChange={(e) => setAuditSeverity(e.target.value)} className="rounded-lg border border-[#2A3B50] bg-[#0F1B2B] px-3 py-2 text-sm text-white outline-none focus:border-[#9BFF00]/40 transition duration-150">
                  <option value="all">All severity</option>
                  <option value="info">Info</option>
                  <option value="warning">Warning</option>
                  <option value="error">Error</option>
                </select>
                <button onClick={() => void loadAudit()} className="rounded-lg border border-[#242D37] px-3 py-2 text-sm text-[#C9D4E0] hover:border-[#9BFF00]/40 hover:text-[#9BFF00] hover:bg-[#9BFF00]/5 transition duration-150 active:scale-95">Filter</button>
              </div>
            </div>

            <div className="mt-4 max-h-[460px] space-y-2 overflow-auto pr-1">
              {auditLogs?.items.map((item) => (
                <div key={item.id} className="rounded-xl border border-[#27384D] bg-[#0F1D2F] p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-medium">{item.action}</p>
                    <span className={`rounded-full px-2 py-1 text-xs ${item.severity === "warning" ? "bg-[#44212A] text-[#FFB7C7]" : item.severity === "error" ? "bg-[#4E1E1E] text-[#FFB8B8]" : "bg-[#17314A] text-[#B5D8FF]"}`}>{item.severity}</span>
                  </div>
                  <p className="mt-1 text-xs text-[#8CA7C8]">{item.target_type} #{item.target_id ?? "n/a"} | actor {item.actor_user_id ?? "system"}</p>
                  <p className="mt-1 text-xs text-[#728CAA]">{formatDate(item.created_at)}</p>
                </div>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}