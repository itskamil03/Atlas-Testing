"use client";

import Image from "next/image";

import { parseSparkline } from "@/lib/strategyMetrics";
import type { StrategyCard } from "@/lib/types";

type StrategyMarketplaceCardProps = {
  strategy: StrategyCard;
  highlighted?: boolean;
  onMirror: () => void;
  onConnectBroker?: () => void;
  onUpgrade?: () => void;
  hasBroker: boolean;
};

function MiniSparkline({ values, positive }: { values: number[]; positive: boolean }) {
  if (values.length < 2) {
    return <div className="h-12 w-24 rounded-lg bg-[#0E141B]" />;
  }

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const width = 96;
  const height = 48;
  const points = values
    .map((value, index) => {
      const x = (index / (values.length - 1)) * width;
      const y = height - ((value - min) / range) * (height - 8) - 4;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-12 w-24">
      <polyline
        fill="none"
        stroke={positive ? "#9BFF00" : "#FB7185"}
        strokeWidth="2"
        points={points}
      />
    </svg>
  );
}

export function StrategyMarketplaceCard({
  strategy,
  highlighted = false,
  onMirror,
  onConnectBroker,
  onUpgrade,
  hasBroker,
}: StrategyMarketplaceCardProps) {
  const pnl = Number(strategy.pnl);
  const roi = Number(strategy.roi_percent);
  const positive = pnl >= 0;
  const sparkline = parseSparkline(strategy.chart_points);
  const winRate = Number(strategy.win_rate_percent);
  const isLocked = strategy.is_unlocked === false;

  return (
    <article
      className={`flex min-w-[300px] max-w-[340px] flex-col rounded-[28px] border bg-[linear-gradient(180deg,#0D1218,#090D12)] p-5 shadow-[0_16px_36px_rgba(0,0,0,0.28)] transition hover:-translate-y-0.5 ${
        isLocked
          ? "border-[#3A2A14] opacity-90"
          : highlighted
            ? "border-[#9BFF00]"
            : "border-[#1E2731] hover:border-[#9BFF00]/40"
      }`}
    >
      {isLocked ? (
        <div className="mb-3 inline-flex w-fit items-center gap-2 rounded-full border border-[#5A4A1A] bg-[#1A1508] px-3 py-1 text-xs font-medium uppercase tracking-wide text-[#FFD56A]">
          Locked · {strategy.required_plan ? `${strategy.required_plan} plan` : "Upgrade required"}
        </div>
      ) : null}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          {strategy.logo_url ? (
            <Image
              src={strategy.logo_url}
              alt=""
              width={44}
              height={44}
              className="h-11 w-11 rounded-full border border-[#26303A] object-cover"
              unoptimized
            />
          ) : (
            <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[#26303A] bg-[#0B1118] text-xs font-bold text-[#9BFF00]">
              {strategy.name.slice(0, 2).toUpperCase()}
            </div>
          )}
          <div>
            <h2 className="text-lg font-semibold text-[#F3F7FB]">{strategy.name}</h2>
            <p className="mt-0.5 text-xs text-[#8E9AAA]">
              {strategy.exchange} • {strategy.followers} followers
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-end justify-between gap-3">
        <div>
          <p className={`text-2xl font-semibold ${positive ? "text-[#9BFF00]" : "text-[#FB7185]"}`}>
            {positive ? "+" : "-"}${Math.abs(pnl).toFixed(2)}
          </p>
          <p className={`text-sm ${positive ? "text-[#9BFF00]" : "text-[#FB7185]"}`}>
            {positive ? "+" : ""}
            {roi.toFixed(1)}%
          </p>
        </div>
        <MiniSparkline values={sparkline} positive={positive} />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-[11px] uppercase tracking-wide text-[#6B7785]">Recommended margin</p>
          <p className="mt-1 font-semibold text-[#F3F7FB]">${Number(strategy.recommended_margin).toFixed(0)}</p>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-wide text-[#6B7785]">MDD</p>
          <p className="mt-1 font-semibold text-[#F3F7FB]">{Number(strategy.mdd_percent).toFixed(1)}%</p>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-wide text-[#6B7785]">Win rate</p>
          <div className="mt-1.5 h-1.5 rounded-full bg-[#17202A]">
            <div
              className="h-full rounded-full bg-[#9BFF00]"
              style={{ width: `${Math.min(winRate, 100)}%` }}
            />
          </div>
          <p className="mt-1 text-xs text-[#C9D4E0]">{winRate.toFixed(0)}%</p>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-wide text-[#6B7785]">Risk</p>
          <p className="mt-1 font-semibold capitalize text-[#F3F7FB]">{strategy.risk_level}</p>
        </div>
      </div>

      <button
        type="button"
        onClick={
          isLocked
            ? onUpgrade
            : hasBroker
              ? onMirror
              : onConnectBroker
        }
        className={`mt-5 w-full rounded-2xl px-4 py-3 text-sm font-semibold transition ${
          isLocked
            ? "border border-[#FFD56A]/40 text-[#FFD56A] hover:bg-[#FFD56A]/10"
            : hasBroker
              ? "bg-[#9BFF00] text-[#11140D] hover:bg-[#B7FF45]"
              : "border border-[#9BFF00]/40 text-[#9BFF00] hover:bg-[#9BFF00]/10"
        }`}
      >
        {isLocked ? "Upgrade to Unlock" : hasBroker ? "Deploy Strategy" : "Connect to Broker"}
      </button>
    </article>
  );
}
