"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { api } from "@/lib/api";
import { clearTokens, getAccessToken } from "@/lib/auth";
import { extractApiErrorMessage } from "@/lib/errors";
import type { BacktestRun, BacktestRunRequest } from "@/lib/types";

const DEFAULT_REQUEST: BacktestRunRequest = {
  strategy_tag: "momentum-v1",
  symbol: "BTCUSDT",
  timeframe: "1h",
  periods: 240,
  initial_capital: 1000,
};

export default function BacktestingPage() {
  const router = useRouter();
  const [form, setForm] = useState<BacktestRunRequest>(DEFAULT_REQUEST);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<BacktestRun | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!getAccessToken()) {
      router.push("/login");
    }
  }, [router]);

  const onLogout = () => {
    clearTokens();
    router.push("/login");
  };

  const runBacktest = async () => {
    setRunning(true);
    setError(null);
    try {
      const res = await api.post<BacktestRun>("/backtesting/run", form);
      setResult(res.data);
    } catch (err: unknown) {
      setError(extractApiErrorMessage(err, "Backtest failed."));
    } finally {
      setRunning(false);
    }
  };

  type BacktestReport = { wins: number; losses: number; final_capital: number | string };
  const isBacktestReport = (value: unknown): value is BacktestReport => {
    if (!value || typeof value !== "object") return false;
    const v = value as Record<string, unknown>;
    return typeof v.wins === "number" && typeof v.losses === "number" && (typeof v.final_capital === "number" || typeof v.final_capital === "string");
  };

  let report: BacktestReport | null = null;
  try {
    const parsed = result ? (JSON.parse(result.report_json) as unknown) : null;
    report = isBacktestReport(parsed) ? parsed : null;
  } catch {
    report = null;
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-[#050607] text-gray-900 dark:text-[#E8ECEF]">
      <div className="mx-auto w-full max-w-[980px] px-4 py-6 sm:px-6">
        <header className="mb-6 flex items-center justify-between rounded-2xl border border-gray-200 dark:border-[#1A1E23] bg-white dark:bg-[#090B0F] px-5 py-4">
          <div>
            <p className="text-xs uppercase tracking-[0.14em] text-gray-500 dark:text-[#8B95A1]">Backtesting</p>
            <h1 className="mt-1 text-2xl font-semibold text-gray-900 dark:text-[#F6FAFF]">Strategy Simulation</h1>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => router.push("/dashboard")} className="rounded-lg border border-[#242D37] px-3 py-2 text-sm text-[#C9D4E0] hover:border-[#9BFF00]/40 hover:text-[#9BFF00] hover:bg-[#9BFF00]/5 transition duration-150 active:scale-95">Dashboard</button>
            <button onClick={onLogout} className="rounded-lg border border-[#242D37] px-3 py-2 text-sm text-[#C9D4E0] hover:border-[#9BFF00]/40 hover:text-[#9BFF00] hover:bg-[#9BFF00]/5 transition duration-150 active:scale-95">Sign Out</button>
          </div>
        </header>

        {error ? <p className="mb-3 rounded-lg border border-red-300 dark:border-[#4F2A2A] bg-red-50 dark:bg-[#2A1414] px-3 py-2 text-sm text-red-600 dark:text-[#FFB4B4]">{error}</p> : null}

        <section className="rounded-2xl border border-gray-200 dark:border-[#1A1E23] bg-white dark:bg-[#0A0D13] p-5">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-[#F3F7FB]">Run Backtest</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="text-sm text-gray-500 dark:text-[#9AA5B1]">Strategy Tag<input value={form.strategy_tag} onChange={(e) => setForm((p) => ({ ...p, strategy_tag: e.target.value }))} className="mt-1 w-full rounded-lg border border-gray-300 dark:border-[#26303B] bg-gray-50 dark:bg-[#0E141B] px-3 py-2 text-gray-900 dark:text-[#E8ECEF]" /></label>
            <label className="text-sm text-gray-500 dark:text-[#9AA5B1]">Symbol<input value={form.symbol} onChange={(e) => setForm((p) => ({ ...p, symbol: e.target.value.toUpperCase() }))} className="mt-1 w-full rounded-lg border border-gray-300 dark:border-[#26303B] bg-gray-50 dark:bg-[#0E141B] px-3 py-2 text-gray-900 dark:text-[#E8ECEF]" /></label>
            <label className="text-sm text-gray-500 dark:text-[#9AA5B1]">Timeframe<input value={form.timeframe} onChange={(e) => setForm((p) => ({ ...p, timeframe: e.target.value }))} className="mt-1 w-full rounded-lg border border-gray-300 dark:border-[#26303B] bg-gray-50 dark:bg-[#0E141B] px-3 py-2 text-gray-900 dark:text-[#E8ECEF]" /></label>
            <label className="text-sm text-gray-500 dark:text-[#9AA5B1]">Periods<input type="number" min={50} max={5000} value={form.periods} onChange={(e) => setForm((p) => ({ ...p, periods: Number(e.target.value) }))} className="mt-1 w-full rounded-lg border border-gray-300 dark:border-[#26303B] bg-gray-50 dark:bg-[#0E141B] px-3 py-2 text-gray-900 dark:text-[#E8ECEF]" /></label>
            <label className="text-sm text-gray-500 dark:text-[#9AA5B1] sm:col-span-2">Initial Capital<input type="number" min={1} value={form.initial_capital} onChange={(e) => setForm((p) => ({ ...p, initial_capital: Number(e.target.value) }))} className="mt-1 w-full rounded-lg border border-gray-300 dark:border-[#26303B] bg-gray-50 dark:bg-[#0E141B] px-3 py-2 text-gray-900 dark:text-[#E8ECEF]" /></label>
          </div>
          <button onClick={runBacktest} disabled={running} className="mt-5 rounded-lg bg-[#9BFF00] px-4 py-2 font-semibold text-[#11140D] disabled:opacity-60">{running ? "Running..." : "Run Backtest"}</button>
        </section>

        {result ? (
          <section className="mt-5 rounded-2xl border border-gray-200 dark:border-[#1A1E23] bg-white dark:bg-[#0A0D13] p-5">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-[#F3F7FB]">Backtest Result</h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg border border-gray-200 dark:border-[#24303A] bg-gray-50 dark:bg-[#0E141B] p-3"><p className="text-xs text-gray-500 dark:text-[#8D98A5]">ROI</p><p className="text-xl font-semibold text-green-600 dark:text-[#15D68A]">{result.roi}%</p></div>
              <div className="rounded-lg border border-gray-200 dark:border-[#24303A] bg-gray-50 dark:bg-[#0E141B] p-3"><p className="text-xs text-gray-500 dark:text-[#8D98A5]">Drawdown</p><p className="text-xl font-semibold text-red-600 dark:text-[#FF6666]">{result.drawdown}%</p></div>
              <div className="rounded-lg border border-gray-200 dark:border-[#24303A] bg-gray-50 dark:bg-[#0E141B] p-3"><p className="text-xs text-gray-500 dark:text-[#8D98A5]">Win Rate</p><p className="text-xl font-semibold text-gray-900 dark:text-[#F3F7FB]">{result.win_rate}%</p></div>
            </div>
            {report ? <p className="mt-3 text-sm text-gray-500 dark:text-[#AAB4C0]">Wins: {report.wins} | Losses: {report.losses} | Final Capital: {report.final_capital}</p> : null}
          </section>
        ) : null}
      </div>
    </main>
  );
}