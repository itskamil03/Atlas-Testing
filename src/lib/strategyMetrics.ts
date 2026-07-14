import type { PortfolioChartPoint } from "@/components/dashboard/PortfolioPerformanceChart";
import type { DateRangeValue } from "@/components/broker/DateRangePicker";
import type { StrategyAllocationItem, StrategyTradeHistoryItem } from "@/lib/types";
import { matchesDateFilter, type DatePreset } from "@/lib/dateFilters";

export type StrategyDateFilter = {
  preset: DatePreset;
  customRange: DateRangeValue;
  useCustom: boolean;
};

const OPEN_STATUSES = new Set(["OPEN", "PENDING", "PARTIALLY_FILLED"]);

export function filterStrategyTrades(trades: StrategyTradeHistoryItem[], filter: StrategyDateFilter) {
  return trades.filter((trade) => matchesDateFilter(new Date(trade.created_at), filter));
}

export type ComputedStrategySummary = {
  live_pnl: number;
  roi_percent: number;
  win_rate_percent: number;
  total_trades: number;
  open_trades: number;
  closed_trades: number;
  average_gain: number;
  average_loss: number;
  big_win: number;
  big_loss: number;
  risk_reward_ratio: number;
  max_drawdown_percent: number;
  winning_trades: number;
  losing_trades: number;
};

export function computeStrategySummary(
  trades: StrategyTradeHistoryItem[],
  margin: number,
): ComputedStrategySummary {
  const openTrades = trades.filter((trade) => OPEN_STATUSES.has(trade.status.toUpperCase()));
  const closedTrades = trades.filter((trade) => !OPEN_STATUSES.has(trade.status.toUpperCase()));
  const winning = trades.filter((trade) => Number(trade.pnl) > 0);
  const losing = trades.filter((trade) => Number(trade.pnl) < 0);

  const sumPnl = (items: StrategyTradeHistoryItem[]) =>
    items.reduce((total, trade) => total + Number(trade.pnl), 0);

  const livePnl = sumPnl(trades);
  const avgGain = winning.length ? sumPnl(winning) / winning.length : 0;
  const avgLoss = losing.length
    ? losing.reduce((total, trade) => total + Math.abs(Number(trade.pnl)), 0) / losing.length
    : 0;
  const bigWin = winning.length ? Math.max(...winning.map((trade) => Number(trade.pnl))) : 0;
  const bigLoss = losing.length
    ? Math.max(...losing.map((trade) => Math.abs(Number(trade.pnl))))
    : 0;
  const riskReward = avgLoss > 0 ? avgGain / avgLoss : 0;

  const sorted = [...trades].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  );
  let cumulative = 0;
  let peak = 0;
  let maxDrawdown = 0;
  for (const trade of sorted) {
    cumulative += Number(trade.pnl);
    if (cumulative > peak) peak = cumulative;
    if (peak > 0) {
      const drawdown = ((peak - cumulative) / peak) * 100;
      if (drawdown > maxDrawdown) maxDrawdown = drawdown;
    }
  }

  const winRate = trades.length ? (winning.length / trades.length) * 100 : 0;
  const roi = margin > 0 ? (livePnl / margin) * 100 : 0;

  return {
    live_pnl: livePnl,
    roi_percent: roi,
    win_rate_percent: winRate,
    total_trades: trades.length,
    open_trades: openTrades.length,
    closed_trades: closedTrades.length,
    average_gain: avgGain,
    average_loss: avgLoss,
    big_win: bigWin,
    big_loss: bigLoss,
    risk_reward_ratio: riskReward,
    max_drawdown_percent: maxDrawdown,
    winning_trades: winning.length,
    losing_trades: losing.length,
  };
}

export function computeAllocation(trades: StrategyTradeHistoryItem[]): StrategyAllocationItem[] {
  const buckets = new Map<string, { notional: number; trades: number }>();

  for (const trade of trades) {
    const notional = Math.abs(Number(trade.quantity) * Number(trade.entry_price));
    const bucket = buckets.get(trade.symbol) ?? { notional: 0, trades: 0 };
    bucket.notional += notional;
    bucket.trades += 1;
    buckets.set(trade.symbol, bucket);
  }

  const totalNotional = Array.from(buckets.values()).reduce((sum, item) => sum + item.notional, 0);
  if (totalNotional <= 0) return [];

  return Array.from(buckets.entries())
    .sort((a, b) => b[1].notional - a[1].notional)
    .map(([symbol, bucket]) => ({
      symbol,
      percentage: String(((bucket.notional / totalNotional) * 100).toFixed(2)),
      notional: String(bucket.notional.toFixed(2)),
      trades: bucket.trades,
    }));
}

export function buildChartSeriesFromTrades(
  trades: StrategyTradeHistoryItem[],
  margin: number,
  mode: "pnl" | "roi",
): PortfolioChartPoint[] {
  const sorted = [...trades].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  );
  const byDate = new Map<string, number>();

  for (const trade of sorted) {
    const date = trade.created_at.slice(0, 10);
    byDate.set(date, (byDate.get(date) ?? 0) + Number(trade.pnl));
  }

  let cumulative = 0;
  return Array.from(byDate.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, dailyPnl]) => {
      cumulative += dailyPnl;
      return {
        date,
        label: new Date(`${date}T00:00:00`).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        value: mode === "pnl" ? cumulative : margin > 0 ? (cumulative / margin) * 100 : 0,
      };
    });
}

export function chartPointsFromStrategy(
  chartPoints: string | null,
  margin: number,
  mode: "pnl" | "roi",
): PortfolioChartPoint[] {
  if (!chartPoints?.trim()) return [];

  const values = chartPoints
    .split(",")
    .map((value) => Number(value.trim()))
    .filter((value) => Number.isFinite(value));

  if (!values.length) return [];

  const today = new Date();
  return values.map((value, index) => {
    const date = new Date(today);
    date.setDate(date.getDate() - (values.length - 1 - index));
    const dateStr = date.toISOString().slice(0, 10);
    return {
      date: dateStr,
      label: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      value: mode === "pnl" ? value : margin > 0 ? (value / margin) * 100 : 0,
    };
  });
}

export function parseSparkline(chartPoints: string | null): number[] {
  if (!chartPoints?.trim()) return [];
  return chartPoints
    .split(",")
    .map((value) => Number(value.trim()))
    .filter((value) => Number.isFinite(value));
}
