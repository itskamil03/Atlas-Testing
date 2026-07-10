"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { api } from "@/lib/api";
import { getAccessToken } from "@/lib/auth";
import { extractApiErrorMessage } from "@/lib/errors";
import type { SubscriptionPlan } from "@/lib/types";

const fallbackPlans: SubscriptionPlan[] = [
  {
    slug: "basic",
    display_name: "Basic",
    price_inr: "2000.00",
    access_percent: 10,
    mentor_support: false,
    description: "Access 10% of published strategies",
  },
  {
    slug: "pro",
    display_name: "Pro",
    price_inr: "5000.00",
    access_percent: 50,
    mentor_support: false,
    description: "Access 50% of published strategies",
  },
  {
    slug: "elite",
    display_name: "Elite",
    price_inr: "10000.00",
    access_percent: 100,
    mentor_support: true,
    description: "Access 100% of published strategies plus mentor support",
  },
];

const planOrder = new Map(fallbackPlans.map((plan, index) => [plan.slug, index]));

function formatInr(value: string): string {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return "INR 0";
  return `INR ${parsed.toLocaleString("en-IN", {
    maximumFractionDigits: 0,
  })}`;
}

export default function SubscriptionPage() {
  const router = useRouter();
  const [plans, setPlans] = useState<SubscriptionPlan[]>(fallbackPlans);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  useEffect(() => {
    if (!getAccessToken()) {
      router.push("/login");
      return;
    }

    const loadPlans = async () => {
      try {
        const response = await api.get<SubscriptionPlan[]>("/subscriptions/plans", {
          skipAuthRedirect: true,
        });
        setPlans(response.data);
      } catch (err: unknown) {
        setError(extractApiErrorMessage(err, "Unable to load live plans. Showing default subscription options."));
        setPlans(fallbackPlans);
      } finally {
        setLoading(false);
      }
    };

    void loadPlans();
  }, [router]);

  const sortedPlans = useMemo(
    () => [...plans].sort((a, b) => (planOrder.get(a.slug) ?? 99) - (planOrder.get(b.slug) ?? 99)),
    [plans],
  );

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900 dark:bg-[#040607] dark:text-[#E8ECEF]">
      <div className="mx-auto w-full max-w-[1180px] px-4 py-6 sm:px-6 lg:px-8">
        <header className="border-b border-gray-200 pb-5 dark:border-[#1A212A]">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500 dark:text-[#91A0AF]">
            Atlas subscription
          </p>
          <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h1 className="text-[30px] font-semibold text-gray-900 dark:text-[#F6FAFF]">Choose a plan</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500 dark:text-[#97A3AF]">
                Select the strategy access level that fits your trading workflow.
              </p>
            </div>
            <button
              type="button"
              onClick={() => router.push("/dashboard/strategies")}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-white dark:border-[#27313D] dark:text-[#B6C2CF] dark:hover:bg-[#0B1018]"
            >
              Back to Strategies
            </button>
          </div>
        </header>

        {error ? (
          <p className="mt-4 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-[#4B3A1D] dark:bg-[#1F1608] dark:text-[#F6CF8B]">
            {error}
          </p>
        ) : null}

        {loading ? (
          <p className="mt-5 rounded-xl border border-gray-200 bg-white px-5 py-8 text-gray-500 dark:border-[#1A1E23] dark:bg-[#090B0F] dark:text-[#9AA5B1]">
            Loading subscription plans...
          </p>
        ) : (
          <section className="mt-6 grid gap-4 md:grid-cols-3">
            {sortedPlans.map((plan) => {
              const isHighlighted = plan.slug === "pro";
              const isSelected = selectedPlan === plan.slug;

              return (
                <article
                  key={plan.slug}
                  className={`rounded-2xl border bg-white p-5 shadow-sm transition dark:bg-[#070A10] ${
                    isHighlighted
                      ? "border-[#9BFF00] shadow-[0_0_0_1px_rgba(155,255,0,0.35)]"
                      : "border-gray-200 dark:border-[#1A212A]"
                  }`}
                >
                  <div className="flex min-h-16 items-start justify-between gap-3">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-[#F5FAFF]">{plan.display_name}</h2>
                      <p className="mt-1 text-sm text-gray-500 dark:text-[#8E9AA7]">{plan.description}</p>
                    </div>
                    {isHighlighted ? (
                      <span className="rounded-full bg-[#9BFF00] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#11140D]">
                        Popular
                      </span>
                    ) : null}
                  </div>

                  <div className="mt-6">
                    <p className="text-[34px] font-semibold text-gray-900 dark:text-[#F7FBFF]">
                      {formatInr(plan.price_inr)}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-[#788593]">per subscription cycle</p>
                  </div>

                  <div className="mt-5 space-y-3 text-sm">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-3 dark:border-[#17202A]">
                      <span className="text-gray-500 dark:text-[#8F9BA8]">Strategy access</span>
                      <span className="font-semibold text-gray-900 dark:text-[#EAF1F8]">{plan.access_percent}%</span>
                    </div>
                    <div className="flex items-center justify-between border-b border-gray-100 pb-3 dark:border-[#17202A]">
                      <span className="text-gray-500 dark:text-[#8F9BA8]">Mentor support</span>
                      <span className="font-semibold text-gray-900 dark:text-[#EAF1F8]">
                        {plan.mentor_support ? "Included" : "Not included"}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedPlan(plan.slug)}
                    className={`mt-6 w-full rounded-xl px-4 py-3 text-sm font-semibold transition ${
                      isSelected
                        ? "bg-gray-900 text-white dark:bg-[#E8F0F8] dark:text-[#071018]"
                        : "bg-[#9BFF00] text-[#11140D] hover:bg-[#B7FF45]"
                    }`}
                  >
                    {isSelected ? "Selected" : `Select ${plan.display_name}`}
                  </button>
                </article>
              );
            })}
          </section>
        )}
      </div>
    </main>
  );
}
