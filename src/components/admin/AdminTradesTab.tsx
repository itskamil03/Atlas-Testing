"use client";

import { useCallback, useEffect, useState } from "react";

import { api } from "@/lib/api";
import { extractApiErrorMessage } from "@/lib/errors";
import type { AdminTradeItem, AdminTradeListResponse } from "@/lib/types";

type Props = {
  onMessage?: (message: string) => void;
};

export function AdminTradesTab({ onMessage }: Props) {
  const [items, setItems] = useState<AdminTradeItem[]>([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<AdminTradeListResponse>("/admin/trades", {
        params: {
          page: 1,
          page_size: 50,
          status_filter: statusFilter || undefined,
          search: search || undefined,
        },
      });
      setItems(res.data.items);
    } catch (err: unknown) {
      setError(extractApiErrorMessage(err, "Unable to load trades."));
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    void load();
  }, [load]);

  const syncTrades = async () => {
    try {
      const res = await api.post<{ message: string }>("/admin/trades/sync");
      onMessage?.(res.data.message);
      await load();
    } catch (err: unknown) {
      setError(extractApiErrorMessage(err, "Sync failed."));
    }
  };

  const manualClose = async (tradeId: number) => {
    setBusyId(tradeId);
    try {
      const res = await api.post<{ message: string }>(`/admin/trades/${tradeId}/manual-close`, {
        close_price: null,
      });
      onMessage?.(res.data.message);
      await load();
    } catch (err: unknown) {
      setError(extractApiErrorMessage(err, "Manual close failed."));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <section className="mt-5 rounded-[24px] border border-[#1A212A] bg-[#0B1118] p-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-[#F3F7FB]">Trade Management</h2>
          <p className="mt-1 text-sm text-[#8E9AAA]">Monitor platform trades, sync broker status, and force-close positions.</p>
        </div>
        <button type="button" onClick={() => void syncTrades()} className="rounded-xl bg-[#9BFF00] px-4 py-2 text-sm font-semibold text-[#11140D]">
          Sync with Broker
        </button>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value.toUpperCase())}
          placeholder="Search symbol or strategy"
          className="rounded-xl border border-[#24303A] bg-[#0E141B] px-3 py-2 text-sm text-[#F3F7FB]"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-xl border border-[#24303A] bg-[#0E141B] px-3 py-2 text-sm text-[#F3F7FB]"
        >
          <option value="">All statuses</option>
          <option value="OPEN">OPEN</option>
          <option value="PENDING">PENDING</option>
          <option value="CLOSED">CLOSED</option>
          <option value="FAILED">FAILED</option>
          <option value="CANCELLED">CANCELLED</option>
        </select>
        <button type="button" onClick={() => void load()} className="rounded-xl border border-[#24303A] px-4 py-2 text-sm text-[#F3F7FB]">
          Refresh
        </button>
      </div>

      {error ? <p className="mt-4 rounded-xl border border-[#4F2A2A] bg-[#2A1414] px-3 py-2 text-sm text-[#FFB4B4]">{error}</p> : null}
      {loading ? <p className="mt-4 text-sm text-[#8E9AAA]">Loading trades...</p> : null}

      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="text-xs uppercase tracking-wide text-[#8E9AAA]">
            <tr>
              <th className="px-3 py-2">ID</th>
              <th className="px-3 py-2">User</th>
              <th className="px-3 py-2">Symbol</th>
              <th className="px-3 py-2">Side</th>
              <th className="px-3 py-2">Qty</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">PnL</th>
              <th className="px-3 py-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {items.map((trade) => (
              <tr key={trade.id} className="border-t border-[#1A212A] text-[#D7E0EA]">
                <td className="px-3 py-3">{trade.id}</td>
                <td className="px-3 py-3">{trade.user_id}</td>
                <td className="px-3 py-3">{trade.symbol}</td>
                <td className="px-3 py-3">{trade.side}</td>
                <td className="px-3 py-3">{trade.quantity}</td>
                <td className="px-3 py-3">{trade.status}</td>
                <td className="px-3 py-3">{trade.pnl}</td>
                <td className="px-3 py-3">
                  {["OPEN", "PENDING", "PARTIALLY_FILLED"].includes(trade.status) ? (
                    <button
                      type="button"
                      disabled={busyId === trade.id}
                      onClick={() => void manualClose(trade.id)}
                      className="rounded-lg border border-[#4F2A2A] px-2 py-1 text-xs text-[#FFB4B4]"
                    >
                      Close
                    </button>
                  ) : (
                    "—"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
