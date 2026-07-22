"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";

import { DeployStrategyModal } from "@/components/auto-trading/DeployStrategyModal";
import { SendSignalModal } from "@/components/auto-trading/SendSignalModal";
import { AssetAllocationChart } from "@/components/dashboard/AssetAllocationChart";
import { PortfolioPerformanceChart } from "@/components/dashboard/PortfolioPerformanceChart";
import { StrategyDateFilterBar } from "@/components/Strategies/StrategyDateFilterBar";
import { StrategyTradeHistory } from "@/components/Strategies/StrategyTradeHistory";
import { WorkflowBanner } from "@/components/WorkflowBanner";
import type { DateRangeValue } from "@/components/broker/DateRangePicker";
import { getAccessToken } from "@/lib/auth";
import { isDateFilterActive, type DatePreset } from "@/lib/dateFilters";
import {
  buildChartSeriesFromTrades,
  chartPointsFromStrategy,
  computeAllocation,
  computeStrategySummary,
  filterStrategyTrades,
} from "@/lib/strategyMetrics";
import { useRequireBroker } from "@/hooks/useBrokerConnected";
import { useAutomatedStrategyStore } from "@/store/useAutomatedStrategyStore";
import { useStrategyStore } from "@/store/useStrategyStore";

function formatMoney(value: number) {
  return `${value >= 0 ? "+" : "-"}$${Math.abs(value).toFixed(2)}`;
}

function formatPercent(value: number) {
  return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
}

function MetricCell({ label, value, tone }: { label: string; value: string; tone?: "green" | "red" | "neutral" }) {
  const color =
    tone === "green" ? "text-[#9BFF00]" : tone === "red" ? "text-[#FB7185]" : "text-[#F3F7FB]";
  return (
    <div>
      <p className="text-xs text-[#6B7785]">{label}</p>
      <p className={`mt-1 text-lg font-semibold ${color}`}>{value}</p>
    </div>
  );
}

