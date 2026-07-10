"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

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
        api.get<DashboardSummary>("/dashboard/summary", { skipAuthRedirect: true }),
        api.get<Trade[]>("/trades/me", { skipAuthRedirect: true }),
        api.get<DashboardOverview>("/dashboard/overview", { skipAuthRedirect: true }),
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
      const balanceRes = await api.get<BrokerBalance>("/broker/balance", { skipAuthRedirect: true });
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

      if (profileRes.data.role === "admin") {
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
    <main className="min-h-screen bg-gray-50 dark:bg-[#030507] text-gray-900 dark:text-[#E8ECEF]">
      <div className="mx-auto w-full max-w-[1320px] px-4 py-5 sm:px-6 lg:px-8">
        <header className="rounded-2xl border border-gray-200 dark:border-[#1B222B] bg-white dark:bg-[#06090E] px-5 py-4">
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-[30px] font-semibold text-gray-900 dark:text-[#F3F7FB]">Hello, {displayName}</h1>

            <div className="flex items-center gap-2">
              <button className="rounded-lg border border-gray-200 dark:border-[#27313D] px-3 py-1.5 text-xs text-gray-500 dark:text-[#A8B3BF]">Select Dates</button>
              <div className="flex items-center rounded-lg border border-gray-200 dark:border-[#27313D] bg-gray-100 dark:bg-[#090D13] p-1 text-xs text-gray-500 dark:text-[#94A1AE]">
                <button className="rounded px-2 py-1 hover:text-gray-700 dark:hover:text-[#E4EBF3]">1D</button>
                <button className="rounded px-2 py-1 hover:text-gray-700 dark:hover:text-[#E4EBF3]">1W</button>
                <button className="rounded px-2 py-1 hover:text-gray-700 dark:hover:text-[#E4EBF3]">1M</button>
                <button className="rounded px-2 py-1 hover:text-gray-700 dark:hover:text-[#E4EBF3]">1Y</button>
                <button className="rounded bg-[#9BFF00] px-2 py-1 font-semibold text-[#11140D]">All</button>
              </div>
            </div>
          </div>
        </header>

        {loading ? (
          <p className="mt-5 rounded-xl border border-gray-200 dark:border-[#1A1E23] bg-white dark:bg-[#090B0F] px-5 py-8 text-gray-500 dark:text-[#9AA5B1]">Loading dashboard...</p>
        ) : (
          <div className="mt-5 space-y-4">
            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <article className="rounded-2xl border border-gray-200 dark:border-[#1A212A] bg-white dark:bg-[#070A10] p-4">
                <p className="text-xs font-medium uppercase tracking-[0.08em] text-gray-500 dark:text-[#8995A3]">Estimated Balance</p>
                <p className="mt-3 text-[32px] font-semibold text-gray-900 dark:text-[#F0F5FA]">{formatCurrency(balanceValue)}</p>
                <p className="text-xs text-gray-400 dark:text-[#7C8794]">Across 1 exchange</p>
              </article>

              <article className="rounded-2xl border border-gray-200 dark:border-[#1A212A] bg-white dark:bg-[#070A10] p-4">
                <p className="text-xs font-medium uppercase tracking-[0.08em] text-gray-500 dark:text-[#8995A3]">Open Position</p>
                <p className="mt-3 text-[32px] font-semibold text-gray-900 dark:text-[#F0F5FA]">{overview?.open_positions.length ?? 0}</p>
                <p className="text-xs text-gray-400 dark:text-[#7C8794]">Across exchange</p>
              </article>

              <article className="rounded-2xl border border-gray-200 dark:border-[#1A212A] bg-white dark:bg-[#070A10] p-4">
                <p className="text-xs font-medium uppercase tracking-[0.08em] text-gray-500 dark:text-[#8995A3]">P&L</p>
                <p className="mt-3 text-[32px] font-semibold text-gray-900 dark:text-[#F0F5FA]">{formatCurrency(pnlValue)}</p>
                <p className="text-xs text-gray-400 dark:text-[#7C8794]">All time</p>
              </article>

              <article className="rounded-2xl border border-gray-200 dark:border-[#1A212A] bg-white dark:bg-[#070A10] p-4">
                <p className="text-xs font-medium uppercase tracking-[0.08em] text-gray-500 dark:text-[#8995A3]">Win Rate</p>
                <p className="mt-3 text-[32px] font-semibold text-gray-900 dark:text-[#F0F5FA]">{winRate.toFixed(2)}%</p>
                <p className="text-xs text-gray-400 dark:text-[#7C8794]">All Closed Trades</p>
              </article>
            </section>

            <section className="grid gap-4 xl:grid-cols-[1.65fr_0.55fr]">
              <div className="rounded-2xl border border-gray-200 dark:border-[#1A212A] bg-white dark:bg-[#070A10] p-4">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-[#F3F7FB]">Portfolio Performance</h2>
                  <div className="flex items-center rounded-lg border border-gray-200 dark:border-[#27313D] bg-gray-100 dark:bg-[#090D13] p-1 text-xs text-gray-500 dark:text-[#94A1AE]">
                    <button className="rounded bg-gray-200 dark:bg-[#232A35] px-2 py-1 text-gray-700 dark:text-[#E4EBF3]">P&L</button>
                    <button className="rounded px-2 py-1">ROI</button>
                  </div>
                </div>

                <div className="relative h-[300px] overflow-hidden rounded-xl border border-gray-200 dark:border-[#1F2630] bg-gray-100 dark:bg-[linear-gradient(180deg,#070B12,#05080D)]">
                  <div className="absolute inset-0" />
                  <svg viewBox="0 0 720 300" className="absolute inset-0 h-full w-full">
                    <polyline
                      fill="none"
                      stroke="#4A5A73"
                      strokeWidth="2.5"
                      points="20,250 80,210 130,230 190,190 250,170 310,130 360,155 420,118 480,92 540,102 600,70 680,48"
                    />
                  </svg>
                </div>
              </div>

              <aside className="rounded-2xl border border-gray-200 dark:border-[#1A212A] bg-white dark:bg-[#070A10] p-4">
                <p className="mt-24 text-center text-sm text-gray-500 dark:text-[#95A2B1]">You haven&apos;t mirrored any strategies yet</p>
                <button 
                  onClick={() => router.push("/dashboard/strategies")}
                  className="mx-auto mt-4 block rounded-full bg-[#9BFF00] px-5 py-2 text-sm font-semibold text-[#11140D] hover:bg-[#B7FF45]"
                >
                  Explore Strategies
                </button>
              </aside>
            </section>

            <section className="grid gap-4 xl:grid-cols-[1.1fr_1fr_0.7fr]">
              <div className="rounded-2xl border border-gray-200 dark:border-[#1A212A] bg-white dark:bg-[#0A101A] p-4">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-[#DDE5EE]">Asset Allocation</h3>
                <div className="mt-5 flex items-center gap-4">
                  <div className="relative h-36 w-36 rounded-full bg-[conic-gradient(#d1d5db_0_65%,#e5e7eb_65%_100%)] dark:bg-[conic-gradient(#2D3646_0_65%,#1D2431_65%_100%)]">
                    <div className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white dark:bg-[#0A101A]" />
                  </div>
                  <p className="text-sm text-gray-400 dark:text-[#7F8B98]">No allocation data yet</p>
                </div>
              </div>

              <div className="rounded-2xl border border-gray-200 dark:border-[#1A212A] bg-white dark:bg-[#070A10] p-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400 dark:text-[#7E8B98]">Average gain</p>
                    <p className="mt-1 font-semibold text-[#15D68A]">{formatCurrency(avgGain)}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 dark:text-[#7E8B98]">Average loss</p>
                    <p className="mt-1 font-semibold text-[#FF6666]">{formatCurrency(avgLoss)}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 dark:text-[#7E8B98]">Big Win</p>
                    <p className="mt-1 font-semibold text-[#15D68A]">{formatCurrency(Math.max(bestTradePnl, 0))}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 dark:text-[#7E8B98]">Big Loss</p>
                    <p className="mt-1 font-semibold text-[#FF6666]">{formatCurrency(Math.min(worstTradePnl, 0))}</p>
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

              <div className="rounded-2xl border border-gray-200 dark:border-[#1A212A] bg-white dark:bg-[#070A10] p-4">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-[#DDE5EE]">ROI</h3>
                <p className="mt-2 text-xl font-semibold text-gray-900 dark:text-[#F2F7FC]">{formatCurrency(pnlValue)}</p>
                <p className="text-xs text-gray-400 dark:text-[#7F8B98]">vs last month</p>
                <div className="mt-3 h-14 rounded-lg border border-gray-200 dark:border-[#242C37] bg-gray-100 dark:bg-[#0A0E14] p-1">
                  <svg viewBox="0 0 120 40" className="h-full w-full">
                    <polyline fill="none" stroke="#9ca3af" className="dark:stroke-[#4A5A73]" strokeWidth="2" points="0,30 18,20 36,24 54,15 72,19 90,8 120,12" />
                  </svg>
                </div>
                <div className="mt-3 space-y-2 text-xs">
                  <div className="flex items-center justify-between"><span className="text-gray-400 dark:text-[#7F8B98]">Win Rate (%)</span><span className="text-gray-700 dark:text-[#E6EDF4]">{winRate}%</span></div>
                  <div className="h-1.5 rounded-full bg-red-100 dark:bg-[#2B1111]"><div className="h-full rounded-full bg-[#FB4141]" style={{ width: `${Math.min(Math.max(winRate, 0), 100)}%` }} /></div>
                  <div className="flex items-center justify-between"><span className="text-[#15D68A]">Profitable Trades {totalWinners}</span><span className="text-[#FF6666]">Losing Trades {totalLosers}</span></div>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-gray-200 dark:border-[#1A212A] bg-white dark:bg-[#070A10] p-4">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-[#DDE5EE]">Avg Holding Time</h3>
              <div className="mt-3 grid gap-3 sm:grid-cols-4 text-sm">
                <div className="rounded-lg border border-gray-200 dark:border-[#242C37] bg-gray-50 dark:bg-[#0A0F16] px-3 py-2">
                  <p className="text-gray-400 dark:text-[#7F8B98]">Winners</p>
                  <p className="mt-1 font-semibold text-[#15D68A]">--</p>
                </div>
                <div className="rounded-lg border border-gray-200 dark:border-[#242C37] bg-gray-50 dark:bg-[#0A0F16] px-3 py-2">
                  <p className="text-gray-400 dark:text-[#7F8B98]">Losers</p>
                  <p className="mt-1 font-semibold text-[#FF6666]">--</p>
                </div>
                <div className="rounded-lg border border-gray-200 dark:border-[#242C37] bg-gray-50 dark:bg-[#0A0F16] px-3 py-2">
                  <p className="text-gray-400 dark:text-[#7F8B98]">Biggest Win</p>
                  <p className="mt-1 font-semibold text-gray-700 dark:text-[#E6EDF4]">{formatCurrency(Math.max(bestTradePnl, 0))}</p>
                </div>
                <div className="rounded-lg border border-gray-200 dark:border-[#242C37] bg-gray-50 dark:bg-[#0A0F16] px-3 py-2">
                  <p className="text-gray-400 dark:text-[#7F8B98]">Biggest Loss</p>
                  <p className="mt-1 font-semibold text-gray-700 dark:text-[#E6EDF4]">{formatCurrency(Math.min(worstTradePnl, 0))}</p>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-gray-200 dark:border-[#1A212A] bg-white dark:bg-[#070A10] p-4">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-[#DDE5EE]">Trade History</h3>
                <button
                  onClick={() => {
                    void loadData();
                    void loadExtras();
                  }}
                  className="rounded-lg bg-[#9BFF00] px-3 py-1.5 text-xs font-semibold text-[#11140D]"
                >
                  Refresh
                </button>
              </div>

              <div className="mb-3 flex flex-wrap items-center gap-2 text-xs">
                <button className="rounded-full border border-gray-200 dark:border-[#26303A] px-3 py-1.5 text-gray-500 dark:text-[#A3AFBD]">Symbol</button>
                <button className="rounded-full border border-gray-200 dark:border-[#26303A] px-3 py-1.5 text-gray-500 dark:text-[#A3AFBD]">All</button>
                <button className="rounded-full border border-gray-200 dark:border-[#26303A] px-3 py-1.5 text-gray-500 dark:text-[#A3AFBD]">Source</button>
                <button className="rounded-full border border-gray-200 dark:border-[#26303A] px-3 py-1.5 text-gray-500 dark:text-[#A3AFBD]">Select Dates</button>
              </div>

              <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-[#212934]">
                <div className="grid grid-cols-7 border-b border-gray-200 dark:border-[#212934] bg-gray-100 dark:bg-[#0A0F16] px-3 py-2 text-[11px] uppercase tracking-[0.08em] text-gray-500 dark:text-[#778493]">
                  <span>Symbol</span>
                  <span>Side</span>
                  <span>Qty</span>
                  <span>Entry Price</span>
                  <span>P&L</span>
                  <span>Status</span>
                  <span>Source</span>
                </div>

                {trades.length > 0 ? (
                  <div className="divide-y divide-gray-100 dark:divide-[#1D2530]">
                    {trades.slice(0, 8).map((trade) => (
                      <div key={trade.id} className="grid grid-cols-7 px-3 py-3 text-sm text-gray-700 dark:text-[#C9D4E0]">
                        <span>{trade.symbol}</span>
                        <span>{trade.side}</span>
                        <span>{trade.quantity}</span>
                        <span>{trade.price}</span>
                        <span className={Number(trade.pnl) >= 0 ? "text-[#15D68A]" : "text-[#FF6666]"}>{trade.pnl}</span>
                        <span>{trade.status}</span>
                        <span>{trade.broker}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex h-64 flex-col items-center justify-center bg-gray-50 dark:bg-[#060A10] text-center">
                    <div className="mb-4 h-20 w-20 rounded-full border border-gray-200 dark:border-[#27303A]" />
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
