"use client";

import { useMemo, useState } from "react";
import type { Trade } from "@/lib/types";

type Props = {
  trades: Trade[];
  onRefresh: () => void;
  onCloseTrade?: (trade: Trade) => void;
  closingTradeId?: number | null;
};

function pnlColor(value: string | number) {
  return Number(value) >= 0 ? "#9BFF00" : "#FB7185";
}

export function DashboardTradeHistory({ trades, onRefresh, onCloseTrade, closingTradeId }: Props) {
  const [filter, setFilter] = useState<"all" | "open">("all");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => trades.filter((t) => {
    if (filter === "open" && t.status.toUpperCase() !== "OPEN") return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return t.symbol.toLowerCase().includes(q) || t.side.toLowerCase().includes(q) ||
      (t.strategy_tag ?? "").toLowerCase().includes(q) || t.broker.toLowerCase().includes(q);
  }), [filter, search, trades]);

  return (
    <section
      className="rounded-2xl p-5 transition-colors duration-300"
      style={{ border: "1px solid var(--card-border)", backgroundColor: "var(--card-bg)" }}
    >
      {/* Header */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold" style={{ color: "var(--text-heading)" }}>Trade History</h2>
        <button type="button" onClick={onRefresh}
          className="rounded-xl bg-[#9BFF00] px-5 py-2 text-sm font-semibold text-[#11140D] transition hover:bg-[#B7FF45]">
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {["Symbol", "Source"].map((label) => (
          <select key={label}
            className="rounded-lg px-3 py-2 text-xs transition-colors duration-300"
            style={{ border: "1px solid var(--input-border)", backgroundColor: "var(--input-bg)", color: "var(--text-dim)" }}>
            <option>{label}</option>
            <option>All</option>
          </select>
        ))}
        <button type="button"
          className="rounded-lg px-3 py-2 text-xs transition-colors duration-300"
          style={{ border: "1px solid var(--input-border)", color: "var(--text-dim)" }}>
          Select Dates
        </button>
        <label
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs cursor-pointer transition-colors duration-300"
          style={{ border: "1px solid var(--input-border)", color: "var(--text-dim)" }}>
          <input type="radio" name="trade-filter" checked={filter === "open"}
            onChange={() => setFilter("open")} />
          Open
        </label>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Symbol, Trade type, etc"
          className="min-w-[180px] flex-1 rounded-lg px-3 py-2 text-xs outline-none transition-colors duration-300"
          style={{
            border: "1px solid var(--input-border)",
            backgroundColor: "var(--input-bg)",
            color: "var(--text-body)",
          }}
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl" style={{ border: "1px solid var(--card-border-subtle)" }}>
        <table className="min-w-full text-left text-sm">
          <thead
            className="text-[11px] uppercase tracking-[0.08em]"
            style={{
              borderBottom: "1px solid var(--card-border-subtle)",
              backgroundColor: "var(--table-header-bg)",
              color: "var(--text-faint)",
            }}
          >
            <tr>
              {["", "Symbol", "Trade Type", "Qty", "Entry Price", "Exit Price", "SL", "Target", "PNL", "Status", "Action"].map((h, i) => (
                <th key={i} className="px-3 py-3">
                  {i === 0 ? <input type="checkbox" aria-label="Select all" /> : h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length > 0 ? (
              filtered.map((trade) => {
                const isOpen = trade.status.toUpperCase() === "OPEN";
                return (
                  <tr key={trade.id} style={{ borderTop: "1px solid var(--card-border-inner)", color: "var(--text-body)" }}>
                    <td className="px-3 py-3">
                      <input type="checkbox" aria-label={`Select ${trade.symbol}`} />
                    </td>
                    <td className="px-3 py-3 font-medium">{trade.symbol}</td>
                    <td className="px-3 py-3" style={{ color: trade.side === "BUY" ? "#9BFF00" : "#FB7185" }}>
                      {trade.side}
                    </td>
                    <td className="px-3 py-3">{trade.quantity}</td>
                    <td className="px-3 py-3">{trade.price}</td>
                    <td className="px-3 py-3">{isOpen ? "—" : trade.price}</td>
                    <td className="px-3 py-3">{trade.stop_loss ?? "—"}</td>
                    <td className="px-3 py-3">{trade.take_profit ?? "—"}</td>
                    <td className="px-3 py-3 font-medium" style={{ color: pnlColor(trade.pnl) }}>{trade.pnl}</td>
                    <td className="px-3 py-3">{trade.status}</td>
                    <td className="px-3 py-3">
                      {isOpen && onCloseTrade ? (
                        <button type="button" disabled={closingTradeId === trade.id}
                          onClick={() => onCloseTrade(trade)}
                          className="rounded-lg px-2.5 py-1 text-xs font-semibold transition disabled:opacity-50"
                          style={{ border: "1px solid rgba(251,113,133,0.4)", color: "#FB7185" }}>
                          {closingTradeId === trade.id ? "Closing..." : "Close"}
                        </button>
                      ) : "—"}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={11}>
                  <div className="flex h-64 flex-col items-center justify-center text-center transition-colors duration-300"
                    style={{ backgroundColor: "var(--table-empty-bg)" }}>
                    <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-full border border-dashed"
                      style={{ borderColor: "var(--empty-border)" }}>
                      <div className="h-14 w-14 rounded-full border border-dashed"
                        style={{ borderColor: "var(--empty-border)" }} />
                    </div>
                    <p className="text-lg font-semibold" style={{ color: "var(--text-heading)" }}>
                      You have no Open trades!
                    </p>
                    <p className="text-sm" style={{ color: "var(--text-faint)" }}>
                      Open trades will appear here.
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}