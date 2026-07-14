"use client";

import { FormEvent, useState } from "react";

import {
  StrategySignalFields,
  toStrategySignalRequest,
  type StrategySignalFormValues,
} from "@/components/auto-trading/StrategySignalFields";
import { sendStrategySignal } from "@/lib/api";
import { extractApiErrorMessage } from "@/lib/errors";
import type { AutomatedStrategyItem, StrategySignalRequest } from "@/lib/types";

type SendStrategySignalFormProps = {
  strategy: AutomatedStrategyItem;
  sessionRunning: boolean;
  onSent?: () => void;
};

export function SendStrategySignalForm({
  strategy,
  sessionRunning,
  onSent,
}: SendStrategySignalFormProps) {
  const strategyTag = strategy.strategy_tag?.trim() ?? "";
  const broker = (strategy.broker?.toLowerCase() || "delta") as StrategySignalRequest["broker"];

  const [values, setValues] = useState<StrategySignalFormValues>({
    symbol: strategy.symbol || "BTCUSD",
    side: "BUY",
    quantity: Number(strategy.quantity_per_trade) > 0 ? String(strategy.quantity_per_trade) : "1",
    confidence: "0.82",
    orderType: "MARKET",
    broker,
  });
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFeedback(null);

    if (!strategyTag) {
      setFeedback({ type: "error", text: "This deployment has no strategy tag. Redeploy from marketplace." });
      return;
    }

    if (!sessionRunning) {
      setFeedback({
        type: "error",
        text: "Auto-trading session is not running. Click Start before sending a signal.",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await sendStrategySignal(toStrategySignalRequest(strategyTag, values));
      setFeedback({
        type: "success",
        text: response.data.message || "Signal sent. Order will be processed for your deployed strategy.",
      });
      onSent?.();
    } catch (err) {
      setFeedback({
        type: "error",
        text: extractApiErrorMessage(err, "Unable to send signal."),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="rounded-[28px] border border-[#1A212A] bg-[#070A10] p-5">
      <form onSubmit={(event) => void handleSubmit(event)}>
        <StrategySignalFields
          strategyTag={strategyTag}
          values={values}
          onChange={setValues}
          showSessionWarning={!sessionRunning}
        />

        <div className="mt-4">
          <button
            type="submit"
            disabled={loading || !strategyTag}
            className="w-full rounded-2xl bg-[#9BFF00] px-4 py-3 text-sm font-semibold text-[#11140D] transition hover:bg-[#B7FF45] disabled:opacity-60"
          >
            {loading ? "Sending signal..." : "Send signal & punch order"}
          </button>
        </div>
      </form>

      {feedback ? (
        <p
          className={`mt-4 rounded-xl border px-3 py-2.5 text-sm ${
            feedback.type === "success"
              ? "border-[#31503A] bg-[#142419] text-[#AEE7B8]"
              : "border-[#4F2A2A] bg-[#2A1414] text-[#FFB4B4]"
          }`}
        >
          {feedback.text}
        </p>
      ) : null}
    </section>
  );
}
