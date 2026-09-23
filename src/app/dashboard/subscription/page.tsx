"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  createMentorSupportRequest,
  getMySubscription,
  getSubscriptionPlans,
  initiateSubscriptionPayment,
  listMyMentorSupportRequests,
  listMySubscriptionPayments,
  submitSubscriptionPayment,
} from "@/lib/api";
import { getAccessToken } from "@/lib/auth";
import { extractApiErrorMessage } from "@/lib/errors";
import { formatIST } from "@/lib/datetime";
import type {
  MentorSupportRequest,
  PaymentInitiateResponse,
  SubscriptionPayment,
  SubscriptionPlan,
  SubscriptionStatus,
} from "@/lib/types";

const PLAN_LABELS: Record<string, string> = {
  basic: "Basic",
  pro: "Pro",
  elite: "Elite",
};

export default function SubscriptionPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [status, setStatus] = useState<SubscriptionStatus | null>(null);
  const [payments, setPayments] = useState<SubscriptionPayment[]>([]);
  const [mentorRequests, setMentorRequests] = useState<MentorSupportRequest[]>([]);
  const [activePayment, setActivePayment] = useState<PaymentInitiateResponse | null>(null);
  const [upiTxnId, setUpiTxnId] = useState("");
  const [mentorSubject, setMentorSubject] = useState("");
  const [mentorMessage, setMentorMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function loadData() {
    setError(null);
    try {
      const [plansRes, statusRes, paymentsRes, mentorRes] = await Promise.all([
        getSubscriptionPlans(),
        getMySubscription(),
        listMySubscriptionPayments(),
        listMyMentorSupportRequests(),
      ]);
      setPlans(plansRes.data);
      setStatus(statusRes.data);
      setPayments(paymentsRes.data);
      setMentorRequests(mentorRes.data);
    } catch (err) {
      setError(extractApiErrorMessage(err, "Failed to load subscription details"));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!getAccessToken()) {
      router.replace("/login");
      return;
    }
    void loadData();
  }, [router]);

  async function handleSelectPlan(planSlug: string) {
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      const response = await initiateSubscriptionPayment({ plan_name: planSlug });
      setActivePayment(response.data);
      setSuccess("Payment initiated. Complete the UPI transfer and submit your transaction ID.");
      await loadData();
    } catch (err) {
      setError(extractApiErrorMessage(err, "Failed to initiate payment"));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSubmitPayment() {
    if (!activePayment || !upiTxnId.trim()) {
      setError("Enter your UPI transaction ID");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await submitSubscriptionPayment(activePayment.payment_id, {
        upi_transaction_id: upiTxnId.trim(),
      });
      setSuccess("Payment submitted for admin verification.");
      setActivePayment(null);
      setUpiTxnId("");
      await loadData();
    } catch (err) {
      setError(extractApiErrorMessage(err, "Failed to submit payment"));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleMentorRequest() {
    if (!mentorSubject.trim() || !mentorMessage.trim()) {
      setError("Subject and message are required for mentor support");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await createMentorSupportRequest({
        subject: mentorSubject.trim(),
        message: mentorMessage.trim(),
      });
      setSuccess("Mentor support request submitted.");
      setMentorSubject("");
      setMentorMessage("");
      await loadData();
    } catch (err) {
      setError(extractApiErrorMessage(err, "Failed to submit mentor request"));
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 text-gray-900 dark:bg-[#040607] dark:text-[#E8ECEF]">
        <div className="mx-auto w-full max-w-[1180px] px-4 py-10 sm:px-6 lg:px-8">
          Loading subscription details...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900 dark:bg-[#040607] dark:text-[#E8ECEF]">
      <div className="mx-auto w-full max-w-[1180px] px-4 py-6 sm:px-6 lg:px-8 space-y-6">
        
        {/* Header / Current Status */}
        <header className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-[#1A212A] dark:bg-[#070A10]">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500 dark:text-[#91A0AF]">
                Subscription
              </p>
              <h1 className="text-[30px] mt-1 font-semibold text-gray-900 dark:text-[#F6FAFF]">Plans & Access</h1>
            </div>
            <button
              type="button"
              onClick={() => router.push("/dashboard/strategies")}
              className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 dark:border-[#242D37] dark:text-[#C9D4E0] hover:border-purple-500/40 hover:text-purple-400 hover:bg-purple-500/5 transition duration-150 active:scale-95"
            >
              Back to Strategies
            </button>
          </div>

          {status ? (
            <div className="mt-6 grid gap-4 sm:grid-cols-2 md:grid-cols-4">
              <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-4 dark:border-[#17202A] dark:bg-[#0B1118]">
                <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-[#6B7785]">Current plan</p>
                <p className="mt-2 text-lg font-semibold text-gray-900 dark:text-[#F3F7FB]">
                  {status.has_active_subscription ? status.plan_display_name : "None"}
                </p>
              </div>
              <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-4 dark:border-[#17202A] dark:bg-[#0B1118]">
                <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-[#6B7785]">Access</p>
                <p className="mt-2 text-lg font-semibold text-purple-600 dark:text-purple-400">{status.access_percent}%</p>
              </div>
              <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-4 dark:border-[#17202A] dark:bg-[#0B1118]">
                <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-[#6B7785]">Unlocked strategies</p>
                <p className="mt-2 text-lg font-semibold text-gray-900 dark:text-[#F3F7FB]">
                  {status.unlocked_strategy_count} / {status.total_published_strategies}
                </p>
              </div>
              <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-4 dark:border-[#17202A] dark:bg-[#0B1118]">
                <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-[#6B7785]">Mentor support</p>
                <p className="mt-2 text-lg font-semibold text-gray-900 dark:text-[#F3F7FB]">
                  {status.mentor_support_enabled ? "Included" : "Not included"}
                </p>
              </div>
            </div>
          ) : null}

          {error ? (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50/50 px-4 py-3 text-sm text-red-600 dark:border-[#5A2A2A] dark:bg-[#2A1414] dark:text-[#FFB4B4]">
              {error}
            </div>
          ) : null}
          {success ? (
            <div className="mt-4 rounded-xl border border-purple-200 bg-purple-50/50 px-4 py-3 text-sm text-purple-700 dark:border-purple-900/40 dark:bg-purple-950/20 dark:text-purple-300">
              {success}
            </div>
          ) : null}
        </header>

        {/* Pricing Cards Grid */}
        <section className="grid gap-6 md:grid-cols-3">
          {plans.map((plan) => {
            const isCurrent = status?.plan_name === plan.slug;
            const isHighlighted = plan.slug === "pro";

            return (
              <article
                key={plan.slug}
                className={`rounded-2xl border bg-white p-5 shadow-sm transition dark:bg-[#070A10] ${
                  isCurrent
                    ? "border-purple-500 shadow-[0_0_0_1px_rgba(124,58,237,0.35)]"
                    : "border-gray-200 dark:border-[#1A212A]"
                }`}
              >
                <div className="flex min-h-16 items-start justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-[#F5FAFF]">{plan.display_name}</h2>
                    <p className="mt-1 text-sm text-gray-500 dark:text-[#8E9AA7]">{plan.description}</p>
                  </div>
                  {isHighlighted ? (
                    <span className="rounded-full bg-purple-600 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-white">
                      Popular
                    </span>
                  ) : null}
                </div>

                <div className="mt-6">
                  <p className="text-[34px] font-semibold text-gray-900 dark:text-[#F7FBFF]">
                    ₹{Number(plan.price_inr).toLocaleString("en-IN")}
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
                  disabled={submitting || isCurrent}
                  onClick={() => void handleSelectPlan(plan.slug)}
                  className={`mt-6 w-full rounded-xl px-4 py-3 text-sm font-semibold transition active:scale-95 duration-100 disabled:opacity-50 disabled:cursor-not-allowed ${
                    isCurrent
                      ? "bg-gray-100 text-gray-400 dark:bg-purple-950/30 dark:text-purple-400 border border-purple-500/20"
                      : "bg-purple-600 text-white hover:bg-purple-700 shadow-md shadow-purple-600/25"
                  }`}
                >
                  {isCurrent ? "Current Plan" : "Pay via UPI"}
                </button>
              </article>
            );
          })}
        </section>

        {/* Complete Payment Section */}
        {activePayment ? (
          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-purple-500/30 dark:bg-[#070A10] space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-[#F3F7FB]">Complete UPI Payment</h2>
            
            <div className="grid gap-4 text-sm text-gray-700 dark:text-[#C9D4E0] md:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-4 dark:border-[#17202A] dark:bg-[#0B1118]">
                <span className="text-gray-400 dark:text-[#8E9AAA] text-xs uppercase tracking-wide block">Amount</span>
                <span className="text-base font-semibold mt-1 block">₹{Number(activePayment.amount_inr).toLocaleString("en-IN")}</span>
              </div>
              <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-4 dark:border-[#17202A] dark:bg-[#0B1118]">
                <span className="text-gray-400 dark:text-[#8E9AAA] text-xs uppercase tracking-wide block">UPI ID</span>
                <span className="text-base font-semibold mt-1 block select-all">{activePayment.upi_vpa}</span>
              </div>
              <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-4 dark:border-[#17202A] dark:bg-[#0B1118]">
                <span className="text-gray-400 dark:text-[#8E9AAA] text-xs uppercase tracking-wide block">Payee</span>
                <span className="text-base font-semibold mt-1 block">{activePayment.upi_payee_name}</span>
              </div>
              <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-4 dark:border-[#17202A] dark:bg-[#0B1118]">
                <span className="text-gray-400 dark:text-[#8E9AAA] text-xs uppercase tracking-wide block">Reference Code</span>
                <span className="text-base font-semibold mt-1 block select-all">{activePayment.reference_code}</span>
              </div>
            </div>

            <div className="rounded-xl bg-blue-50/40 p-4 border border-blue-200/50 dark:bg-[#0B1118] dark:border-[#1A212A] text-sm text-gray-600 dark:text-[#8E9AAA]">
              <span className="font-semibold text-gray-900 dark:text-[#F3F7FB] block mb-1">Instructions:</span>
              {activePayment.instructions}
            </div>

            <div className="flex flex-col gap-3 md:flex-row items-stretch">
              <input
                value={upiTxnId}
                onChange={(event) => setUpiTxnId(event.target.value)}
                placeholder="UPI transaction ID / UTR reference number"
                className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-purple-500 dark:border-[#242D37] dark:bg-[#050607] dark:text-[#F3F7FB]"
              />
              <button
                type="button"
                disabled={submitting}
                onClick={() => void handleSubmitPayment()}
                className="rounded-xl bg-purple-600 px-6 py-3 text-sm font-semibold text-white hover:bg-purple-700 shadow-md shadow-purple-600/25 transition active:scale-95 duration-100 disabled:opacity-50"
              >
                Submit Payment Proof
              </button>
            </div>
          </section>
        ) : null}

        {/* Payment History Section */}
        {payments.length > 0 ? (
          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-[#1A212A] dark:bg-[#070A10]">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-[#F3F7FB] mb-4">Payment History</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="text-gray-400 dark:text-[#8E9AAA] border-b border-gray-200 dark:border-[#1A212A]">
                    <th className="pb-3 font-semibold">Plan</th>
                    <th className="pb-3 font-semibold">Amount</th>
                    <th className="pb-3 font-semibold">Reference</th>
                    <th className="pb-3 font-semibold">Status</th>
                    <th className="pb-3 font-semibold">Submitted</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment) => (
                    <tr key={payment.id} className="border-b border-gray-100 text-gray-700 dark:border-[#1A212A]/50 dark:text-[#E8ECEF]">
                      <td className="py-3 capitalize font-medium">{PLAN_LABELS[payment.plan_name] ?? payment.plan_name}</td>
                      <td className="py-3">₹{Number(payment.amount_inr).toLocaleString("en-IN")}</td>
                      <td className="py-3 font-mono text-xs">{payment.reference_code}</td>
                      <td className="py-3">
                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          payment.status === "verified"
                            ? "bg-green-100 text-green-800 dark:bg-green-500/10 dark:text-green-400"
                            : payment.status === "rejected"
                              ? "bg-red-100 text-red-800 dark:bg-red-500/10 dark:text-red-400"
                              : "bg-amber-100 text-amber-800 dark:bg-amber-500/10 dark:text-amber-400"
                        }`}>
                          {payment.status}
                        </span>
                      </td>
                      <td className="py-3 text-gray-500 dark:text-[#8E9AAA]">{formatIST(payment.submitted_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ) : null}

        {/* Mentor Support Section */}
        {status?.mentor_support_enabled ? (
          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-[#1A212A] dark:bg-[#070A10] space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-[#F3F7FB]">Mentor Support</h2>
            <p className="text-sm text-gray-500 dark:text-[#8E9AAA]">Elite subscribers can request one-on-one mentor guidance.</p>
            
            <div className="space-y-3">
              <input
                value={mentorSubject}
                onChange={(event) => setMentorSubject(event.target.value)}
                placeholder="Subject"
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-purple-500 dark:border-[#242D37] dark:bg-[#050607] dark:text-[#F3F7FB]"
              />
              <textarea
                value={mentorMessage}
                onChange={(event) => setMentorMessage(event.target.value)}
                placeholder="Describe what you need help with"
                rows={4}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-purple-500 dark:border-[#242D37] dark:bg-[#050607] dark:text-[#F3F7FB]"
              />
              <button
                type="button"
                disabled={submitting}
                onClick={() => void handleMentorRequest()}
                className="rounded-xl bg-purple-600 px-6 py-3 text-sm font-semibold text-white hover:bg-purple-700 shadow-md shadow-purple-600/25 transition active:scale-95 duration-100 disabled:opacity-50"
              >
                Request Mentor Support
              </button>
            </div>

            {mentorRequests.length > 0 ? (
              <div className="mt-6 space-y-3 pt-4 border-t border-gray-100 dark:border-[#1B222B]">
                <h3 className="font-semibold text-gray-900 dark:text-[#F3F7FB]">Past Support Requests</h3>
                {mentorRequests.map((request) => (
                  <div key={request.id} className="rounded-xl border border-gray-200 bg-gray-50/50 p-4 dark:border-[#242D37] dark:bg-[#0B1118]">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-semibold text-gray-900 dark:text-[#F3F7FB]">{request.subject}</p>
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        request.status === "resolved"
                          ? "bg-green-100 text-green-800 dark:bg-green-500/10 dark:text-green-400"
                          : "bg-amber-100 text-amber-800 dark:bg-amber-500/10 dark:text-amber-400"
                      }`}>
                        {request.status}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-gray-600 dark:text-[#8E9AAA]">{request.message}</p>
                    {request.admin_response ? (
                      <div className="mt-3 rounded-lg bg-white p-3 text-sm border border-gray-100 dark:border-[#242D37]/35 dark:bg-[#050607] text-gray-700 dark:text-[#C9D4E0]">
                        <span className="font-semibold text-purple-400">Mentor Response:</span> {request.admin_response}
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : null}
          </section>
        ) : null}

      </div>
    </main>
  );
}
