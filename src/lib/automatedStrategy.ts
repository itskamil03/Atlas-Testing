import { getAutomatedStrategy, getPublicStrategyDetail } from "@/lib/api";
import type { AutomatedStrategyItem } from "@/lib/types";

export async function resolveTradingStrategyId(automatedStrategyId: number): Promise<number | null> {
  const response = await getAutomatedStrategy(automatedStrategyId);
  const strategy = response.data;
  if (!strategy.strategy_tag) {
    return null;
  }

  const detailResponse = await getPublicStrategyDetail(strategy.strategy_tag);
  return detailResponse.data.strategy.id;
}

export function formatStatusLabel(status: string) {
  return status.replace(/_/g, " ").toLowerCase();
}

export function statusBadgeClass(status: string) {
  const normalized = status.toUpperCase();
  if (["RUNNING", "ACTIVE", "EXECUTED", "RECEIVED"].includes(normalized)) {
    return "border-[#31503A] bg-[#142419] text-[#AEE7B8]";
  }
  if (["PAUSED", "PENDING"].includes(normalized)) {
    return "border-[#4A4428] bg-[#2A2414] text-[#F5D98B]";
  }
  if (["STOPPED", "INACTIVE", "FAILED"].includes(normalized)) {
    return "border-[#4F2A2A] bg-[#2A1414] text-[#FFB4B4]";
  }
  return "border-[#2B3440] bg-[#0B1118] text-[#C7D2DF]";
}

export function pnlClass(value: string | number) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return "text-[#F3F7FB]";
  return numeric >= 0 ? "text-[#22D08C]" : "text-[#FB6969]";
}

export function strategySummary(strategy: AutomatedStrategyItem) {
  return `${strategy.symbol} • ${strategy.broker} • ${strategy.strategy_type}`;
}