export default function StrategyDetailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams<{ strategyTag?: string | string[] }>();
  const rawStrategyTag = Array.isArray(params.strategyTag) ? params.strategyTag[0] : params.strategyTag ?? "";
  const strategyTag = decodeURIComponent(rawStrategyTag);
  const { requireBroker, hasBroker } = useRequireBroker();
  const { strategies: myStrategies, loading: myStrategiesLoading, loadStrategies } = useAutomatedStrategyStore();
  const { selectedStrategy, detailLoading, error, deployResult, loadStrategyDetail, deployStrategy, clearStatus } =
    useStrategyStore();

  const [showDeployModal, setShowDeployModal] = useState(false);
  const [showSignalModal, setShowSignalModal] = useState(false);
  const [signalDefaultSide, setSignalDefaultSide] = useState<"BUY" | "SELL">("SELL");
  const [deploying, setDeploying] = useState(false);
  const [chartMode, setChartMode] = useState<"pnl" | "roi">("pnl");
  const [multiplier, setMultiplier] = useState("100");
  const [datePreset, setDatePreset] = useState<DatePreset>("All");
  const [useCustomDateRange, setUseCustomDateRange] = useState(false);
  const [customDateRange, setCustomDateRange] = useState<DateRangeValue>({ from: null, to: null });
  const [dateLabel, setDateLabel] = useState("Select Dates");
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  useEffect(() => {
    if (!getAccessToken()) {
      router.push("/login");
      return;
    }
    if (strategyTag) void loadStrategyDetail(strategyTag);
    void loadStrategies();
  }, [loadStrategyDetail, loadStrategies, router, strategyTag]);

  const deployedStrategy = useMemo(
    () =>
      myStrategies.find(
        (item) =>
          item.strategy_tag?.toLowerCase() === strategyTag.toLowerCase() &&
          (item.is_active || ["ACTIVE", "RUNNING", "PAUSED"].includes((item.status ?? "").toUpperCase())),
      ) ?? null,
    [myStrategies, strategyTag],
  );

  const openSignalModal = (side: "BUY" | "SELL" = "SELL") => {
    setSignalDefaultSide(side);
    setShowSignalModal(true);
  };

  useEffect(() => {
    if (searchParams.get("deploy") !== "1" || myStrategiesLoading) return;
    requireBroker(`/dashboard/strategies/${encodeURIComponent(strategyTag)}?deploy=1`, () => {
      if (deployedStrategy) {
        openSignalModal("SELL");
      } else {
        setShowDeployModal(true);
      }
    });
  }, [deployedStrategy, myStrategiesLoading, requireBroker, searchParams, strategyTag]);

  const strategy = selectedStrategy?.strategy ?? null;
  const allTrades = selectedStrategy?.trade_history ?? [];
  const sections = selectedStrategy?.strategic_details ?? [];
  const margin = Number(strategy?.recommended_margin ?? 100);
  const multiplierValue = Math.max(Number(multiplier) || 100, 10) / 100;
  const effectiveMargin = margin * multiplierValue;

  const dateFilter = useMemo(
    () => ({ preset: datePreset, customRange: customDateRange, useCustom: useCustomDateRange }),
    [customDateRange, datePreset, useCustomDateRange],
  );

  const filteredTrades = useMemo(
    () => filterStrategyTrades(allTrades, dateFilter),
    [allTrades, dateFilter],
  );

  const summary = useMemo(
    () => computeStrategySummary(filteredTrades, effectiveMargin),
    [filteredTrades, effectiveMargin],
  );

  const allocation = useMemo(() => computeAllocation(filteredTrades), [filteredTrades]);

  const chartSeries = useMemo(() => {
    const fromTrades = buildChartSeriesFromTrades(filteredTrades, effectiveMargin, chartMode);
    if (fromTrades.length) return fromTrades;
    if (isDateFilterActive(dateFilter)) return [];
    return chartPointsFromStrategy(strategy?.chart_points ?? null, effectiveMargin, chartMode);
  }, [chartMode, dateFilter, effectiveMargin, filteredTrades, strategy?.chart_points]);

  const allocationSlices = allocation.map((item) => ({
    symbol: item.symbol,
    percentage: Number(item.percentage),
  }));

  const deployDefaults = useMemo(() => {
    const params = strategy?.parameters ?? {};
    const quantityRaw = params.quantity_per_signal ?? params.quantity ?? 1;
    return {
      symbol: (strategy?.symbol || "BTCUSD").toUpperCase().replace(/^[#$]+/, ""),
      quantity: String(quantityRaw),
      platformEngine: strategy?.signal_source === "platform_engine",
    };
  }, [strategy?.parameters, strategy?.signal_source, strategy?.symbol]);

  const handleDeploy = async (payload: {
    multiplier: string;
    max_profit_limit: string | null;
    max_loss_limit: string | null;
    copy_current_open_trades: boolean;
  }) => {
    setDeploying(true);
    clearStatus();
    const result = await deployStrategy(strategyTag, {
      ...payload,
      multiplier: (Math.max(Number(multiplier) || 100, 10) / 100).toFixed(2),
    });
    setDeploying(false);
    return Boolean(result);
  };

  const pnlPositive = summary.live_pnl >= 0;

  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-16 top-0 h-64 w-64 rounded-full bg-[#9BFF00]/10 blur-[90px]" />
        <div className="absolute right-0 top-24 h-72 w-72 rounded-full bg-[#3B82F6]/10 blur-[110px]" />
      </div>

      <div className="relative mx-auto w-full max-w-[1320px] px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <WorkflowBanner activeStep={hasBroker ? "deploy" : "broker"} />
        </div>

        {error && !showDeployModal ? (
          <p className="mb-4 rounded-2xl border border-[#4F2A2A] bg-[#2A1414] px-4 py-3 text-sm text-[#FFB4B4]">
            {error}
          </p>
        ) : null}
        {deployResult ? (
          <p className="mb-4 rounded-2xl border border-[#31503A] bg-[#142419] px-4 py-3 text-sm text-[#AEE7B8]">
            {deployResult.message}
          </p>
        ) : null}

        {detailLoading && !strategy ? (
          <div className="rounded-3xl border border-[#1A212A] bg-[#070A10] px-5 py-16 text-center text-[#A3AFBC]">
            Loading strategy...
          </div>
        ) : strategy ? (
          <>
            <section className="mb-6 flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                {strategy.logo_url ? (
                  <Image
                    src={strategy.logo_url}
                    alt=""
                    width={56}
                    height={56}
                    className="h-14 w-14 rounded-full border border-[#26303A] object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="flex h-14 w-14 items-center justify-center rounded-full border border-[#26303A] bg-[#0B1118] text-sm font-bold text-[#9BFF00]">
                    {strategy.name.slice(0, 2).toUpperCase()}
                  </div>
                )}
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-[28px] font-semibold text-[#F3F7FB] sm:text-[34px]">{strategy.name}</h1>
                    <span className="rounded-full border border-[#9BFF00]/30 bg-[#9BFF00]/10 px-2.5 py-0.5 text-[11px] text-[#9BFF00]">
                      active
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-[#8E9AAA]">
                    {strategy.followers} Followers • {strategy.exchange}
                  </p>
                </div>
              </div>

              <StrategyDateFilterBar
                datePreset={datePreset}
                useCustomDateRange={useCustomDateRange}
                customDateRange={customDateRange}
                dateLabel={dateLabel}
                datePickerOpen={datePickerOpen}
                onPresetChange={setDatePreset}
                onDateLabelChange={setDateLabel}
                onCustomRangeChange={setCustomDateRange}
                onUseCustomChange={setUseCustomDateRange}
                onPickerOpenChange={setDatePickerOpen}
              />
            </section>

            <section className="mb-6 grid gap-4 sm:grid-cols-3">
              <article className="rounded-2xl border border-[#1F2833] bg-[#0A0A0A]/90 p-5">
                <p className="text-sm text-[#8E9AAA]">PnL (range)</p>
                <p className={`mt-2 text-[28px] font-semibold ${pnlPositive ? "text-[#9BFF00]" : "text-[#FB7185]"}`}>
                  {formatMoney(summary.live_pnl)}
                </p>
              </article>
              <article className="rounded-2xl border border-[#1F2833] bg-[#0A0A0A]/90 p-5">
                <p className="text-sm text-[#8E9AAA]">Followers</p>
                <p className="mt-2 text-[28px] font-semibold text-[#F3F7FB]">{strategy.followers}</p>
              </article>
              <article className="rounded-2xl border border-[#1F2833] bg-[#0A0A0A]/90 p-5">
                <p className="text-sm text-[#8E9AAA]">Open trades</p>
                <p className="mt-2 text-[28px] font-semibold text-[#F3F7FB]">{summary.open_trades}</p>
              </article>
            </section>

            <section className="grid gap-5 xl:grid-cols-[1.35fr_0.85fr]">
              <div className="space-y-5">
                <PortfolioPerformanceChart
                  series={chartSeries}
                  mode={chartMode}
                  onModeChange={setChartMode}
                />

                <section className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
                  <article className="rounded-2xl border border-[#1A212A] bg-[#0A0A0A] p-5">
                    <h3 className="text-lg font-semibold text-[#F3F7FB]">Asset Allocation</h3>
                    <div className="mt-4">
                      <AssetAllocationChart slices={allocationSlices} />
                    </div>
                  </article>

                  <article className="rounded-2xl border border-[#1A212A] bg-[#0A0A0A] p-5">
                    <h3 className="text-lg font-semibold text-[#F3F7FB]">Key statistics</h3>
                    <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-5">
                      <MetricCell label="Average gain" value={formatMoney(summary.average_gain)} tone="green" />
                      <MetricCell label="Average loss" value={formatMoney(-summary.average_loss)} tone="red" />
                      <MetricCell label="Big win" value={formatMoney(summary.big_win)} tone="green" />
                      <MetricCell label="Big loss" value={formatMoney(-summary.big_loss)} tone="red" />
                      <MetricCell
                        label="Risk & reward ratio"
                        value={summary.risk_reward_ratio.toFixed(2)}
                      />
                      <MetricCell
                        label="Maximum drawdown"
                        value={`${summary.max_drawdown_percent.toFixed(1)}%`}
                      />
                      <MetricCell label="Sharpe ratio" value="—" />
                      <MetricCell
                        label="Win rate"
                        value={`${summary.win_rate_percent.toFixed(0)}%`}
                      />
                    </div>
                  </article>
                </section>

                <section className="grid gap-4 sm:grid-cols-2">
                  <article className="rounded-2xl border border-[#1A212A] bg-[#0A0A0A] p-5">
                    <p className="text-sm text-[#8E9AAA]">ROI</p>
                    <p className={`mt-1 text-2xl font-semibold ${summary.roi_percent >= 0 ? "text-[#9BFF00]" : "text-[#FB7185]"}`}>
                      {formatMoney(summary.live_pnl)}
                    </p>
                    <p className={`text-sm ${summary.roi_percent >= 0 ? "text-[#9BFF00]" : "text-[#FB7185]"}`}>
                      {formatPercent(summary.roi_percent)} in selected range
                    </p>
                    <div className="mt-4 flex gap-4 text-xs">
                      <span className="text-[#9BFF00]">Profitable {summary.winning_trades}</span>
                      <span className="text-[#FB7185]">Losing {summary.losing_trades}</span>
                    </div>
                  </article>
                  <article className="rounded-2xl border border-[#1A212A] bg-[#0A0A0A] p-5">
                    <p className="text-sm text-[#8E9AAA]">Win rate (%)</p>
                    <div className="mt-3 h-2 rounded-full bg-[#17202A]">
                      <div
                        className="h-full rounded-full bg-[#9BFF00]"
                        style={{ width: `${Math.min(summary.win_rate_percent, 100)}%` }}
                      />
                    </div>
                    <p className="mt-2 text-2xl font-semibold text-[#F3F7FB]">
                      {summary.win_rate_percent.toFixed(0)}%
                    </p>
                    <p className="mt-1 text-xs text-[#6B7785]">
                      {summary.total_trades} trades in range
                    </p>
                  </article>
                </section>

                <StrategyTradeHistory trades={filteredTrades} exchange={strategy.exchange} />
              </div>

              <aside className="space-y-5">
                <section className="rounded-2xl border border-[#1A212A] bg-[#0A0A0A] p-5">
                  <h3 className="text-lg font-semibold text-[#F3F7FB]">Strategic Details</h3>
                  <div className="mt-4 space-y-4">
                    {sections.map((section) => (
                      <div key={section.title}>
                        <p className="text-sm font-semibold text-[#C9D4E0]">{section.title}</p>
                        <p className="mt-2 text-sm leading-6 text-[#8E9AAA]">{section.body}</p>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="rounded-2xl border border-[#1A212A] bg-[#0A0A0A] p-5">
                  <p className="text-sm text-[#8E9AAA]">Recommended margin</p>
                  <p className="mt-1 text-2xl font-semibold text-[#F3F7FB]">
                    ${margin.toFixed(0)}
                  </p>

                  <label className="mt-5 block text-sm text-[#8E9AAA]">
                    Multiplier
                    <div className="mt-2 flex items-center gap-3">
                      <input
                        type="number"
                        min="10"
                        max="1000"
                        step="10"
                        value={multiplier}
                        onChange={(event) => setMultiplier(event.target.value)}
                        className="w-full rounded-xl border border-[#26303A] bg-[#0E141B] px-3 py-2.5 text-[#F3F7FB] focus:border-[#9BFF00]/40 focus:outline-none"
                      />
                      <span className="text-sm text-[#C9D4E0]">%</span>
                    </div>
                  </label>

                  {deployedStrategy ? (
                    <div className="mt-5 space-y-3">
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            requireBroker(`/strategies/${encodeURIComponent(strategyTag)}`, () =>
                              openSignalModal("BUY"),
                            )
                          }
                          className="rounded-xl border border-[#9BFF00]/30 bg-[#9BFF00]/10 px-3 py-3 text-sm font-semibold text-[#DFFFAB] hover:bg-[#9BFF00]/15"
                        >
                          Buy
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            requireBroker(`/strategies/${encodeURIComponent(strategyTag)}`, () =>
                              openSignalModal("SELL"),
                            )
                          }
                          className="rounded-xl border border-[#FB7185]/30 bg-[#FB7185]/10 px-3 py-3 text-sm font-semibold text-[#FFB4B4] hover:bg-[#FB7185]/15"
                        >
                          Sell
                        </button>
                      </div>
                      <Link
                        href={`/dashboard/automated-strategies/${deployedStrategy.id}/dashboard`}
                        className="block w-full rounded-xl border border-[#26303A] px-4 py-2.5 text-center text-sm text-[#C9D4E0] hover:border-[#9BFF00]/30"
                      >
                        Manage deployment →
                      </Link>
                    </div>
                  ) : strategy?.is_unlocked === false ? (
                    <div className="mt-5 space-y-3">
                      <div className="rounded-xl border border-[#5A4A1A] bg-[#1A1508] px-4 py-3 text-sm text-[#FFD56A]">
                        This strategy is locked on your current plan
                        {strategy.required_plan ? ` — upgrade to ${strategy.required_plan}` : ""}.
                      </div>
                      <button
                        type="button"
                        onClick={() => router.push("/dashboard/subscription")}
                        className="w-full rounded-xl border border-[#FFD56A]/40 px-4 py-3 text-sm font-semibold text-[#FFD56A] hover:bg-[#FFD56A]/10"
                      >
                        Upgrade Subscription
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() =>
                        requireBroker(`/dashboard/strategies/${encodeURIComponent(strategyTag)}?deploy=1`, () =>
                          setShowDeployModal(true),
                        )
                      }
                      className="mt-5 w-full rounded-xl bg-[#9BFF00] px-4 py-3 text-sm font-semibold text-[#11140D] hover:bg-[#B7FF45]"
                    >
                      Deploy Strategy
                    </button>
                  )}
                </section>

                <section className="rounded-2xl border border-[#1A212A] bg-[#0A0A0A] p-5">
                  <p className="text-xs uppercase tracking-[0.12em] text-[#6B7785]">Strategy info</p>
                  <div className="mt-3 space-y-2 text-sm text-[#C9D4E0]">
                    <p>
                      <span className="text-[#6B7785]">Tag:</span> {strategy.strategy_tag}
                    </p>
                    <p>
                      <span className="text-[#6B7785]">Risk:</span>{" "}
                      <span className="capitalize">{strategy.risk_level}</span>
                    </p>
                    <p>
                      <span className="text-[#6B7785]">MDD:</span> {Number(strategy.mdd_percent).toFixed(1)}%
                    </p>
                    <p>
                      <span className="text-[#6B7785]">Closed trades:</span> {summary.closed_trades}
                    </p>
                  </div>
                </section>
              </aside>
            </section>
          </>
        ) : (
          <div className="rounded-3xl border border-dashed border-[#27303A] bg-[#070A10] px-5 py-16 text-center text-[#8E9AAA]">
            Strategy not found.
          </div>
        )}

        <DeployStrategyModal
          open={showDeployModal && !deployedStrategy}
          strategyName={strategy?.name ?? "Strategy"}
          strategyTag={strategyTag}
          defaultSymbol={deployDefaults.symbol}
          defaultQuantity={deployDefaults.quantity}
          platformEngine={deployDefaults.platformEngine}
          defaultBroker="delta"
          loading={deploying}
          error={error}
          onClose={() => {
            setShowDeployModal(false);
            clearStatus();
          }}
          onDeploy={(payload) => handleDeploy(payload)}
          onComplete={() => {
            setShowDeployModal(false);
            router.push("/dashboard/automated-strategies?deployed=success");
          }}
        />

        <SendSignalModal
          open={showSignalModal}
          strategyTag={strategyTag}
          strategyName={strategy?.name ?? "Strategy"}
          automatedStrategyId={deployedStrategy?.id}
          defaultSymbol={deployDefaults.symbol}
          defaultBroker="delta"
          defaultSide={signalDefaultSide}
          onClose={() => setShowSignalModal(false)}
        />
      </div>
    </div>
  );
}
