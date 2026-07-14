"use client";

import { useMemo, useState } from "react";

import {
  DateRangePicker,
  formatDateRangeLabel,
  type DateRangeValue,
} from "@/components/broker/DateRangePicker";
import type { Trade } from "@/lib/types";

type PositionFilter = "open" | "closed" | "pending" | "rejected" | "all";

type BrokerPositionsTableProps = {
  trades: Trade[];
  loading?: boolean;
  onRefresh: () => void;
  onCloseTrade?: (trade: Trade) => void;
  closingTradeId?: number | null;
};

function normalizeStatus(status: string) {
  return status.trim().toUpperCase();
}

function isOpenStatus(status: string) {
  const value = normalizeStatus(status);
  return ["OPEN", "FILLED", "PARTIALLY_FILLED"].includes(value);
}

function isClosedStatus(status: string) {
  return normalizeStatus(status) === "CLOSED";
}

function isPendingStatus(status: string) {
  return normalizeStatus(status) === "PENDING";
}

function isRejectedStatus(status: string) {
  const value = normalizeStatus(status);
  return ["FAILED", "REJECTED", "CANCELLED"].includes(value);
}

function pnlClass(value: string | number) {
  return Number(value) >= 0 ? "text-[#9BFF00]" : "text-[#FB7185]";
}

function sideClass(side: string) {
  return side.toUpperCase() === "BUY" ? "text-[#9BFF00]" : "text-[#FB7185]";
}

function exportTradesCsv(trades: Trade[]) {
  const headers = ["Trade ID", "Symbol", "Side", "Qty", "Entry", "P/L", "Status", "Source", "Created"];
  const rows = trades.map((trade) => [
    trade.id,
    trade.symbol,
    trade.side,
    trade.quantity,
    trade.price,
    trade.pnl,
    trade.status,
    trade.strategy_tag || trade.broker,
    trade.created_at,
  ]);
  const csv = [headers, ...rows].map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "broker-positions.csv";
  link.click();
  URL.revokeObjectURL(url);
}

function SummaryCard({
  label,
  value,
  tone,
  active = false,
}: {
  label: string;
  value: number;
  tone: "green" | "red" | "orange";
  active?: boolean;
}) {
  const borderClass =
    tone === "green"
      ? "border-[#9BFF00]/40 bg-[#0A1208]"
      : tone === "orange"
        ? "border-[#F59E0B]/40 bg-[#141008]"
        : "border-[#FB7185]/35 bg-[#140A0A]";

  return (
    <article
      className={`rounded-2xl border px-5 py-4 transition ${borderClass} ${
        active ? "ring-1 ring-[#9BFF00]/50" : ""
      }`}
    >
      <p className="text-sm text-[#8E9AAA]">{label}</p>
      <p className="mt-2 text-[32px] font-semibold leading-none text-[#F3F7FB]">{value}</p>
    </article>
  );
}

function matchesCommonFilters(
  trade: Trade,
  {
    symbolFilter,
    sourceFilter,
    dateRange,
    search,
  }: {
    symbolFilter: string;
    sourceFilter: string;
    dateRange: DateRangeValue;
    search: string;
  },
) {
  if (symbolFilter !== "All" && trade.symbol !== symbolFilter) return false;
  const source = trade.strategy_tag || trade.broker;
  if (sourceFilter !== "All" && source !== sourceFilter) return false;
  if (dateRange.from || dateRange.to) {
    const tradeDate = new Date(trade.created_at);
    if (dateRange.from && tradeDate < dateRange.from) return false;
    if (dateRange.to && tradeDate > dateRange.to) return false;
  }
  if (search.trim()) {
    const q = search.toLowerCase();
    const matches =
      String(trade.id).includes(q) ||
      trade.broker_order_id.toLowerCase().includes(q) ||
      trade.symbol.toLowerCase().includes(q);
    if (!matches) return false;
  }
  return true;
}

