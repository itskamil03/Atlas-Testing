import { getSignal } from "@/lib/api";
import type { SignalHistoryItem } from "@/lib/types";

import type { SignalOutcome } from "./signalOutcome";

const TERMINAL_STATUSES = new Set(["EXECUTED", "FAILED"]);
const POLL_INTERVAL_MS = 1500;
const POLL_TIMEOUT_MS = 45000;

export function mapSignalStatusToOutcome(status: string): SignalOutcome | null {
  const normalized = status.toUpperCase();
  if (normalized === "EXECUTED") return "executed";
  if (normalized === "FAILED") return "failed";
  if (TERMINAL_STATUSES.has(normalized)) return null;
  return "queued";
}

export function isTerminalSignalStatus(status: string): boolean {
  return TERMINAL_STATUSES.has(status.toUpperCase());
}

export async function pollSignalExecutionStatus(
  signalHistoryId: number,
  options?: {
    intervalMs?: number;
    timeoutMs?: number;
    onUpdate?: (item: SignalHistoryItem, outcome: SignalOutcome) => void;
  },
): Promise<{ outcome: SignalOutcome; item: SignalHistoryItem | null; timedOut: boolean }> {
  const intervalMs = options?.intervalMs ?? POLL_INTERVAL_MS;
  const timeoutMs = options?.timeoutMs ?? POLL_TIMEOUT_MS;
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    const response = await getSignal(signalHistoryId);
    const item = response.data;
    const mapped = mapSignalStatusToOutcome(item.status);

    if (mapped === "executed" || mapped === "failed") {
      options?.onUpdate?.(item, mapped);
      return { outcome: mapped, item, timedOut: false };
    }

    options?.onUpdate?.(item, "queued");
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }

  return { outcome: "queued", item: null, timedOut: true };
}
