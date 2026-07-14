import type { Trade } from "@/lib/types";

import type { DateRangeValue } from "@/components/broker/DateRangePicker";

export type DatePreset = "1D" | "1W" | "1M" | "1Y" | "All";

const PRESET_DAYS: Record<DatePreset, number | null> = {
  "1D": 1,
  "1W": 7,
  "1M": 30,
  "1Y": 365,
  All: null,
};

type DateFilter = {
  preset: DatePreset;
  customRange: DateRangeValue;
  useCustom: boolean;
};

function parseTradeDate(value: string) {
  return new Date(value);
}

function parseChartDate(value: string) {
  return new Date(`${value}T00:00:00`);
}

export function isDateFilterActive(filter: DateFilter) {
  return filter.useCustom ? Boolean(filter.customRange.from || filter.customRange.to) : filter.preset !== "All";
}

export function matchesDateFilter(date: Date, filter: DateFilter) {
  if (filter.useCustom) {
    if (!filter.customRange.from && !filter.customRange.to) return true;
    if (filter.customRange.from && date < filter.customRange.from) return false;
    if (filter.customRange.to && date > filter.customRange.to) return false;
    return true;
  }

  const days = PRESET_DAYS[filter.preset];
  if (!days) return true;
  const cutoff = new Date();
  cutoff.setHours(0, 0, 0, 0);
  cutoff.setDate(cutoff.getDate() - days);
  return date >= cutoff;
}

export function filterTradesByDate(trades: Trade[], filter: DateFilter) {
  if (!isDateFilterActive(filter)) return trades;
  return trades.filter((trade) => matchesDateFilter(parseTradeDate(trade.created_at), filter));
}

export function filterChartSeriesByDate<T extends { date: string }>(series: T[], filter: DateFilter) {
  if (!isDateFilterActive(filter)) return series;
  return series.filter((point) => matchesDateFilter(parseChartDate(point.date), filter));
}

export function dateFilterSubtext(filter: DateFilter) {
  if (!isDateFilterActive(filter)) return "All time";
  if (filter.useCustom) return "Selected range";
  return `Last ${filter.preset}`;
}
