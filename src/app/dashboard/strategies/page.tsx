"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { WorkflowBanner } from "@/components/WorkflowBanner";
import { StrategyMarketplaceCard } from "@/components/Strategies/StrategyMarketplaceCard";
import { api } from "@/lib/api";
import { clearTokens, getAccessToken, isDemoSession } from "@/lib/auth";
import type { UserProfile, SubscriptionStatus } from "@/lib/types";
import { useRequireBroker } from "@/hooks/useBrokerConnected";
import { useStrategyStore } from "@/store/useStrategyStore";
import { getAdminRoute, setAdminViewMode } from "@/lib/adminRoutes";

const FAQ_ITEMS = [
  {
    question: "What is a Strategy on Atlas?",
    answer:
      "A strategy is a pre-built automated trading system created by admins. You mirror it to copy signals and trades on your connected broker account.",
  },
  {
    question: "How do I start using a Strategy?",
    answer:
      "Connect your broker, pick a strategy, review its performance, then click Deploy Strategy to deploy with your profit and loss limits.",
  },
  {
    question: "Can I customize risk and capital allocation?",
    answer:
      "Yes. When mirroring, you set max profit and max loss limits. Recommended margin is shown on each strategy card as a guide.",
  },
];

export default function StrategiesPage() {
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);
  const { requireBroker, hasBroker } = useRequireBroker();
  const { strategies, filters, loading, error, loadStrategies, setFilters } = useStrategyStore();
  const [sortBy, setSortBy] = useState<"profits" | "followers" | "winrate">("profits");
  const [openFaq, setOpenFaq] = useState(0);
  const [hasSubscription, setHasSubscription] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    if (!getAccessToken()) {
      router.push("/login");
      return;
    }

    const initPage = async () => {
      setPageLoading(true);
      try {
        const [profileRes, subRes] = await Promise.all([
          api.get<UserProfile>("/auth/me"),
          api.get<SubscriptionStatus>("/subscriptions/me").catch(() => null),
          loadStrategies(),
        ]);

        const isAdmin = profileRes.data.role === "admin";
        const isDemo = isDemoSession();
        const hasActiveSub = subRes?.data?.has_active_subscription ?? false;

        setHasSubscription(isAdmin || isDemo || hasActiveSub);

        const viewMode = typeof window !== "undefined" ? sessionStorage.getItem("viewMode") : null;
        if (isAdmin && viewMode !== "trader") {
          setAdminViewMode();
          router.replace(getAdminRoute("strategies"));
          return;
        }
      } catch (err: unknown) {
        const status = (err as { response?: { status?: number } } | undefined)?.response?.status;
        if (status === 401) {
          clearTokens();
          router.push("/login");
        }
      } finally {
        setPageLoading(false);
      }
    };

    void initPage();
  }, [loadStrategies, router]);

  const sortedStrategies = useMemo(() => {
    const items = [...strategies];
    if (sortBy === "profits") {
      return items.sort((a, b) => Number(b.pnl) - Number(a.pnl));
    }
    if (sortBy === "followers") {
      return items.sort((a, b) => b.followers - a.followers);
    }
    return items.sort((a, b) => Number(b.win_rate_percent) - Number(a.win_rate_percent));
  }, [sortBy, strategies]);

  const scrollCarousel = (direction: "left" | "right") => {
    const node = scrollRef.current;
    if (!node) return;
    node.scrollBy({ left: direction === "left" ? -360 : 360, behavior: "smooth" });
  };

  if (pageLoading) {
    return (
      <div className="mx-auto w-full max-w-[1320px] px-4 py-8 sm:px-6 lg:px-8">
        <p className="text-gray-500 dark:text-[#A3AFBC]">Loading strategies...</p>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-20 top-0 h-72 w-72 rounded-full bg-purple-600/15 blur-[100px]" />
        <div className="absolute right-0 top-32 h-80 w-80 rounded-full bg-[#3B82F6]/10 blur-[120px]" />
      </div>

      <div className="relative mx-auto w-full max-w-[1320px] px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <WorkflowBanner activeStep={hasBroker ? "strategies" : "broker"} />
        </div>

        {error ? (
          <p className="mb-4 rounded-2xl border border-[#4F2A2A] bg-[#2A1414] px-4 py-3 text-sm text-[#FFB4B4]">
            {error}
          </p>
        ) : null}

        <section className="relative mb-8 rounded-3xl border border-gray-200 bg-white/80 p-4 dark:border-[#1A212A] dark:bg-[#070A10]/80">
          <div className={hasSubscription ? "" : "pointer-events-none select-none blur-[5px]"}>
            <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
              <div>
                <span className="inline-flex rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.12em] text-purple-400">
                  Marketplace
                </span>
                <h1 className="mt-3 text-[15px] font-semibold text-[#F3F7FB] sm:text-[32px]">
                  Strategies ({sortedStrategies.length})
                </h1>
              </div>
              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value as typeof sortBy)}
                className="rounded-xl border border-[#26303A] bg-[#0E141B] px-4 py-2.5 text-sm text-[#E8EEF5]"
              >
                <option value="profits">Profits</option>
                <option value="followers">Followers</option>
                <option value="winrate">Win rate</option>
              </select>
            </div>

            <div className="mb-4 flex flex-wrap gap-2">
              <input
                value={filters.search ?? ""}
                onChange={(event) => {
                  setFilters({ search: event.target.value });
                  void loadStrategies({ search: event.target.value });
                }}
                placeholder="Search strategies..."
                className="min-w-[220px] flex-1 rounded-xl border border-[#26303A] bg-[#0E141B] px-4 py-2.5 text-sm text-[#E8EEF5] placeholder:text-[#617184] focus:border-purple-500/50 focus:outline-none"
              />
              <select
                value={filters.exchange ?? ""}
                onChange={(event) => void loadStrategies({ exchange: event.target.value || undefined })}
                className="rounded-xl border border-[#26303A] bg-[#0E141B] px-4 py-2.5 text-sm text-[#E8EEF5]"
              >
                <option value="">All exchanges</option>
                {Array.from(new Set(strategies.map((s) => s.exchange)))
                  .sort()
                  .map((exchange) => (
                    <option key={exchange} value={exchange}>
                      {exchange}
                    </option>
                  ))}
              </select>
            </div>

            {loading ? (
              <div className="rounded-3xl border border-[#1A212A] bg-[#070A10] px-5 py-16 text-center text-[#A3AFBC]">
                Loading strategies...
              </div>
            ) : sortedStrategies.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-[#27303A] bg-[#070A10] px-5 py-16 text-center text-[#8E9AAA]">
                No strategies matched your filters.
              </div>
            ) : (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => scrollCarousel("left")}
                  className="absolute -left-3 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-[#26303A] bg-[#0A0A0A] text-[#C9D4E0] shadow-lg hover:border-purple-500/50 hover:text-purple-300 md:flex transition"
                  aria-label="Scroll left"
                >
                  ←
                </button>
                <button
                  type="button"
                  onClick={() => scrollCarousel("right")}
                  className="absolute -right-3 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-[#26303A] bg-[#0A0A0A] text-[#C9D4E0] shadow-lg hover:border-purple-500/50 hover:text-purple-300 md:flex transition"
                  aria-label="Scroll right"
                >
                  →
                </button>

                <div
                  ref={scrollRef}
                  className="flex gap-4 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                >
                  {sortedStrategies.map((strategy, index) => (
                    <StrategyMarketplaceCard
                      key={strategy.id}
                      strategy={strategy}
                      highlighted={index === 0}
                      hasBroker={hasBroker}
                      onMirror={() => router.push(`/dashboard/strategies/${encodeURIComponent(strategy.strategy_tag)}`)}
                      onConnectBroker={() =>
                        router.push(`/dashboard/strategies/${encodeURIComponent(strategy.strategy_tag)}`)
                      }
                      onUpgrade={() => router.push("/dashboard/subscription")}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {!hasSubscription && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/55 px-4 dark:bg-[#040607]/65">
              <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white px-5 py-6 text-center shadow-xl dark:border-[#26313D] dark:bg-[#0B1018]">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500 dark:text-[#91A0AF]">Subscription required</p>
                <h2 className="mt-2 text-2xl font-semibold text-gray-900 dark:text-[#F6FAFF]">Unlock strategy access</h2>
                <p className="mt-2 text-sm leading-6 text-gray-500 dark:text-[#9AA6B2]">
                  Choose a subscription plan to view published strategies and start exploring automated trading systems.
                </p>
                <button
                  type="button"
                  onClick={() => router.push("/dashboard/subscription")}
                  className="mt-5 rounded-xl bg-purple-600 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-purple-600/25 transition hover:bg-purple-700 active:scale-95"
                >
                  Go to Subscription Plan
                </button>
              </div>
            </div>
          )}
        </section>

        <section className="rounded-3xl border border-[#1F2833] bg-[#0A0A0A]/80 p-6 backdrop-blur">
          <h2 className="text-2xl font-semibold text-[#F3F7FB]">Frequently asked questions</h2>
          <p className="mt-1 text-sm text-[#8E9AAA]">
            Everything you need to know about strategies and mirroring.
          </p>
          <div className="mt-5 divide-y divide-[#1F2833]">
            {FAQ_ITEMS.map((item, index) => {
              const expanded = openFaq === index;
              return (
                <div key={item.question} className="py-4">
                  <button
                    type="button"
                    onClick={() => setOpenFaq(expanded ? -1 : index)}
                    className="flex w-full items-center justify-between gap-4 text-left"
                  >
                    <span className="font-medium text-[#F3F7FB]">{item.question}</span>
                    <span className="text-xl text-[#6B7785]">{expanded ? "−" : "+"}</span>
                  </button>
                  {expanded ? (
                    <p className="mt-3 max-w-3xl text-sm leading-6 text-[#8E9AAA]">{item.answer}</p>
                  ) : null}
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
