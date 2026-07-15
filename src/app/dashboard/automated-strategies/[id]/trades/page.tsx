"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { AutomatedStrategyNav } from "@/components/auto-trading/AutomatedStrategyNav";
import { ConfirmModal } from "@/components/auto-trading/ConfirmModal";
import { DataTable } from "@/components/auto-trading/DataTable";
import { FeedbackBanner } from "@/components/auto-trading/FeedbackBanner";
import { StatusBadge } from "@/components/auto-trading/StatusBadge";
import { getAccessToken } from "@/lib/auth";
import { pnlClass } from "@/lib/automatedStrategy";
import type { StrategyOrderItem } from "@/lib/types";
import { useAutomatedStrategyDashboardStore } from "@/store/useAutomatedStrategyDashboardStore";

export default function AutomatedStrategyTradesPage() {
  const router = useRouter();
  const params = useParams<{ id?: string | string[] }>();
  const strategyId = Number(Array.isArray(params.id) ? params.id[0] : params.id);
  const {
    strategy,
    orders,
    loading,
    actionLoading,
    error,
    message,
    loadOrders,
    closeOrder,
  } = useAutomatedStrategyDashboardStore();
  const [pendingClose, setPendingClose] = useState<StrategyOrderItem | null>(null);

  useEffect(() => {
    if (!getAccessToken()) {
      router.push("/login");
      return;
    }
    if (Number.isFinite(strategyId) && strategyId > 0) {
      void loadOrders(strategyId);
    }
  }, [loadOrders, router, strategyId]);

  const canClose = (row: StrategyOrderItem) =>
    row.is_open === true || (!row.closed_at && row.status === "filled" && row.pnl_type !== "realized");

  return (
    <div className="mx-auto w-full max-w-[1320px] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-[#1A212A] bg-[linear-gradient(135deg,#0A1017,#070A10)] px-5 py-4 shadow-[0_18px_40px_rgba(0,0,0,0.28)]">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-[#8E9AAA]">Trade history</p>
          <h1 className="mt-1 text-2xl font-semibold text-[#F3F7FB]">{strategy?.name ?? "Trades"}</h1>
        </div>
        <AutomatedStrategyNav strategyId={strategyId} active="trades" />
      </div>

      <FeedbackBanner error={error} message={message} />

      <section className="rounded-[28px] border border-[#1A212A] bg-[#070A10] p-5">
        <div className="mb-4 text-sm text-[#8E9AAA]">
          {loading ? "Loading trades..." : `${orders.length} trade records`}
        </div>
        <DataTable<StrategyOrderItem>
          rows={orders}
          emptyMessage="No trades executed yet."
          getRowKey={(row) => row.id}
          columns={[
            {
              key: "time",
              header: "Time",
              render: (row) => new Date(row.created_at).toLocaleString(),
            },
            {
              key: "symbol",
              header: "Symbol",
              render: (row) => row.symbol,
            },
            {
              key: "side",
              header: "Side",
              render: (row) => row.side,
            },
            {
              key: "quantity",
              header: "Quantity",
              render: (row) => row.quantity,
            },
            {
              key: "pnl",
              header: "PnL",
              render: (row) => (
                <span className={pnlClass(row.pnl)}>
                  {row.pnl}
                  {row.is_open ? " (U)" : ""}
                </span>
              ),
            },
            {
              key: "mark",
              header: "Mark",
              render: (row) => row.mark_price ?? "—",
            },
            {
              key: "status",
              header: "Status",
              render: (row) => <StatusBadge status={row.status} />,
            },
            {
              key: "actions",
              header: "Action",
              render: (row) =>
                canClose(row) ? (
                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={() => setPendingClose(row)}
                    className="rounded-xl border border-[#FB7185]/40 px-3 py-1.5 text-xs font-semibold text-[#FB7185] transition hover:bg-[#FB7185]/10 disabled:opacity-60"
                  >
                    Close
                  </button>
                ) : (
                  <span className="text-xs text-[#6B7785]">—</span>
                ),
            },
          ]}
        />
      </section>

      {pendingClose ? (
        <ConfirmModal
          open
          title="Close this trade?"
          message={`A market ${pendingClose.side === "BUY" ? "SELL" : "BUY"} order will be sent to your broker to close ${pendingClose.quantity} ${pendingClose.symbol}.`}
          confirmLabel="Close at market"
          destructive
          loading={actionLoading}
          onCancel={() => setPendingClose(null)}
          onConfirm={() => {
            void closeOrder(strategyId, pendingClose).then((ok) => {
              if (ok) setPendingClose(null);
            });
          }}
        />
      ) : null}
    </div>
  );
}
