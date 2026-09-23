"use client";

import { Fragment, useMemo, useState } from "react";

import type { StrategyTradeHistoryItem } from "@/lib/types";

type StrategyTradeHistoryProps = {
  trades: StrategyTradeHistoryItem[];
  exchange: string;
};

function pnlClass(value: string | number) {
  return Number(value) >= 0 ? "text-emerald-400" : "text-rose-400";
}

function formatDateHeader(value: string) {
  return new Date(value).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  });
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
}

const OPEN_STATUSES = new Set(["OPEN", "PENDING", "PARTIALLY_FILLED"]);

export function StrategyTradeHistory({ trades, exchange }: StrategyTradeHistoryProps) {
  const [view, setView] = useState<"open" | "closed">("open");

  const filtered = useMemo(() => {
    return trades.filter((trade) => {
      const isOpen = OPEN_STATUSES.has(trade.status.toUpperCase());
      return view === "open" ? isOpen : !isOpen;
    });
  }, [trades, view]);

  const grouped = useMemo(() => {
    const groups = new Map<string, StrategyTradeHistoryItem[]>();
    for (const trade of filtered) {
      const key = trade.created_at.slice(0, 10);
      const list = groups.get(key) ?? [];
      list.push(trade);
      groups.set(key, list);
    }
    return Array.from(groups.entries()).sort(([a], [b]) => b.localeCompare(a));
  }, [filtered]);

  const totalPnl = filtered.reduce((sum, trade) => sum + Number(trade.pnl), 0);

  return (
    <section className="rounded-2xl border border-[#1A212A] bg-[#0A0A0A] p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold text-[#F3F7FB]">Trade History</h2>
        <div className="flex rounded-xl border border-[#26303A] p-1 text-xs">
          <button
            type="button"
            onClick={() => setView("open")}
            className={`rounded-lg px-4 py-1.5 font-medium transition ${
              view === "open" ? "bg-purple-600 text-white shadow-sm shadow-purple-600/30" : "text-[#A3AFBD] hover:text-white"
            }`}
          >
            Open
          </button>
          <button
            type="button"
            onClick={() => setView("closed")}
            className={`rounded-lg px-4 py-1.5 font-medium transition ${
              view === "closed" ? "bg-purple-600 text-white shadow-sm shadow-purple-600/30" : "text-[#A3AFBD] hover:text-white"
            }`}
          >
            Closed
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-[#212934]">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-[#212934] bg-[#0E141B] text-[11px] uppercase tracking-[0.08em] text-[#778493]">
            <tr>
              <th className="px-3 py-3">Symbol</th>
              <th className="px-3 py-3">Type</th>
              <th className="px-3 py-3">Qty</th>
              <th className="px-3 py-3">Entry</th>
              <th className="px-3 py-3">Exit</th>
              <th className="px-3 py-3">P&amp;L</th>
              <th className="px-3 py-3">Entry / Exit</th>
              <th className="px-3 py-3">Source</th>
            </tr>
          </thead>
          <tbody>
            {grouped.length > 0 ? (
              grouped.map(([dateKey, dayTrades]) => (
                <Fragment key={dateKey}>
                  <tr className="bg-[#0B1016]">
                    <td colSpan={8} className="px-3 py-2 text-xs font-semibold text-[#8E9AAA]">
                      {formatDateHeader(`${dateKey}T00:00:00`)}
                    </td>
                  </tr>
                  {dayTrades.map((trade) => (
                    <tr key={trade.id} className="border-t border-[#1D2530] text-[#C9D4E0]">
                      <td className="px-3 py-3 font-medium text-[#F3F7FB]">{trade.symbol}</td>
                      <td className="px-3 py-3">
                        <span
                          className={`rounded-md px-2 py-0.5 text-[11px] font-medium ${
                            trade.side === "BUY"
                              ? "bg-emerald-500/15 text-emerald-400"
                              : "bg-rose-500/15 text-rose-400"
                          }`}
                        >
                          {trade.side === "BUY" ? "Long" : "Short"}
                        </span>
                      </td>
                      <td className="px-3 py-3">{Number(trade.quantity).toFixed(4)}</td>
                      <td className="px-3 py-3">{Number(trade.entry_price).toFixed(2)}</td>
                      <td className="px-3 py-3">
                        {trade.exit_price ? Number(trade.exit_price).toFixed(2) : "—"}
                      </td>
                      <td className={`px-3 py-3 font-medium ${pnlClass(trade.pnl)}`}>
                        {Number(trade.pnl) >= 0 ? "+" : ""}
                        {Number(trade.pnl).toFixed(2)}
                      </td>
                      <td className="px-3 py-3 text-xs text-[#8E9AAA]">{formatDateTime(trade.created_at)}</td>
                      <td className="px-3 py-3 text-xs text-[#8E9AAA]">{exchange}</td>
                    </tr>
                  ))}
                </Fragment>
              ))
            ) : (
              <tr>
                <td colSpan={8}>
                  <div className="flex h-48 flex-col items-center justify-center text-center">
                    <p className="text-sm font-medium text-[#C9D4E0]">
                      No {view} trades in this period
                    </p>
                    <p className="mt-1 text-xs text-[#6B7785]">Try a wider date range.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {filtered.length > 0 ? (
        <p className={`mt-3 text-right text-sm font-semibold ${pnlClass(totalPnl)}`}>
          P&amp;L {totalPnl >= 0 ? "+" : ""}
          {totalPnl.toFixed(2)}
        </p>
      ) : null}
    </section>
  );
}
