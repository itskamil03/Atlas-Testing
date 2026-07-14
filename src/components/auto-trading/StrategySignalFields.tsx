"use client";

import type { StrategySignalRequest } from "@/lib/types";

export type StrategySignalFormValues = {
  symbol: string;
  side: "BUY" | "SELL";
  quantity: string;
  confidence: string;
  orderType: "MARKET" | "LIMIT";
  broker: StrategySignalRequest["broker"];
};

type StrategySignalFieldsProps = {
  strategyTag: string;
  values: StrategySignalFormValues;
  onChange: (values: StrategySignalFormValues) => void;
  showSessionWarning?: boolean;
  compact?: boolean;
};

export function StrategySignalFields({
  strategyTag,
  values,
  onChange,
  showSessionWarning = false,
  compact = false,
}: StrategySignalFieldsProps) {
  const patch = (partial: Partial<StrategySignalFormValues>) => onChange({ ...values, ...partial });

  return (
    <div className={compact ? "grid gap-3 sm:grid-cols-2" : "grid gap-3 sm:grid-cols-2"}>
      {!compact ? (
        <div className="sm:col-span-2">
          <p className="text-xs uppercase tracking-[0.14em] text-[#8E9AAA]">Order execution</p>
          <h4 className="mt-1 text-lg font-semibold text-[#F3F7FB]">Send trade signal</h4>
        </div>
      ) : null}

      {showSessionWarning ? (
        <p className="sm:col-span-2 rounded-xl border border-[#4A4428] bg-[#2A2414] px-3 py-2.5 text-sm text-[#F5D98B]">
          Session is not running — start auto trading first, then send a signal.
        </p>
      ) : null}

      <label className="block text-sm text-[#9AA5B1] sm:col-span-2">
        Strategy tag
        <input
          value={strategyTag}
          readOnly
          className="mt-1 w-full rounded-xl border border-[#242D37] bg-[#0D1218] px-3 py-2 text-[#8E9AAA]"
        />
      </label>

      <label className="block text-sm text-[#9AA5B1]">
        Symbol
        <input
          value={values.symbol}
          onChange={(event) => patch({ symbol: event.target.value })}
          required
          className="mt-1 w-full rounded-xl border border-[#242D37] bg-[#0D1218] px-3 py-2 text-[#E8EEF5] outline-none focus:border-[#9BFF00]"
        />
      </label>

      <label className="block text-sm text-[#9AA5B1]">
        Side
        <select
          value={values.side}
          onChange={(event) => patch({ side: event.target.value as "BUY" | "SELL" })}
          className="mt-1 w-full rounded-xl border border-[#242D37] bg-[#0D1218] px-3 py-2 text-[#E8EEF5] outline-none focus:border-[#9BFF00]"
        >
          <option value="BUY">BUY</option>
          <option value="SELL">SELL</option>
        </select>
      </label>

      <label className="block text-sm text-[#9AA5B1]">
        Quantity
        <input
          type="number"
          min="0.0001"
          step="any"
          value={values.quantity}
          onChange={(event) => patch({ quantity: event.target.value })}
          required
          className="mt-1 w-full rounded-xl border border-[#242D37] bg-[#0D1218] px-3 py-2 text-[#E8EEF5] outline-none focus:border-[#9BFF00]"
        />
      </label>

      <label className="block text-sm text-[#9AA5B1]">
        Confidence (0–1)
        <input
          type="number"
          min="0"
          max="1"
          step="0.01"
          value={values.confidence}
          onChange={(event) => patch({ confidence: event.target.value })}
          required
          className="mt-1 w-full rounded-xl border border-[#242D37] bg-[#0D1218] px-3 py-2 text-[#E8EEF5] outline-none focus:border-[#9BFF00]"
        />
      </label>

      <label className="block text-sm text-[#9AA5B1]">
        Order type
        <select
          value={values.orderType}
          onChange={(event) => patch({ orderType: event.target.value as "MARKET" | "LIMIT" })}
          className="mt-1 w-full rounded-xl border border-[#242D37] bg-[#0D1218] px-3 py-2 text-[#E8EEF5] outline-none focus:border-[#9BFF00]"
        >
          <option value="MARKET">MARKET</option>
          <option value="LIMIT">LIMIT</option>
        </select>
      </label>

      <label className="block text-sm text-[#9AA5B1]">
        Broker
        <input
          value={values.broker}
          readOnly
          className="mt-1 w-full rounded-xl border border-[#242D37] bg-[#0D1218] px-3 py-2 capitalize text-[#8E9AAA]"
        />
      </label>
    </div>
  );
}

export function toStrategySignalRequest(
  strategyTag: string,
  values: StrategySignalFormValues,
): StrategySignalRequest {
  return {
    symbol: values.symbol.trim().toUpperCase(),
    side: values.side,
    confidence: Number(values.confidence),
    strategy_tag: strategyTag,
    broker: values.broker,
    quantity: values.quantity,
    order_type: values.orderType,
  };
}
