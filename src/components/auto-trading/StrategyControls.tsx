"use client";

import { useState } from "react";

import { ConfirmModal } from "@/components/auto-trading/ConfirmModal";
import { StatusBadge } from "@/components/auto-trading/StatusBadge";

type StrategyControlsProps = {
  status: string;
  loading?: boolean;
  showUndeploy?: boolean;
  onStart: () => void;
  onStop: () => void;
  onPause: () => void;
  onResume: () => void;
  onUndeploy?: () => void;
};

type PendingAction = "pause" | "resume" | "stop" | "undeploy" | null;

export function StrategyControls({
  status,
  loading = false,
  showUndeploy = false,
  onStart,
  onStop,
  onPause,
  onResume,
  onUndeploy,
}: StrategyControlsProps) {
  const normalized = status.toUpperCase();
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);

  const confirmConfig = {
    pause: {
      title: "Pause auto trading?",
      message: "Signal processing will pause until you resume this strategy.",
      confirmLabel: "Pause",
      destructive: false,
      onConfirm: onPause,
    },
    resume: {
      title: "Resume auto trading?",
      message: "The strategy will start processing signals again.",
      confirmLabel: "Resume",
      destructive: false,
      onConfirm: onResume,
    },
    stop: {
      title: "Stop auto trading?",
      message: "This will stop the live session for this strategy.",
      confirmLabel: "Stop",
      destructive: true,
      onConfirm: onStop,
    },
    undeploy: {
      title: "Undeploy strategy?",
      message: "This removes the deployment, stops auto trading, and deactivates your subscription.",
      confirmLabel: "Undeploy",
      destructive: true,
      onConfirm: onUndeploy ?? (() => undefined),
    },
  } as const;

  const activeConfirm = pendingAction ? confirmConfig[pendingAction] : null;

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <p className="text-sm text-[#93A0AE]">Live status</p>
          <StatusBadge status={status} pulse={normalized === "RUNNING" || normalized === "ACTIVE"} />
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            disabled={loading}
            onClick={onStart}
            className="rounded-2xl bg-[#9BFF00] px-5 py-3 font-semibold text-[#11140D] transition hover:bg-[#B7FF45] disabled:opacity-60"
          >
            Start
          </button>
          <button
            disabled={loading}
            onClick={() => setPendingAction("pause")}
            className="rounded-2xl border border-[#4A4428] bg-[#2A2414] px-5 py-3 font-semibold text-[#F5D98B] transition hover:border-[#6A6038] disabled:opacity-60"
          >
            Pause
          </button>
          <button
            disabled={loading}
            onClick={() => setPendingAction("resume")}
            className="rounded-2xl border border-[#31503A] bg-[#142419] px-5 py-3 font-semibold text-[#AEE7B8] transition hover:border-[#456B50] disabled:opacity-60"
          >
            Resume
          </button>
          <button
            disabled={loading}
            onClick={() => setPendingAction("stop")}
            className="rounded-2xl border border-[#2A313A] bg-[#0D1218] px-5 py-3 font-semibold text-[#E8EEF5] transition hover:border-[#3A4551] disabled:opacity-60"
          >
            Stop
          </button>
          {showUndeploy && onUndeploy ? (
            <button
              disabled={loading}
              onClick={() => setPendingAction("undeploy")}
              className="rounded-2xl border border-[#4F2A2A] bg-[#2A1414] px-5 py-3 font-semibold text-[#FFB4B4] transition hover:border-[#653535] disabled:opacity-60"
            >
              Undeploy
            </button>
          ) : null}
        </div>
      </div>

      {activeConfirm ? (
        <ConfirmModal
          open
          title={activeConfirm.title}
          message={activeConfirm.message}
          confirmLabel={activeConfirm.confirmLabel}
          destructive={activeConfirm.destructive}
          loading={loading}
          onCancel={() => setPendingAction(null)}
          onConfirm={() => {
            activeConfirm.onConfirm();
            setPendingAction(null);
          }}
        />
      ) : null}
    </>
  );
}
