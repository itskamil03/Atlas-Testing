"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { AutomatedStrategyNav } from "@/components/auto-trading/AutomatedStrategyNav";
import { FeedbackBanner } from "@/components/auto-trading/FeedbackBanner";
import { StatusBadge } from "@/components/auto-trading/StatusBadge";
import { Toast } from "@/components/auto-trading/Toast";
import { getAccessToken } from "@/lib/auth";
import { useAutomatedStrategyStore } from "@/store/useAutomatedStrategyStore";

function DeploySuccessToast() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (searchParams.get("deployed") === "success") {
      setToast("Strategy deployed successfully.");
      router.replace("/dashboard/automated-strategies");
    }
  }, [router, searchParams]);

  return toast ? <Toast message={toast} onClose={() => setToast(null)} /> : null;
}

function AutomatedStrategiesPageContent() {
  const router = useRouter();
  const { strategies, loading, error, loadStrategies } = useAutomatedStrategyStore();

  useEffect(() => {
    if (!getAccessToken()) {
      router.push("/login");
      return;
    }
    void loadStrategies();
  }, [loadStrategies, router]);

  return (
    <div className="mx-auto w-full max-w-[1320px] px-4 py-6 sm:px-6 lg:px-8">
      <Suspense fallback={null}>
        <DeploySuccessToast />
      </Suspense>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-[#1A212A] bg-[linear-gradient(135deg,#0A1017,#070A10)] px-5 py-4 shadow-[0_18px_40px_rgba(0,0,0,0.28)]">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-[#8E9AAA]">My automated strategies</p>
          <h1 className="mt-1 text-2xl font-semibold text-[#F3F7FB]">Deployed strategies</h1>
          {/* <p className="mt-1 text-sm text-[#93A0AE]">Manage every strategy you deployed from the marketplace.</p> */}
        </div>
        <AutomatedStrategyNav active="list" />
      </div>

      <FeedbackBanner error={error} />

      {loading ? (
        <div className="rounded-3xl border border-[#1A212A] bg-[#070A10] px-5 py-10 text-[#A3AFBC]">Loading strategies...</div>
      ) : strategies.length === 0 ? (
        <div className="rounded-3xl border border-[#1A212A] bg-[#070A10] px-5 py-10 text-[#A3AFBC]">
          No automated strategies yet. Deploy one from the{" "}
          <Link href="/dashboard/strategies" className="text-[#9BFF00] hover:underline">
            marketplace
          </Link>
          .
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {strategies.map((strategy) => (
            <article key={strategy.id} className="rounded-[28px] border border-[#1A212A] bg-[#070A10] p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.12em] text-[#8E9AAA]">{strategy.strategy_tag ?? strategy.strategy_type}</p>
                  <h2 className="mt-1 text-lg font-semibold text-[#F3F7FB]">{strategy.name}</h2>
                </div>
                <StatusBadge status={strategy.status ?? (strategy.is_active ? "ACTIVE" : "INACTIVE")} />
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-[#D5DEE8]">
                <div>
                  <p className="text-xs text-[#8E9AAA]">Broker</p>
                  <p className="mt-1 font-medium capitalize">{strategy.broker}</p>
                </div>
                <div>
                  <p className="text-xs text-[#8E9AAA]">Capital</p>
                  <p className="mt-1 font-medium">{strategy.capital_allocation_percent}%</p>
                </div>
                <div>
                  <p className="text-xs text-[#8E9AAA]">Max profit</p>
                  <p className="mt-1 font-medium">{strategy.max_profit_limit ?? "-"}</p>
                </div>
                <div>
                  <p className="text-xs text-[#8E9AAA]">Max loss</p>
                  <p className="mt-1 font-medium">{strategy.max_loss_limit}</p>
                </div>
                <div>
                  <p className="text-xs text-[#8E9AAA]">Multiplier</p>
                  <p className="mt-1 font-medium">{strategy.multiplier}</p>
                </div>
                <div>
                  <p className="text-xs text-[#8E9AAA]">Created</p>
                  <p className="mt-1 font-medium">{new Date(strategy.created_at).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-2">
                <Link
                  href={`/dashboard/automated-strategies/${strategy.id}/dashboard`}
                  className="rounded-2xl bg-[#9BFF00] px-4 py-3 text-center text-sm font-semibold text-[#11140D] transition hover:bg-[#B7FF45]"
                >
                  View Dashboard
                </Link>
                <Link
                  href={`/dashboard/automated-strategies/${strategy.id}/dashboard`}
                  className="rounded-2xl border border-[#2B3440] px-4 py-3 text-center text-sm font-semibold text-[#E8EEF5] transition hover:border-[#3A4551]"
                >
                  Manage
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AutomatedStrategiesPage() {
  return <AutomatedStrategiesPageContent />;
}