export function BrokerPositionsTable({
  trades,
  loading = false,
  onRefresh,
  onCloseTrade,
  closingTradeId,
}: BrokerPositionsTableProps) {
  const [positionFilter, setPositionFilter] = useState<PositionFilter>("open");
  const [symbolFilter, setSymbolFilter] = useState("All");
  const [sourceFilter, setSourceFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [dateRange, setDateRange] = useState<DateRangeValue>({ from: null, to: null });
  const [dateLabel, setDateLabel] = useState("Select Dates");

  const symbols = useMemo(() => {
    const unique = Array.from(new Set(trades.map((trade) => trade.symbol))).sort();
    return ["All", ...unique];
  }, [trades]);

  const sources = useMemo(() => {
    const unique = Array.from(
      new Set(trades.map((trade) => trade.strategy_tag || trade.broker).filter(Boolean)),
    ).sort();
    return ["All", ...unique];
  }, [trades]);

  const filterContext = useMemo(
    () => ({ symbolFilter, sourceFilter, dateRange, search }),
    [dateRange, search, sourceFilter, symbolFilter],
  );

  const tradesMatchingFilters = useMemo(
    () => trades.filter((trade) => matchesCommonFilters(trade, filterContext)),
    [filterContext, trades],
  );

  const counts = useMemo(
    () => ({
      open: tradesMatchingFilters.filter((trade) => isOpenStatus(trade.status)).length,
      closed: tradesMatchingFilters.filter((trade) => isClosedStatus(trade.status)).length,
      pending: tradesMatchingFilters.filter((trade) => isPendingStatus(trade.status)).length,
      rejected: tradesMatchingFilters.filter((trade) => isRejectedStatus(trade.status)).length,
    }),
    [tradesMatchingFilters],
  );

  const filtered = useMemo(() => {
    return tradesMatchingFilters.filter((trade) => {
      if (positionFilter === "all") return true;
      if (positionFilter === "open") return isOpenStatus(trade.status);
      if (positionFilter === "closed") return isClosedStatus(trade.status);
      if (positionFilter === "pending") return isPendingStatus(trade.status);
      if (positionFilter === "rejected") return isRejectedStatus(trade.status);
      return true;
    });
  }, [positionFilter, tradesMatchingFilters]);

  const showEmptyOpenState = positionFilter === "open" && filtered.length === 0;

  return (
    <div className="space-y-4">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <button type="button" onClick={() => setPositionFilter("open")} className="text-left">
          <SummaryCard label="Open Positions" value={counts.open} tone="green" active={positionFilter === "open"} />
        </button>
        <button type="button" onClick={() => setPositionFilter("closed")} className="text-left">
          <SummaryCard label="Closed Positions" value={counts.closed} tone="red" active={positionFilter === "closed"} />
        </button>
        <button type="button" onClick={() => setPositionFilter("pending")} className="text-left">
          <SummaryCard label="Pending Orders" value={counts.pending} tone="orange" active={positionFilter === "pending"} />
        </button>
        <button type="button" onClick={() => setPositionFilter("rejected")} className="text-left">
          <SummaryCard label="Rejected Orders" value={counts.rejected} tone="red" active={positionFilter === "rejected"} />
        </button>
      </section>

      <section className="rounded-2xl border border-[#1A212A] bg-[#0A0A0A] p-4 sm:p-5">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <select
            value={symbolFilter}
            onChange={(e) => setSymbolFilter(e.target.value)}
            className="rounded-lg border border-[#26303A] bg-[#070A10] px-3 py-2 text-xs text-[#A3AFBD]"
          >
            {symbols.map((symbol) => (
              <option key={symbol} value={symbol}>
                {symbol === "All" ? "Symbol" : symbol}
              </option>
            ))}
          </select>
          <select
            value={positionFilter}
            onChange={(e) => setPositionFilter(e.target.value as PositionFilter)}
            className="rounded-lg border border-[#26303A] bg-[#070A10] px-3 py-2 text-xs text-[#A3AFBD]"
          >
            <option value="all">All</option>
            <option value="open">Open</option>
            <option value="closed">Closed</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
          </select>
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="rounded-lg border border-[#26303A] bg-[#070A10] px-3 py-2 text-xs text-[#A3AFBD]"
          >
            {sources.map((source) => (
              <option key={source} value={source}>
                {source === "All" ? "Source" : source}
              </option>
            ))}
          </select>
          <div className="relative">
            <button
              type="button"
              onClick={() => setDatePickerOpen(true)}
              className="flex items-center gap-2 rounded-lg border border-[#26303A] px-3 py-2 text-xs text-[#A3AFBD] hover:text-[#D5DEE8]"
            >
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="5" width="18" height="16" rx="2" />
                <path d="M8 3v4M16 3v4M3 10h18" />
              </svg>
              {dateLabel}
            </button>
            <DateRangePicker
              open={datePickerOpen}
              value={dateRange}
              onClose={() => setDatePickerOpen(false)}
              onApply={(range, presetLabel) => {
                setDateRange(range);
                setDateLabel(
                  presetLabel === "all_time" ? "All time" : formatDateRangeLabel(range),
                );
              }}
            />
          </div>
          <button
            type="button"
            onClick={onRefresh}
            disabled={loading}
            className="rounded-xl bg-[#9BFF00] px-5 py-2 text-xs font-semibold text-[#11140D] disabled:opacity-60"
          >
            {loading ? "Refreshing..." : "Refresh"}
          </button>

          <div className="ml-auto flex items-center gap-2">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Order ID, Trade ID"
              className="min-w-[180px] rounded-lg border border-[#26303A] bg-[#070A10] px-3 py-2 text-xs text-[#D5DEE8] placeholder:text-[#5C6775]"
            />
            <button
              type="button"
              onClick={() => exportTradesCsv(filtered)}
              className="rounded-lg border border-[#26303A] p-2 text-[#A3AFBD] hover:text-[#D5DEE8]"
              aria-label="Download CSV"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 3v12M7 10l5 5 5-5M5 21h14" />
              </svg>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-[#212934]">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-[#212934] bg-[#0E141B] text-[11px] uppercase tracking-[0.08em] text-[#778493]">
              <tr>
                <th className="px-3 py-3">
                  <input type="checkbox" aria-label="Select all" />
                </th>
                <th className="px-3 py-3">
                  Symbol <span className="text-[#9BFF00]">{filtered.length}</span>
                </th>
                <th className="px-3 py-3">Trade type</th>
                <th className="px-3 py-3">Qty</th>
                <th className="px-3 py-3">Entry price</th>
                <th className="px-3 py-3">Mkt price</th>
                <th className="px-3 py-3">SL</th>
                <th className="px-3 py-3">Target</th>
                <th className="px-3 py-3">P/L</th>
                <th className="px-3 py-3">Entry</th>
                <th className="px-3 py-3">Exit</th>
                <th className="px-3 py-3">Source</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? (
                filtered.map((trade) => {
                  const isOpen = isOpenStatus(trade.status);
                  const source = trade.strategy_tag || trade.broker;
                  return (
                    <tr key={trade.id} className="border-t border-[#1D2530] text-[#C9D4E0]">
                      <td className="px-3 py-3">
                        <input type="checkbox" aria-label={`Select trade ${trade.id}`} />
                      </td>
                      <td className="px-3 py-3 font-medium">{trade.symbol}</td>
                      <td className={`px-3 py-3 ${sideClass(trade.side)}`}>{trade.side}</td>
                      <td className="px-3 py-3">{trade.quantity}</td>
                      <td className="px-3 py-3">{trade.price}</td>
                      <td className="px-3 py-3">{isOpen ? "—" : trade.price}</td>
                      <td className="px-3 py-3">{trade.stop_loss ?? "—"}</td>
                      <td className="px-3 py-3">{trade.take_profit ?? "—"}</td>
                      <td className={`px-3 py-3 ${pnlClass(trade.pnl)}`}>{trade.pnl}</td>
                      <td className="px-3 py-3 text-[#93A0AE]">
                        {new Date(trade.created_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </td>
                      <td className="px-3 py-3">
                        {isOpen && onCloseTrade ? (
                          <button
                            type="button"
                            disabled={closingTradeId === trade.id}
                            onClick={() => onCloseTrade(trade)}
                            className="rounded-lg border border-[#FB7185]/40 px-2.5 py-1 text-xs font-semibold text-[#FB7185] hover:bg-[#FB7185]/10 disabled:opacity-50"
                          >
                            {closingTradeId === trade.id ? "Closing..." : "Close"}
                          </button>
                        ) : isClosedStatus(trade.status) ? (
                          <span className="text-[#93A0AE]">{trade.price}</span>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="px-3 py-3 text-[#93A0AE]">{source}</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={12}>
                    <div className="flex h-72 flex-col items-center justify-center bg-[#060A10] text-center">
                      <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-full border border-dashed border-[#27303A]">
                        <div className="h-14 w-14 rounded-full border border-dashed border-[#27303A]" />
                      </div>
                      <p className="text-lg font-semibold text-[#E7EEF6]">
                        {showEmptyOpenState ? "You have no Open trades!" : "No trades found"}
                      </p>
                      <p className="text-sm text-[#7F8B98]">
                        {showEmptyOpenState
                          ? "Open trades will appear here."
                          : "Try changing filters or refresh the page."}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
