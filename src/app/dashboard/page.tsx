"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Wallet, Activity, TrendingUp, Target, ChevronRight, RefreshCw } from "lucide-react";

import { api } from "@/lib/api";
import { clearTokens, getAccessToken, isDemoSession } from "@/lib/auth";
import { extractApiErrorMessage } from "@/lib/errors";
import type { BrokerBalance, DashboardOverview, DashboardSummary, Trade, UserProfile } from "@/lib/types";

const initialSummary: DashboardSummary = {
  total_trades: 0,
  cumulative_pnl: "0",
  winning_trades: 0,
  losing_trades: 0,
};

export default function DashboardPage() {
  const router = useRouter();
  const [summary, setSummary] = useState<DashboardSummary>(initialSummary);
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [brokerBalance, setBrokerBalance] = useState<BrokerBalance | null>(null);
  const [displayName, setDisplayName] = useState("Trader");

  const loadData = async () => {
    if (isDemoSession()) {
      setSummary({
        total_trades: 24,
        cumulative_pnl: "1842.35",
        winning_trades: 17,
        losing_trades: 7,
      });
      setTrades([
        {
          id: 1,
          user_id: 1,
          symbol: "BTCUSDT",
          side: "BUY",
          quantity: "0.25",
          price: "62840.00",
          order_type: "MARKET",
          status: "CLOSED",
          pnl: "420.50",
          broker_order_id: "demo-1",
          broker: "Demo",
          created_at: new Date().toISOString(),
        },
        {
          id: 2,
          user_id: 1,
          symbol: "ETHUSDT",
          side: "SELL",
          quantity: "1.5",
          price: "3180.00",
          order_type: "LIMIT",
          status: "CLOSED",
          pnl: "-95.20",
          broker_order_id: "demo-2",
          broker: "Demo",
          created_at: new Date().toISOString(),
        },
        {
          id: 3,
          user_id: 1,
          symbol: "SOLUSDT",
          side: "BUY",
          quantity: "12",
          price: "142.35",
          order_type: "MARKET",
          status: "OPEN",
          pnl: "188.10",
          broker_order_id: "demo-3",
          broker: "Demo",
          created_at: new Date().toISOString(),
        },
      ]);
      setOverview({
        pnl: {
          daily: "214.20",
          weekly: "784.60",
          total: "1842.35",
        },
        win_rate: "70.83",
        trade_history_count: 24,
        open_positions: [
          {
            symbol: "SOLUSDT",
            quantity: "12",
            avg_entry_price: "142.35",
            unrealized_pnl: "188.10",
          },
        ],
        strategy_performance: [],
        updated_at: new Date().toISOString(),
      });
      setBrokerBalance({
        broker: "Demo",
        balance: "12580.45",
        currency: "USD",
        available_balance: "10920.15",
      });
      setDisplayName("Demo Trader");
      setLoading(false);
      return;
    }

    try {
      const [summaryRes, tradesRes, overviewRes] = await Promise.all([
        api.get<DashboardSummary>("/dashboard/summary", { skipAuthRedirect: true } as any),
        api.get<Trade[]>("/trades/me", { skipAuthRedirect: true } as any),
        api.get<DashboardOverview>("/dashboard/overview", { skipAuthRedirect: true } as any),
      ]);
      setSummary(summaryRes.data);
      setTrades(tradesRes.data);
      setOverview(overviewRes.data);
    } catch (error: unknown) {
      extractApiErrorMessage(error, "");
    } finally {
      setLoading(false);
    }
  };

  const loadExtras = async () => {
    if (isDemoSession()) return;

    try {
      const balanceRes = await api.get<BrokerBalance>("/broker/balance", { skipAuthRedirect: true } as any);
      setBrokerBalance(balanceRes.data);
    } catch {
      // Optional card values can stay in fallback state.
    }
  };

  const loadCurrentUser = async () => {
    if (isDemoSession()) return;

    try {
      const profileRes = await api.get<UserProfile>("/auth/me");
      const fullName = profileRes.data.full_name?.trim();

      const viewMode = typeof window !== "undefined" ? sessionStorage.getItem("viewMode") : null;
      if (profileRes.data.role === "admin" && viewMode !== "trader") {
        router.replace("/dashboard/admin");
        return;
      }

      if (fullName) {
        setDisplayName(fullName);
      }
    } catch (error: unknown) {
      const status =
        typeof error === "object" && error && "response" in error
          ? ((error as { response?: { status?: unknown } }).response?.status as number | undefined)
          : undefined;
      if (status === 401) {
        clearTokens();
        router.push("/login");
      }
    }
  };

  useEffect(() => {
    if (!getAccessToken()) {
      router.push("/login");
      return;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadData();
    void loadExtras();
    void loadCurrentUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  const winRate =
    summary.total_trades > 0 ? Math.round((summary.winning_trades / summary.total_trades) * 100) : 0;

  const balanceValue = useMemo(() => {
    const raw = brokerBalance?.balance ?? "0";
    const parsed = Number(raw);
    return Number.isFinite(parsed) ? parsed : 0;
  }, [brokerBalance?.balance]);

  const pnlValue = useMemo(() => {
    const parsed = Number(summary.cumulative_pnl || "0");
    return Number.isFinite(parsed) ? parsed : 0;
  }, [summary.cumulative_pnl]);

  const avgGain = trades.length > 0 ? Math.max(pnlValue / Math.max(trades.length, 1), 0) : 0;
  const avgLoss = trades.length > 0 ? Math.min(pnlValue / Math.max(trades.length, 1), 0) : 0;

  const totalWinners = summary.winning_trades;
  const totalLosers = summary.losing_trades;

  const bestTradePnl = useMemo(() => {
    if (trades.length === 0) return 0;
    return Math.max(...trades.map((trade) => Number(trade.pnl || 0)));
  }, [trades]);

  const worstTradePnl = useMemo(() => {
    if (trades.length === 0) return 0;
    return Math.min(...trades.map((trade) => Number(trade.pnl || 0)));
  }, [trades]);

  const formatCurrency = (value: number) => `$${value.toFixed(2)}`;

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-[#05070B] text-gray-900 dark:text-[#E8ECEF]">
      <div className="mx-auto w-full max-w-[1320px] px-4 py-5 sm:px-6 lg:px-8">
        <header className="rounded-2xl border border-gray-200 dark:border-white/[0.06] bg-white dark:bg-gradient-to-r dark:from-[#0D1119] dark:to-[#0B0F17] px-5 py-4">
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs text-gray-400 dark:text-[#6B7684]">Welcome back</p>
              <h1 className="text-[30px] font-bold text-gray-900 dark:text-white">{displayName}</h1>
            </div>

            <div className="flex items-center gap-2">
              <button className="rounded-lg border border-gray-200 dark:border-white/10 bg-transparent dark:bg-white/[0.03] px-3 py-1.5 text-xs text-gray-500 dark:text-[#A8B3BF] hover:dark:border-cyan-400/30 hover:dark:text-cyan-300 transition-colors">Select Dates</button>
              <div className="flex items-center rounded-lg border border-gray-200 dark:border-white/10 bg-gray-100 dark:bg-white/[0.03] p-1 text-xs text-gray-500 dark:text-[#94A1AE]">
                <button className="rounded px-2 py-1 hover:text-gray-700 dark:hover:text-[#E4EBF3]">1D</button>
                <button className="rounded px-2 py-1 hover:text-gray-700 dark:hover:text-[#E4EBF3]">1W</button>
                <button className="rounded px-2 py-1 hover:text-gray-700 dark:hover:text-[#E4EBF3]">1M</button>
                <button className="rounded px-2 py-1 hover:text-gray-700 dark:hover:text-[#E4EBF3]">1Y</button>
                <button className="rounded bg-gradient-to-r from-cyan-400 to-blue-500 px-2 py-1 font-bold text-black">All</button>
              </div>
            </div>
          </div>
        </header>

        {loading ? (
          <p className="mt-5 rounded-xl border border-gray-200 dark:border-white/[0.06] bg-white dark:bg-[#0A0D13] px-5 py-8 text-gray-500 dark:text-[#9AA5B1]">Loading dashboard...</p>
        ) : (
          <div className="mt-5 space-y-4">
            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <article className="group relative overflow-hidden rounded-2xl border border-gray-200 dark:border-white/[0.06] bg-white dark:bg-[#0B0F17] p-4 transition-colors dark:hover:border-white/[0.12]">
                <div className="absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100 dark:[background:radial-gradient(120px_circle_at_20%_0%,rgba(34,211,238,0.08),transparent_70%)]" />
                <div className="relative flex items-start justify-between">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.08em] text-gray-500 dark:text-[#8995A3]">Estimated Balance</p>
                    <p className="mt-3 text-[32px] font-bold text-gray-900 dark:text-white tabular-nums">{formatCurrency(balanceValue)}</p>
                    <p className="text-xs text-gray-400 dark:text-[#7C8794]">Across 1 exchange</p>
                  </div>
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-400/10 text-cyan-300">
                    <Wallet size={16} />
                  </div>
                </div>
              </article>

              <article className="group relative overflow-hidden rounded-2xl border border-gray-200 dark:border-white/[0.06] bg-white dark:bg-[#0B0F17] p-4 transition-colors dark:hover:border-white/[0.12]">
                <div className="absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100 dark:[background:radial-gradient(120px_circle_at_20%_0%,rgba(129,140,248,0.08),transparent_70%)]" />
                <div className="relative flex items-start justify-between">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.08em] text-gray-500 dark:text-[#8995A3]">Open Position</p>
                    <p className="mt-3 text-[32px] font-bold text-gray-900 dark:text-white tabular-nums">{overview?.open_positions.length ?? 0}</p>
                    <p className="text-xs text-gray-400 dark:text-[#7C8794]">Across exchange</p>
                  </div>
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-400/10 text-indigo-300">
                    <Activity size={16} />
                  </div>
                </div>
              </article>

              <article className="group relative overflow-hidden rounded-2xl border border-gray-200 dark:border-white/[0.06] bg-white dark:bg-[#0B0F17] p-4 transition-colors dark:hover:border-white/[0.12]">
                <div className="absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100 dark:[background:radial-gradient(120px_circle_at_20%_0%,rgba(52,211,153,0.08),transparent_70%)]" />
                <div className="relative flex items-start justify-between">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.08em] text-gray-500 dark:text-[#8995A3]">P&L</p>
                    <p className="mt-3 text-[32px] font-bold text-gray-900 dark:text-white tabular-nums">{formatCurrency(pnlValue)}</p>
                    <p className="text-xs text-gray-400 dark:text-[#7C8794]">All time</p>
                  </div>
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-400/10 text-emerald-300">
                    <TrendingUp size={16} />
                  </div>
                </div>
              </article>

              <article className="group relative overflow-hidden rounded-2xl border border-gray-200 dark:border-white/[0.06] bg-white dark:bg-[#0B0F17] p-4 transition-colors dark:hover:border-white/[0.12]">
                <div className="absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100 dark:[background:radial-gradient(120px_circle_at_20%_0%,rgba(244,114,182,0.08),transparent_70%)]" />
                <div className="relative flex items-start justify-between">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.08em] text-gray-500 dark:text-[#8995A3]">Win Rate</p>
                    <p className="mt-3 text-[32px] font-bold text-gray-900 dark:text-white tabular-nums">{winRate.toFixed(2)}%</p>
                    <p className="text-xs text-gray-400 dark:text-[#7C8794]">All Closed Trades</p>
                  </div>
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-pink-400/10 text-pink-300">
                    <Target size={16} />
                  </div>
                </div>
              </article>
            </section>

            <section className="grid gap-4 xl:grid-cols-[1.65fr_0.55fr]">
              <div className="rounded-2xl border border-gray-200 dark:border-white/[0.06] bg-white dark:bg-[#0B0F17] p-4">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">Portfolio Performance</h2>
                  <div className="flex items-center rounded-lg border border-gray-200 dark:border-white/10 bg-gray-100 dark:bg-white/[0.03] p-1 text-xs text-gray-500 dark:text-[#94A1AE]">
                    <button className="rounded bg-gray-200 dark:bg-white/10 px-2 py-1 text-gray-700 dark:text-white">P&L</button>
                    <button className="rounded px-2 py-1">ROI</button>
                  </div>
                </div>

                <div className="relative h-[300px] overflow-hidden rounded-xl border border-gray-200 dark:border-white/[0.05] bg-gray-100 dark:bg-[#0A0E14] dark:bg-gradient-to-b dark:from-cyan-500/[0.04] dark:to-transparent">
                  <svg viewBox="0 0 720 300" className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="dashFillGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#22D3EE" stopOpacity="0.35" />
                        <stop offset="100%" stopColor="#22D3EE" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M20,250 L80,210 L130,230 L190,190 L250,170 L310,130 L360,155 L420,118 L480,92 L540,102 L600,70 L680,48 L680,300 L20,300 Z"
                      fill="url(#dashFillGrad)"
                      className="hidden dark:block"
                    />
                    <polyline
                      fill="none"
                      stroke="#22D3EE"
                      className="dark:stroke-[#22D3EE] stroke-[#4A5A73]"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      points="20,250 80,210 130,230 190,190 250,170 310,130 360,155 420,118 480,92 540,102 600,70 680,48"
                    />
                  </svg>
                </div>
              </div>

              <aside className="flex flex-col items-center justify-center rounded-2xl border border-gray-200 dark:border-white/[0.06] bg-white dark:bg-[#0B0F17] p-4 text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-cyan-400/10 text-cyan-300">
                  <TrendingUp size={22} />
                </div>
                <p className="text-sm text-gray-500 dark:text-[#95A2B1]">You haven&apos;t mirrored any strategies yet</p>
                <button
                  onClick={() => router.push("/dashboard/strategies")}
                  className="mx-auto mt-4 flex items-center gap-1 rounded-lg bg-gradient-to-r from-cyan-400 to-blue-500 px-5 py-2.5 text-sm font-bold text-black shadow-[0_0_20px_rgba(34,211,238,0.3)] hover:shadow-[0_0_28px_rgba(34,211,238,0.5)] transition-shadow"
                >
                  Explore Strategies
                  <ChevronRight size={16} />
                </button>
              </aside>
            </section>

            <section className="grid gap-4 xl:grid-cols-[1.1fr_1fr_0.7fr]">
              <div className="rounded-2xl border border-gray-200 dark:border-white/[0.06] bg-white dark:bg-[#0B0F17] p-4">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-[#DDE5EE]">Asset Allocation</h3>
                <div className="mt-5 flex items-center gap-4">
                  <div className="relative h-36 w-36 rounded-full bg-[conic-gradient(#d1d5db_0_65%,#e5e7eb_65%_100%)] dark:bg-[conic-gradient(#1E2A38_0_65%,#141B26_65%_100%)]">
                    <div className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white dark:bg-[#0B0F17]" />
                  </div>
                  <p className="text-sm text-gray-400 dark:text-[#7F8B98]">No allocation data yet</p>
                </div>
              </div>

              <div className="rounded-2xl border border-gray-200 dark:border-white/[0.06] bg-white dark:bg-[#0B0F17] p-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400 dark:text-[#7E8B98]">Average gain</p>
                    <p className="mt-1 font-semibold text-emerald-400">{formatCurrency(avgGain)}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 dark:text-[#7E8B98]">Average loss</p>
                    <p className="mt-1 font-semibold text-rose-400">{formatCurrency(avgLoss)}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 dark:text-[#7E8B98]">Big Win</p>
                    <p className="mt-1 font-semibold text-emerald-400">{formatCurrency(Math.max(bestTradePnl, 0))}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 dark:text-[#7E8B98]">Big Loss</p>
                    <p className="mt-1 font-semibold text-rose-400">{formatCurrency(Math.min(worstTradePnl, 0))}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 dark:text-[#7E8B98]">Risk / Reward Ratio</p>
                    <p className="mt-1 font-semibold text-gray-700 dark:text-[#E8EEF6]">--</p>
                  </div>
                  <div>
                    <p className="text-gray-400 dark:text-[#7E8B98]">Max Drawdown</p>
                    <p className="mt-1 font-semibold text-gray-700 dark:text-[#E8EEF6]">0%</p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-gray-200 dark:border-white/[0.06] bg-white dark:bg-[#0B0F17] p-4">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-[#DDE5EE]">ROI</h3>
                <p className="mt-2 text-xl font-bold text-gray-900 dark:text-white">{formatCurrency(pnlValue)}</p>
                <p className="text-xs text-gray-400 dark:text-[#7F8B98]">vs last month</p>
                <div className="mt-3 h-14 rounded-lg border border-gray-200 dark:border-white/[0.06] bg-gray-100 dark:bg-white/[0.02] p-1">
                  <svg viewBox="0 0 120 40" className="h-full w-full">
                    <polyline fill="none" stroke="#9ca3af" className="dark:stroke-cyan-400" strokeWidth="2" points="0,30 18,20 36,24 54,15 72,19 90,8 120,12" />
                  </svg>
                </div>
                <div className="mt-3 space-y-2 text-xs">
                  <div className="flex items-center justify-between"><span className="text-gray-400 dark:text-[#7F8B98]">Win Rate (%)</span><span className="text-gray-700 dark:text-[#E6EDF4]">{winRate}%</span></div>
                  <div className="h-1.5 rounded-full bg-red-100 dark:bg-white/[0.06]"><div className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500" style={{ width: `${Math.min(Math.max(winRate, 0), 100)}%` }} /></div>
                  <div className="flex items-center justify-between"><span className="text-emerald-400">Profitable Trades {totalWinners}</span><span className="text-rose-400">Losing Trades {totalLosers}</span></div>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-gray-200 dark:border-white/[0.06] bg-white dark:bg-[#0B0F17] p-4">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-[#DDE5EE]">Avg Holding Time</h3>
              <div className="mt-3 grid gap-3 sm:grid-cols-4 text-sm">
                <div className="rounded-lg border border-gray-200 dark:border-white/[0.06] bg-gray-50 dark:bg-white/[0.02] px-3 py-2">
                  <p className="text-gray-400 dark:text-[#7F8B98]">Winners</p>
                  <p className="mt-1 font-semibold text-emerald-400">--</p>
                </div>
                <div className="rounded-lg border border-gray-200 dark:border-white/[0.06] bg-gray-50 dark:bg-white/[0.02] px-3 py-2">
                  <p className="text-gray-400 dark:text-[#7F8B98]">Losers</p>
                  <p className="mt-1 font-semibold text-rose-400">--</p>
                </div>
                <div className="rounded-lg border border-gray-200 dark:border-white/[0.06] bg-gray-50 dark:bg-white/[0.02] px-3 py-2">
                  <p className="text-gray-400 dark:text-[#7F8B98]">Biggest Win</p>
                  <p className="mt-1 font-semibold text-gray-700 dark:text-[#E6EDF4]">{formatCurrency(Math.max(bestTradePnl, 0))}</p>
                </div>
                <div className="rounded-lg border border-gray-200 dark:border-white/[0.06] bg-gray-50 dark:bg-white/[0.02] px-3 py-2">
                  <p className="text-gray-400 dark:text-[#7F8B98]">Biggest Loss</p>
                  <p className="mt-1 font-semibold text-gray-700 dark:text-[#E6EDF4]">{formatCurrency(Math.min(worstTradePnl, 0))}</p>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-gray-200 dark:border-white/[0.06] bg-white dark:bg-[#0B0F17] p-4">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-[#DDE5EE]">Trade History</h3>
                <button
                  onClick={() => {
                    void loadData();
                    void loadExtras();
                  }}
                  className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-cyan-400 to-blue-500 px-3 py-1.5 text-xs font-bold text-black"
                >
                  <RefreshCw size={12} />
                  Refresh
                </button>
              </div>

              <div className="mb-3 flex flex-wrap items-center gap-2 text-xs">
                <button className="rounded-full border border-gray-200 dark:border-white/10 px-3 py-1.5 text-gray-500 dark:text-[#A3AFBD] hover:dark:border-cyan-400/30 hover:dark:text-cyan-300 transition-colors">Symbol</button>
                <button className="rounded-full border border-gray-200 dark:border-white/10 px-3 py-1.5 text-gray-500 dark:text-[#A3AFBD] hover:dark:border-cyan-400/30 hover:dark:text-cyan-300 transition-colors">All</button>
                <button className="rounded-full border border-gray-200 dark:border-white/10 px-3 py-1.5 text-gray-500 dark:text-[#A3AFBD] hover:dark:border-cyan-400/30 hover:dark:text-cyan-300 transition-colors">Source</button>
                <button className="rounded-full border border-gray-200 dark:border-white/10 px-3 py-1.5 text-gray-500 dark:text-[#A3AFBD] hover:dark:border-cyan-400/30 hover:dark:text-cyan-300 transition-colors">Select Dates</button>
              </div>

              <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-white/[0.06]">
                <div className="grid grid-cols-7 border-b border-gray-200 dark:border-white/[0.06] bg-gray-100 dark:bg-white/[0.02] px-3 py-2 text-[11px] uppercase tracking-[0.08em] text-gray-500 dark:text-[#778493]">
                  <span>Symbol</span>
                  <span>Side</span>
                  <span>Qty</span>
                  <span>Entry Price</span>
                  <span>P&L</span>
                  <span>Status</span>
                  <span>Source</span>
                </div>

                {trades.length > 0 ? (
                  <div className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                    {trades.slice(0, 8).map((trade) => (
                      <div key={trade.id} className="grid grid-cols-7 px-3 py-3 text-sm text-gray-700 dark:text-[#C9D4E0]">
                        <span>{trade.symbol}</span>
                        <span>{trade.side}</span>
                        <span>{trade.quantity}</span>
                        <span>{trade.price}</span>
                        <span className={Number(trade.pnl) >= 0 ? "text-emerald-400" : "text-rose-400"}>{trade.pnl}</span>
                        <span>{trade.status}</span>
                        <span>{trade.broker}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex h-64 flex-col items-center justify-center bg-gray-50 dark:bg-white/[0.02] text-center">
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-gray-200 dark:border-white/10 text-gray-400 dark:text-white/30">
                      <Activity size={22} />
                    </div>
                    <p className="text-lg font-semibold text-gray-700 dark:text-[#E7EEF6]">You have no open trades!</p>
                    <p className="text-sm text-gray-400 dark:text-[#7F8B98]">Open trades will appear here.</p>
                  </div>
                )}
              </div>
            </section>
          </div>
        )}
      </div>
    </main>
  );
}