"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

import { AutomatedStrategyNav } from "@/components/auto-trading/AutomatedStrategyNav";
import { DataTable } from "@/components/auto-trading/DataTable";
import { FeedbackBanner } from "@/components/auto-trading/FeedbackBanner";
import type { AutoTradingLogItem } from "@/lib/types";
import { getAccessToken } from "@/lib/auth";
import { useAutomatedStrategyDashboardStore } from "@/store/useAutomatedStrategyDashboardStore";

const HIGHLIGHT_EVENTS = new Set([
  "SESSION_STARTED",
  "SESSION_STOPPED",
  "SIGNAL_RECEIVED",
  "TRADE_CREATED",
  "TRADE_EXECUTED",
  "TRADE_FAILED",
  "DEPLOY_STARTED",
  "DEPLOY_COMPLETED",
]);

function logRowClass(row: AutoTradingLogItem) {
  const event = (row.signal_type ?? row.event_type ?? "").toUpperCase();
  if (!HIGHLIGHT_EVENTS.has(event)) return "";
  if (event.includes("FAILED") || event.includes("STOPPED")) {
    return "bg-[#2A1414]/40";
  }
  if (event.includes("EXECUTED") || event.includes("COMPLETED") || event.includes("STARTED")) {
    return "bg-[#142419]/40";
  }
  return "bg-[#1A2410]/40";
}

export default function AutomatedStrategyLogsPage() {
  const router = useRouter();
  const params = useParams<{ id?: string | string[] }>();
  const strategyId = Number(Array.isArray(params.id) ? params.id[0] : params.id);
  const { strategy, logs, logsTotal, loading, error, loadLogs } = useAutomatedStrategyDashboardStore();

  useEffect(() => {
    if (!getAccessToken()) {
      router.push("/login");
      return;
    }
    if (Number.isFinite(strategyId) && strategyId > 0) {
      void loadLogs(strategyId);
    }
  }, [loadLogs, router, strategyId]);

  return (
    <div className="mx-auto w-full max-w-[1320px] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-[#1A212A] bg-[linear-gradient(135deg,#0A1017,#070A10)] px-5 py-4 shadow-[0_18px_40px_rgba(0,0,0,0.28)]">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-[#8E9AAA]">Auto trading logs</p>
          <h1 className="mt-1 text-2xl font-semibold text-[#F3F7FB]">{strategy?.name ?? "Logs"}</h1>
          <p className="mt-1 text-sm text-[#93A0AE]">Lifecycle, signal, and execution events for this strategy.</p>
        </div>
        <AutomatedStrategyNav strategyId={strategyId} active="logs" />
      </div>

      <FeedbackBanner error={error} />

      <section className="rounded-[28px] border border-[#1A212A] bg-[#070A10] p-5">
        <div className="mb-4 text-sm text-[#8E9AAA]">
          {loading ? "Loading logs..." : `Showing ${logs.length} of ${logsTotal} log entries`}
        </div>
        <DataTable<AutoTradingLogItem>
          rows={logs}
          emptyMessage="No auto trading logs yet."
          getRowKey={(row) => row.id}
          getRowClassName={logRowClass}
          columns={[
            {
              key: "timestamp",
              header: "Time",
              render: (row) => new Date(row.created_at).toLocaleString(),
            },
            {
              key: "event",
              header: "Event type",
              render: (row) => row.signal_type ?? row.event_type,
            },
            {
              key: "symbol",
              header: "Symbol",
              render: (row) => row.symbol ?? "-",
            },
            {
              key: "side",
              header: "Side",
              render: (row) => row.side ?? "-",
            },
            {
              key: "quantity",
              header: "Quantity",
              render: (row) => row.quantity ?? "-",
            },
            {
              key: "execution_status",
              header: "Execution status",
              render: (row) => row.execution_status,
            },
            {
              key: "message",
              header: "Message",
              render: (row) => row.message ?? "-",
            },
          ]}
        />
      </section>
    </div>
  );
}
