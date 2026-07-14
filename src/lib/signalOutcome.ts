import type { StrategySignalResponse } from "@/lib/types";

export type SignalOutcome = "queued" | "stored" | "executed" | "failed";

export function resolveSignalOutcome(response: StrategySignalResponse): SignalOutcome {
  if (
    response.status === "queued" ||
    response.status === "stored" ||
    response.status === "executed" ||
    response.status === "failed"
  ) {
    return response.status;
  }

  const message = (response.message || "").toLowerCase();
  if (message.includes("no active") || message.includes("deploy or start")) {
    return "stored";
  }
  if (message.includes("executed") || message.includes("filled") || message.includes("punched")) {
    return "executed";
  }
  if (message.includes("failed") || message.includes("rejected") || message.includes("blocked")) {
    return "failed";
  }
  if (message.includes("queued") || message.includes("being sent")) {
    return "queued";
  }
  return response.sessions_queued && response.sessions_queued > 0 ? "queued" : "stored";
}

export function signalOutcomeCopy(
  outcome: SignalOutcome,
  side: "BUY" | "SELL",
  symbol: string,
  failureReason?: string | null,
) {
  if (outcome === "executed") {
    return {
      badge: "Order filled",
      headline: `${side} order executed`,
      description: `Your ${side} order for ${symbol} was filled on the broker.`,
      tone: "success" as const,
    };
  }

  if (outcome === "failed") {
    return {
      badge: "Order failed",
      headline: `${side} order failed`,
      description:
        failureReason?.trim() ||
        `Your ${side} signal for ${symbol} could not be executed on the broker.`,
      tone: "danger" as const,
    };
  }

  if (outcome === "queued") {
    return {
      badge: "Signal verified",
      headline: `${side} signal accepted`,
      description: `Your ${side} signal for ${symbol} is being sent to the broker. Waiting for final status…`,
      tone: "pending" as const,
    };
  }

  return {
    badge: "Signal saved",
    headline: "Signal saved only",
    description: `Your ${side} signal for ${symbol} was saved but not sent to the broker. Start or deploy the strategy first.`,
    tone: "warning" as const,
  };
}
