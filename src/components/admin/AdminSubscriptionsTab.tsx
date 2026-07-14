"use client";

import { useCallback, useEffect, useState } from "react";

import {
  adminListMentorRequests,
  adminListSubscriptionPayments,
  adminRecalculateAllAccess,
  adminRejectPayment,
  adminUpdateMentorRequest,
  adminVerifyPayment,
} from "@/lib/api";
import { extractApiErrorMessage } from "@/lib/errors";
import { formatIST } from "@/lib/datetime";
import type { MentorSupportRequest, SubscriptionPayment } from "@/lib/types";

import { AdminStatusBadge, paymentTone } from "./AdminStatusBadge";

type AdminSubscriptionsTabProps = {
  onMessage: (message: string) => void;
  onError: (message: string) => void;
};

export function AdminSubscriptionsTab({ onMessage, onError }: AdminSubscriptionsTabProps) {
  const [payments, setPayments] = useState<SubscriptionPayment[]>([]);
  const [mentorRequests, setMentorRequests] = useState<MentorSupportRequest[]>([]);
  const [paymentFilter, setPaymentFilter] = useState("submitted");
  const [mentorFilter, setMentorFilter] = useState("open");
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState<number | null>(null);
  const [mentorResponses, setMentorResponses] = useState<Record<number, string>>({});

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [paymentsRes, mentorRes] = await Promise.all([
        adminListSubscriptionPayments(paymentFilter === "all" ? undefined : paymentFilter),
        adminListMentorRequests(mentorFilter === "all" ? undefined : mentorFilter),
      ]);
      setPayments(paymentsRes.data);
      setMentorRequests(mentorRes.data);
    } catch (err) {
      onError(extractApiErrorMessage(err, "Failed to load subscription data"));
    } finally {
      setLoading(false);
    }
  }, [mentorFilter, onError, paymentFilter]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  async function handleVerify(paymentId: number) {
    setActingId(paymentId);
    try {
      await adminVerifyPayment(paymentId, { admin_notes: "Verified by admin" });
      onMessage("Payment verified and subscription activated.");
      await loadData();
    } catch (err) {
      onError(extractApiErrorMessage(err, "Failed to verify payment"));
    } finally {
      setActingId(null);
    }
  }

  async function handleReject(paymentId: number) {
    const reason = window.prompt("Rejection reason (required):");
    if (!reason?.trim()) return;
    setActingId(paymentId);
    try {
      await adminRejectPayment(paymentId, { admin_notes: reason.trim() });
      onMessage("Payment rejected.");
      await loadData();
    } catch (err) {
      onError(extractApiErrorMessage(err, "Failed to reject payment"));
    } finally {
      setActingId(null);
    }
  }

  async function handleRecalculateAll() {
    try {
      const res = await adminRecalculateAllAccess();
      onMessage(res.data.message);
    } catch (err) {
      onError(extractApiErrorMessage(err, "Failed to recalculate access"));
    }
  }

  async function handleMentorUpdate(requestId: number, status: string) {
    setActingId(requestId);
    try {
      await adminUpdateMentorRequest(requestId, {
        status,
        admin_response: mentorResponses[requestId] || undefined,
      });
      onMessage("Mentor request updated.");
      await loadData();
    } catch (err) {
      onError(extractApiErrorMessage(err, "Failed to update mentor request"));
    } finally {
      setActingId(null);
    }
  }

  if (loading) {
    return (
      <div className="mt-5 rounded-[28px] border border-[#1A212A] bg-[#0B1118] p-8 text-[#8E9AAA]">
        Loading subscription management...
      </div>
    );
  }

  return (
    <section className="mt-5 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-[28px] border border-[#1A212A] bg-[linear-gradient(180deg,#0D1218,#090D12)] p-6">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-[#9BFF00]">Billing</p>
          <h2 className="mt-1 text-2xl font-semibold text-[#F3F7FB]">Subscription Management</h2>
          <p className="mt-1 text-sm text-[#8E9AAA]">
            Verify UPI payments, manage mentor support, and recalculate strategy access.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void handleRecalculateAll()}
          className="rounded-2xl border border-[#9BFF00]/40 px-4 py-2.5 text-sm font-semibold text-[#9BFF00] transition hover:bg-[#9BFF00]/10"
        >
          Recalculate All Access
        </button>
      </div>

      <div className="rounded-[28px] border border-[#1A212A] bg-[#0B1118] p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-[#F3F7FB]">UPI Payments</h3>
          <div className="flex gap-2">
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="rounded-xl border border-[#242D37] bg-[#050607] px-3 py-2 text-sm text-[#F3F7FB]"
            >
              <option value="all">All statuses</option>
              <option value="submitted">Submitted</option>
              <option value="pending">Pending</option>
              <option value="verified">Verified</option>
              <option value="rejected">Rejected</option>
              <option value="expired">Expired</option>
            </select>
            <button
              type="button"
              onClick={() => void loadData()}
              className="rounded-xl border border-[#242D37] px-3 py-2 text-sm text-[#C9D4E0] hover:border-[#9BFF00]/40"
            >
              Refresh
            </button>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-[#1A212A] text-left text-xs uppercase tracking-wide text-[#6B7785]">
                <th className="px-3 py-2">User</th>
                <th className="px-3 py-2">Plan</th>
                <th className="px-3 py-2">Amount</th>
                <th className="px-3 py-2">Reference</th>
                <th className="px-3 py-2">UPI Txn</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {payments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-3 py-8 text-center text-[#8E9AAA]">
                    No payments found for this filter.
                  </td>
                </tr>
              ) : (
                payments.map((payment) => (
                  <tr key={payment.id} className="border-b border-[#121820] text-[#E8ECEF]">
                    <td className="px-3 py-3">#{payment.user_id}</td>
                    <td className="px-3 py-3 capitalize">{payment.plan_name}</td>
                    <td className="px-3 py-3">₹{Number(payment.amount_inr).toLocaleString("en-IN")}</td>
                    <td className="px-3 py-3 font-mono text-xs">{payment.reference_code}</td>
                    <td className="px-3 py-3 font-mono text-xs">{payment.upi_transaction_id ?? "—"}</td>
                    <td className="px-3 py-3">
                      <AdminStatusBadge label={payment.status} tone={paymentTone(payment.status)} />
                    </td>
                    <td className="px-3 py-3">
                      {payment.status === "submitted" ? (
                        <div className="flex gap-2">
                          <button
                            type="button"
                            disabled={actingId === payment.id}
                            onClick={() => void handleVerify(payment.id)}
                            className="rounded-lg bg-[#9BFF00] px-3 py-1.5 text-xs font-semibold text-[#11140D] disabled:opacity-50"
                          >
                            Verify
                          </button>
                          <button
                            type="button"
                            disabled={actingId === payment.id}
                            onClick={() => void handleReject(payment.id)}
                            className="rounded-lg border border-[#5A2A2A] px-3 py-1.5 text-xs text-[#FFB4B4] disabled:opacity-50"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-[#6B7785]">—</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-[28px] border border-[#1A212A] bg-[#0B1118] p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-[#F3F7FB]">Mentor Support Requests</h3>
          <select
            value={mentorFilter}
            onChange={(e) => setMentorFilter(e.target.value)}
            className="rounded-xl border border-[#242D37] bg-[#050607] px-3 py-2 text-sm text-[#F3F7FB]"
          >
            <option value="all">All statuses</option>
            <option value="open">Open</option>
            <option value="in_progress">In progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
        </div>

        <div className="mt-4 space-y-3">
          {mentorRequests.length === 0 ? (
            <p className="py-6 text-center text-sm text-[#8E9AAA]">No mentor requests found.</p>
          ) : (
            mentorRequests.map((request) => (
              <article key={request.id} className="rounded-2xl border border-[#242D37] bg-[#050607] p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-[#F3F7FB]">{request.subject}</p>
                    <p className="mt-1 text-xs text-[#6B7785]">
                      User #{request.user_id} · {formatIST(request.created_at)}
                    </p>
                  </div>
                  <AdminStatusBadge label={request.status.replace("_", " ")} tone="info" />
                </div>
                <p className="mt-3 text-sm text-[#C9D4E0]">{request.message}</p>
                {request.admin_response ? (
                  <p className="mt-3 rounded-xl bg-[#0B1118] p-3 text-sm text-[#9BFF00]">
                    Response: {request.admin_response}
                  </p>
                ) : null}
                <textarea
                  value={mentorResponses[request.id] ?? ""}
                  onChange={(e) =>
                    setMentorResponses((prev) => ({ ...prev, [request.id]: e.target.value }))
                  }
                  placeholder="Admin response to user"
                  rows={2}
                  className="mt-3 w-full rounded-xl border border-[#242D37] bg-[#0B1118] px-3 py-2 text-sm text-[#F3F7FB]"
                />
                <div className="mt-3 flex flex-wrap gap-2">
                  {(["in_progress", "resolved", "closed"] as const).map((status) => (
                    <button
                      key={status}
                      type="button"
                      disabled={actingId === request.id}
                      onClick={() => void handleMentorUpdate(request.id, status)}
                      className="rounded-lg border border-[#242D37] px-3 py-1.5 text-xs capitalize text-[#C9D4E0] hover:border-[#9BFF00]/40 disabled:opacity-50"
                    >
                      Mark {status.replace("_", " ")}
                    </button>
                  ))}
                </div>
              </article>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
