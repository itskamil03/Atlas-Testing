"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { signalOutcomeCopy, type SignalOutcome } from "@/lib/signalOutcome";
import { pollSignalExecutionStatus } from "@/lib/signalStatusPoll";

type OrderSuccessScreenProps = {
  side: "BUY" | "SELL";
  symbol: string;
  quantity: string;
  strategyTag: string;
  strategyName?: string;
  detailMessage?: string;
  outcome?: SignalOutcome;
  signalHistoryId?: number | null;
  headline?: string;
  onDone: () => void;
};

const TONE_STYLES = {
  success: {
    accent: "#8B5CF6",
    accentSoft: "rgba(139,92,246,0.15)",
    borderColor: "rgba(139,92,246,0.35)",
    detailBorder: "#5B21B6",
    detailBg: "#1E1338",
    detailText: "#DDD6FE",
  },
  pending: {
    accent: "#38BDF8",
    accentSoft: "rgba(56,189,248,0.12)",
    borderColor: "rgba(56,189,248,0.35)",
    detailBorder: "#1E4A63",
    detailBg: "#0F2230",
    detailText: "#9BD7F7",
  },
  warning: {
    accent: "#FBBF24",
    accentSoft: "rgba(251,191,36,0.12)",
    borderColor: "rgba(251,191,36,0.35)",
    detailBorder: "#4A4428",
    detailBg: "#2A2414",
    detailText: "#F5D98B",
  },
  danger: {
    accent: "#FB7185",
    accentSoft: "rgba(251,113,133,0.12)",
    borderColor: "rgba(251,113,133,0.35)",
    detailBorder: "#4F2A2A",
    detailBg: "#2A1414",
    detailText: "#FFB4B4",
  },
};

function statusLabel(outcome: SignalOutcome, polling: boolean): string {
  if (outcome === "executed") return "Filled on broker";
  if (outcome === "failed") return "Failed";
  if (outcome === "stored") return "Saved only";
  return polling ? "Processing on broker…" : "Sending to broker";
}

