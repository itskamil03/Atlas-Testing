"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

import { AutomatedStrategyNav } from "@/components/auto-trading/AutomatedStrategyNav";
import { DataTable } from "@/components/auto-trading/DataTable";
import { FeedbackBanner } from "@/components/auto-trading/FeedbackBanner";
import { StatusBadge } from "@/components/auto-trading/StatusBadge";
import { getAccessToken } from "@/lib/auth";
import type { SignalHistoryItem } from "@/lib/types";
import { useAutomatedStrategyDashboardStore } from "@/store/useAutomatedStrategyDashboardStore";

export default function AutomatedStrategySignalsPage() {
  const router = useRouter();
  const params = useParams<{ id?: string | string[] }>();
  const strategyId = Number(Array.isArray(params.id) ? params.id[0] : params.id);
  const { strategy, signals, signalsTotal, loading, error, loadSignals } = useAutomatedStrategyDashboardStore();

  useEffect(() => {
    if (!getAccessToken()) {
      router.push("/login");
      return;
    }
    if (Number.isFinite(strategyId) && strategyId > 0) {
      void loadSignals(strategyId);
    }
  }, [loadSignals, router, strategyId]);

  return (
    <div className="mx-auto w-full max-w-[1320px] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-[#1A212A] bg-[linear-gradient(135deg,#0A1017,#070A10)] px-5 py-4 shadow-[0_18px_40px_rgba(0,0,0,0.28)]">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-[#8E9AAA]">Signal history</p>
          <h1 className="mt-1 text-2xl font-semibold text-[#F3F7FB]">{strategy?.name ?? "Signals"}</h1>
          <p className="mt-1 text-sm text-[#93A0AE]">Every signal received for this strategy.</p>
        </div>
        <AutomatedStrategyNav strategyId={strategyId} active="signals" />
      </div>

      <FeedbackBanner error={error} />

      <section className="rounded-[28px] border border-[#1A212A] bg-[#070A10] p-5">
        <div className="mb-4 text-sm text-[#8E9AAA]">
          {loading ? "Loading signals..." : `Showing ${signals.length} of ${signalsTotal} signals`}
        </div>
        <DataTable<SignalHistoryItem>
          rows={signals}
          emptyMessage="No signals received yet."
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
              key: "status",
              header: "Status",
              render: (row) => <StatusBadge status={row.status} />,
            },
          ]}
        />
      </section>
    </div>
  );
}
