"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import { AutomatedStrategyNav } from "@/components/auto-trading/AutomatedStrategyNav";
import { FeedbackBanner } from "@/components/auto-trading/FeedbackBanner";
import { StatusBadge } from "@/components/auto-trading/StatusBadge";
import { StrategyControls } from "@/components/auto-trading/StrategyControls";
import { getAccessToken } from "@/lib/auth";
import { strategySummary } from "@/lib/automatedStrategy";
import { useAutomatedStrategyDashboardStore } from "@/store/useAutomatedStrategyDashboardStore";

export default function AutomatedStrategyDetailPage() {
  const router = useRouter();
  const params = useParams<{ id?: string | string[] }>();
  const strategyId = Number(Array.isArray(params.id) ? params.id[0] : params.id);
  const {
    strategy,
    deploymentStatus,
    liveStatus,
    loading,
    actionLoading,
    error,
    message,
    loadStrategy,
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
      void loadStrategy(strategyId);
    }
  }, [loadStrategy, router, strategyId]);

  const liveStatusLabel = liveStatus?.status ?? deploymentStatus?.status ?? strategy?.status ?? "INACTIVE";

  return (
    <div className="mx-auto w-full max-w-[1320px] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-[#1A212A] bg-[linear-gradient(135deg,#0A1017,#070A10)] px-5 py-4 shadow-[0_18px_40px_rgba(0,0,0,0.28)]">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-[#8E9AAA]">Strategy details</p>
          <h1 className="mt-1 text-2xl font-semibold text-[#F3F7FB]">{strategy?.name ?? "Loading strategy..."}</h1>
          <p className="mt-1 text-sm text-[#93A0AE]">Review deployment settings and control live execution.</p>
        </div>
        <AutomatedStrategyNav strategyId={strategyId} active="detail" />
      </div>

      <FeedbackBanner error={error} message={message} />

      {loading && !strategy ? (
        <div className="rounded-3xl border border-[#1A212A] bg-[#070A10] px-5 py-10 text-[#A3AFBC]">Loading strategy details...</div>
      ) : strategy ? (
        <div className="space-y-6">
          <section className="rounded-[28px] border border-[#1A212A] bg-[#070A10] p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.14em] text-[#8E9AAA]">{strategy.strategy_tag ?? strategy.strategy_type}</p>
                <h2 className="mt-1 text-2xl font-semibold text-[#F3F7FB]">{strategy.name}</h2>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-[#97A4B3]">{strategy.description ?? "No description provided."}</p>
              </div>
              <StatusBadge status={liveStatusLabel} pulse={liveStatusLabel.toUpperCase() === "RUNNING"} />
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <article className="rounded-2xl border border-[#232B35] bg-[#0B1118] p-4">
                <p className="text-xs uppercase tracking-[0.12em] text-[#8E9AAA]">Symbol</p>
                <p className="mt-2 text-xl font-semibold text-[#F3F7FB]">{strategy.symbol}</p>
              </article>
              <article className="rounded-2xl border border-[#232B35] bg-[#0B1118] p-4">
                <p className="text-xs uppercase tracking-[0.12em] text-[#8E9AAA]">Broker</p>
                <p className="mt-2 text-xl font-semibold text-[#F3F7FB]">{strategy.broker}</p>
              </article>
              <article className="rounded-2xl border border-[#232B35] bg-[#0B1118] p-4">
                <p className="text-xs uppercase tracking-[0.12em] text-[#8E9AAA]">Multiplier</p>
                <p className="mt-2 text-xl font-semibold text-[#F3F7FB]">{strategy.multiplier}</p>
              </article>
              <article className="rounded-2xl border border-[#232B35] bg-[#0B1118] p-4">
                <p className="text-xs uppercase tracking-[0.12em] text-[#8E9AAA]">Max loss limit</p>
                <p className="mt-2 text-xl font-semibold text-[#F3F7FB]">{strategy.max_loss_limit}</p>
              </article>
            </div>
          </section>

          <section className="rounded-[28px] border border-[#1A212A] bg-[#070A10] p-5">
            <StrategyControls
              status={liveStatusLabel}
              loading={actionLoading}
              showUndeploy={Boolean(strategy.strategy_tag)}
              onStart={() => void startStrategy(strategyId)}
              onStop={() => void stopStrategy(strategyId)}
              onPause={() => void pauseStrategy(strategyId)}
              onResume={() => void resumeStrategy(strategyId)}
              onUndeploy={() => {
                if (!strategy.strategy_tag) return;
                void undeployStrategy(strategyId, strategy.strategy_tag).then((ok) => {
                  if (ok) router.push("/dashboard/automated-strategies");
                });
              }}
            />
          </section>

          <section className="grid gap-4 lg:grid-cols-2">
            <article className="rounded-[28px] border border-[#1A212A] bg-[#070A10] p-5">
              <p className="text-xs uppercase tracking-[0.14em] text-[#8E9AAA]">Deployment status</p>
              <div className="mt-4 space-y-3 text-sm text-[#D5DEE8]">
                <p>Status: <span className="text-[#F3F7FB]">{deploymentStatus?.status ?? strategy.status}</span></p>
                <p>Strategy tag: <span className="text-[#F3F7FB]">{deploymentStatus?.strategy_tag ?? strategy.strategy_tag ?? "-"}</span></p>
                <p>Account ID: <span className="text-[#F3F7FB]">{deploymentStatus?.account_id ?? strategy.account_id ?? "-"}</span></p>
                <p>Summary: <span className="text-[#F3F7FB]">{strategySummary(strategy)}</span></p>
              </div>
            </article>

            <article className="rounded-[28px] border border-[#1A212A] bg-[#070A10] p-5">
              <p className="text-xs uppercase tracking-[0.14em] text-[#8E9AAA]">Live session</p>
              <div className="mt-4 space-y-3 text-sm text-[#D5DEE8]">
                <p>Signals received: <span className="text-[#F3F7FB]">{liveStatus?.signals_received ?? 0}</span></p>
                <p>Trades executed: <span className="text-[#F3F7FB]">{liveStatus?.trades_executed ?? 0}</span></p>
                <p>Failed trades: <span className="text-[#F3F7FB]">{liveStatus?.trades_failed ?? 0}</span></p>
              </div>
              <Link
                href={`/dashboard/automated-strategies/${strategyId}/dashboard`}
                className="mt-5 inline-flex rounded-2xl bg-[#9BFF00] px-5 py-3 font-semibold text-[#11140D] transition hover:bg-[#B7FF45]"
              >
                Open dashboard
              </Link>
            </article>
          </section>
        </div>
      ) : null}
    </div>
  );
}