export function OrderSuccessScreen({
  side,
  symbol,
  quantity,
  strategyTag,
  strategyName,
  detailMessage,
  outcome: initialOutcome = "queued",
  signalHistoryId,
  headline,
  onDone,
}: OrderSuccessScreenProps) {
  const [outcome, setOutcome] = useState<SignalOutcome>(initialOutcome);
  const [failureReason, setFailureReason] = useState<string | null>(null);
  const [polling, setPolling] = useState(false);
  const [pollTimedOut, setPollTimedOut] = useState(false);

  useEffect(() => {
    setOutcome(initialOutcome);
    setFailureReason(null);
    setPollTimedOut(false);
  }, [initialOutcome, signalHistoryId]);

  useEffect(() => {
    if (!signalHistoryId || initialOutcome !== "queued") return;

    let cancelled = false;
    setPolling(true);

    void pollSignalExecutionStatus(signalHistoryId, {
      onUpdate: (item, nextOutcome) => {
        if (cancelled) return;
        if (nextOutcome === "executed" || nextOutcome === "failed") {
          setOutcome(nextOutcome);
          if (nextOutcome === "failed") {
            setFailureReason(item.failure_reason);
          }
        }
      },
    })
      .then((result) => {
        if (cancelled) return;
        if (result.outcome === "executed" || result.outcome === "failed") {
          setOutcome(result.outcome);
          if (result.outcome === "failed") {
            setFailureReason(result.item?.failure_reason ?? null);
          }
        } else if (result.timedOut) {
          setPollTimedOut(true);
        }
      })
      .finally(() => {
        if (!cancelled) setPolling(false);
      });

    return () => {
      cancelled = true;
    };
  }, [initialOutcome, signalHistoryId]);

  const copy = signalOutcomeCopy(outcome, side, symbol, failureReason);
  const styles = TONE_STYLES[copy.tone];
  const isBuy = side === "BUY";
  const showSpinner = polling && outcome === "queued";

  return (
    <div className="flex flex-col items-center py-4 text-center">
      <div
        className="relative flex h-20 w-20 items-center justify-center rounded-full"
        style={{ background: styles.accentSoft, boxShadow: `0 0 40px ${styles.accentSoft}` }}
      >
        <div
          className="flex h-14 w-14 items-center justify-center rounded-full border-2"
          style={{ borderColor: styles.accent, background: "rgba(7,10,16,0.85)" }}
        >
          {showSpinner ? (
            <span
              className="inline-block h-7 w-7 animate-spin rounded-full border-2 border-t-transparent"
              style={{ borderColor: styles.accent, borderTopColor: "transparent" }}
            />
          ) : outcome === "failed" ? (
            <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke={styles.accent} strokeWidth="2.5">
              <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ) : outcome === "stored" ? (
            <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke={styles.accent} strokeWidth="2.5">
              <path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke={styles.accent} strokeWidth="2.5">
              <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </div>
      </div>

      <p className="mt-6 text-xs uppercase tracking-[0.18em] text-[#8E9AAA]">{copy.badge}</p>
      <h4 className="mt-2 text-2xl font-semibold text-[#F3F7FB]">{headline ?? copy.headline}</h4>
      <p className="mt-2 max-w-sm text-sm leading-6 text-[#93A0AE]">{copy.description}</p>

      <div
        className="mt-6 w-full rounded-2xl border p-4 text-left"
        style={{ borderColor: styles.borderColor, background: "rgba(10,10,10,0.9)" }}
      >
        <div className="grid gap-3 text-sm">
          <div className="flex items-center justify-between gap-3">
            <span className="text-[#6B7785]">Side</span>
            <span className="font-semibold" style={{ color: isBuy ? "#10B981" : "#FB7185" }}>
              {side}
            </span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-[#6B7785]">Symbol</span>
            <span className="font-medium text-[#F3F7FB]">{symbol}</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-[#6B7785]">Quantity</span>
            <span className="font-medium text-[#F3F7FB]">{quantity}</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-[#6B7785]">Strategy</span>
            <span className="font-medium text-[#F3F7FB]">{strategyName ?? strategyTag}</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-[#6B7785]">Status</span>
            <span className="font-medium capitalize text-[#F3F7FB]">{statusLabel(outcome, polling)}</span>
          </div>
        </div>
      </div>

      {detailMessage && outcome === "queued" && !failureReason ? (
        <p
          className="mt-4 w-full rounded-xl border px-3 py-2.5 text-left text-xs leading-5"
          style={{
            borderColor: styles.detailBorder,
            background: styles.detailBg,
            color: styles.detailText,
          }}
        >
          {detailMessage}
        </p>
      ) : null}

      {failureReason ? (
        <p
          className="mt-4 w-full rounded-xl border px-3 py-2.5 text-left text-xs leading-5"
          style={{
            borderColor: TONE_STYLES.danger.detailBorder,
            background: TONE_STYLES.danger.detailBg,
            color: TONE_STYLES.danger.detailText,
          }}
        >
          {failureReason}
        </p>
      ) : null}

      {pollTimedOut && outcome === "queued" ? (
        <p className="mt-3 text-xs text-[#7E8B98]">
          Broker is still processing. Check{" "}
          <Link href="/dashboard/positions" className="text-purple-400 underline hover:text-purple-300">
            Open Positions
          </Link>{" "}
          for the latest fill status.
        </p>
      ) : null}

      {outcome === "executed" ? (
        <p className="mt-3 text-xs text-[#7E8B98]">
          View in{" "}
          <Link href="/dashboard/positions" className="text-purple-400 underline hover:text-purple-300">
            Open Positions
          </Link>
          .
        </p>
      ) : null}

      <button
        type="button"
        onClick={onDone}
        disabled={polling}
        className="mt-6 w-full rounded-2xl px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
        style={{ background: styles.accent }}
      >
        {polling ? "Waiting for broker…" : "Done"}
      </button>
    </div>
  );
}
