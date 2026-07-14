"use client";

import { useCallback, useEffect, useState } from "react";

import { api } from "@/lib/api";
import { extractApiErrorMessage } from "@/lib/errors";
import type { KYCRecord } from "@/lib/types";

type Props = {
  onMessage?: (message: string) => void;
};

export function AdminKYCTab({ onMessage }: Props) {
  const [records, setRecords] = useState<KYCRecord[]>([]);
  const [filter, setFilter] = useState<"pending" | "approved" | "rejected">("pending");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState<Record<number, string>>({});
  const [busyId, setBusyId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<KYCRecord[]>(`/kyc/admin/list?status=${filter}`);
      setRecords(res.data);
    } catch (err: unknown) {
      setError(extractApiErrorMessage(err, "Unable to load KYC queue."));
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    void load();
  }, [load]);

  const approve = async (userId: number) => {
    setBusyId(userId);
    try {
      await api.patch(`/kyc/admin/${userId}/approve`);
      onMessage?.(`KYC approved for user #${userId}`);
      await load();
    } catch (err: unknown) {
      setError(extractApiErrorMessage(err, "Approve failed."));
    } finally {
      setBusyId(null);
    }
  };

  const reject = async (userId: number) => {
    const reason = (rejectReason[userId] || "").trim();
    if (reason.length < 5) {
      setError("Rejection reason must be at least 5 characters.");
      return;
    }
    setBusyId(userId);
    try {
      await api.patch(`/kyc/admin/${userId}/reject`, { reason });
      onMessage?.(`KYC rejected for user #${userId}`);
      await load();
    } catch (err: unknown) {
      setError(extractApiErrorMessage(err, "Reject failed."));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <section className="mt-5 rounded-[24px] border border-[#1A212A] bg-[#0B1118] p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-[#F3F7FB]">KYC Review Queue</h2>
          <p className="mt-1 text-sm text-[#8E9AAA]">Approve or reject user identity submissions.</p>
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as typeof filter)}
          className="rounded-xl border border-[#24303A] bg-[#0E141B] px-3 py-2 text-sm text-[#F3F7FB]"
        >
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {error ? <p className="mt-4 rounded-xl border border-[#4F2A2A] bg-[#2A1414] px-3 py-2 text-sm text-[#FFB4B4]">{error}</p> : null}
      {loading ? <p className="mt-4 text-sm text-[#8E9AAA]">Loading KYC records...</p> : null}

      <div className="mt-4 space-y-3">
        {records.map((record) => (
          <article key={record.id} className="rounded-2xl border border-[#24303A] bg-[#0E141B] p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-[#F3F7FB]">
                  User #{record.user_id} · {record.document_type.toUpperCase()} · {record.document_id}
                </p>
                <p className="mt-1 text-xs text-[#8E9AAA]">Status: {record.status}</p>
                {record.notes ? <p className="mt-1 text-xs text-[#AAB4C0]">{record.notes}</p> : null}
                {"document_url" in record && record.document_url ? (
                  <a href={record.document_url} target="_blank" rel="noreferrer" className="mt-2 inline-block text-xs text-[#9BFF00] underline">
                    View document
                  </a>
                ) : null}
              </div>
              {filter === "pending" ? (
                <div className="flex min-w-55 flex-col gap-2">
                  <input
                    value={rejectReason[record.user_id] || ""}
                    onChange={(e) => setRejectReason((prev) => ({ ...prev, [record.user_id]: e.target.value }))}
                    placeholder="Rejection reason"
                    className="rounded-lg border border-[#24303A] bg-[#0A0D13] px-3 py-2 text-sm text-[#F3F7FB]"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={busyId === record.user_id}
                      onClick={() => void approve(record.user_id)}
                      className="rounded-lg bg-[#9BFF00] px-3 py-2 text-sm font-semibold text-[#11140D]"
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      disabled={busyId === record.user_id}
                      onClick={() => void reject(record.user_id)}
                      className="rounded-lg border border-[#4F2A2A] px-3 py-2 text-sm text-[#FFB4B4]"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          </article>
        ))}
        {!loading && records.length === 0 ? (
          <p className="text-sm text-[#8E9AAA]">No KYC records in this queue.</p>
        ) : null}
      </div>
    </section>
  );
}
