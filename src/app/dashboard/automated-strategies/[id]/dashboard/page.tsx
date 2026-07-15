"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

import { AutomatedStrategyNav } from "@/components/auto-trading/AutomatedStrategyNav";
import { FeedbackBanner } from "@/components/auto-trading/FeedbackBanner";
import { MetricCard } from "@/components/auto-trading/MetricCard";
import { StatusBadge } from "@/components/auto-trading/StatusBadge";
import { StrategyControls } from "@/components/auto-trading/StrategyControls";
import { getAccessToken } from "@/lib/auth";
import { useAutomatedStrategyDashboardStore } from "@/store/useAutomatedStrategyDashboardStore";

export default function AutomatedStrategyDashboardPage() {
  const router = useRouter();
  const params = useParams<{ id?: string | string[] }>();
  const strategyId = Number(Array.isArray(params.id) ? params.id[0] : params.id);
  const {
    strategy,
    liveStatus,
    dashboard,
    loading,
    actionLoading,
    error,
    message,
    loadDashboard,
    startStrategy,
    stopStrategy,
    pauseStrategy,
    resumeStrategy,
    undeployStrategy,
  } = useAutomatedStrategyDashboardStore();

  useEffect(() => {
    if (!getAccessToken()) {
      router.push("/login");
      return;
    }
    if (Number.isFinite(strategyId) && strategyId > 0) {
      void loadDashboard(strategyId);
    }
  }, [loadDashboard, router, strategyId]);

  const liveStatusLabel = liveStatus?.status ?? strategy?.status ?? "INACTIVE";

  return (
    <div className="mx-auto w-full max-w-[1320px] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-[#1A212A] bg-[linear-gradient(135deg,#0A1017,#070A10)] px-5 py-4 shadow-[0_18px_40px_rgba(0,0,0,0.28)]">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-[#8E9AAA]">Strategy dashboard</p>
          <h1 className="mt-1 text-2xl font-semibold text-[#F3F7FB]">{strategy?.name ?? "Loading dashboard..."}</h1>
          {/* <p className="mt-1 text-sm text-[#93A0AE]">Signals, trades, PnL, and win rate for this deployed strategy.</p> */}
        </div>
        <AutomatedStrategyNav strategyId={strategyId} active="dashboard" />
      </div>

      <FeedbackBanner error={error} message={message} />

      <section className="mb-6 rounded-[28px] border border-[#1A212A] bg-[#070A10] p-5">
        <div className="mb-4 flex items-center gap-3">
          <p className="text-sm text-[#93A0AE]">Live status</p>
          <StatusBadge status={liveStatusLabel} pulse={liveStatusLabel.toUpperCase() === "RUNNING"} />
        </div>
        <StrategyControls
          status={liveStatusLabel}
          loading={actionLoading}
          showUndeploy={Boolean(strategy?.strategy_tag)}
          onStart={() => void startStrategy(strategyId)}
          onStop={() => void stopStrategy(strategyId)}
          onPause={() => void pauseStrategy(strategyId)}
          onResume={() => void resumeStrategy(strategyId)}
          onUndeploy={() => {
            if (!strategy?.strategy_tag) return;
            void undeployStrategy(strategyId, strategy.strategy_tag).then((ok) => {
              if (ok) router.push("/dashboard/automated-strategies");
            });
          }}
        />
      </section>

      {loading && !dashboard ? (
        <div className="rounded-3xl border border-[#1A212A] bg-[#070A10] px-5 py-10 text-[#A3AFBC]">Loading dashboard metrics...</div>
      ) : dashboard ? (
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <MetricCard label="Signals Received" value={dashboard.signals} />
          <MetricCard label="Trades Executed" value={dashboard.executed_trades} />
          <MetricCard label="Failed Trades" value={dashboard.failed_trades} />
          <MetricCard label="PnL" value={dashboard.pnl} format="pnl" />
          <MetricCard label="Win Rate" value={dashboard.win_rate} format="percent" />
        </section>
      ) : (
        <div className="rounded-3xl border border-[#1A212A] bg-[#070A10] px-5 py-10 text-[#A3AFBC]">
          Dashboard metrics are unavailable until this strategy is linked to a live trading session.
        </div>
      )}
    </div>
  );
}
