"use client";

import { useState } from "react";

import type { AdminUserItem, AdminUserListResponse } from "@/lib/types";

import { AdminStatusBadge, kycTone, subscriptionTone } from "./AdminStatusBadge";

type AdminUsersTabProps = {
  users: AdminUserListResponse | null;
  userSearch: string;
  kycFilter: string;
  subscriptionFilter: string;
  onUserSearchChange: (value: string) => void;
  onKycFilterChange: (value: string) => void;
  onSubscriptionFilterChange: (value: string) => void;
  onApply: () => void;
  onBanToggle: (userId: number, isActive: boolean) => void;
  onSaveRiskLimits: (userId: number, maxDailyLoss: number, maxTradesPerDay: number) => Promise<void>;
  formatCurrency: (value: string | number) => string;
};

export function AdminUsersTab({
  users,
  userSearch,
  kycFilter,
  subscriptionFilter,
  onUserSearchChange,
  onKycFilterChange,
  onSubscriptionFilterChange,
  onApply,
  onBanToggle,
  onSaveRiskLimits,
  formatCurrency,
}: AdminUsersTabProps) {
  const [editingUser, setEditingUser] = useState<AdminUserItem | null>(null);
  const [maxDailyLoss, setMaxDailyLoss] = useState("");
  const [maxTradesPerDay, setMaxTradesPerDay] = useState("");
  const [saving, setSaving] = useState(false);

  const openRiskModal = (user: AdminUserItem) => {
    setEditingUser(user);
    setMaxDailyLoss(String(user.max_daily_loss ?? "500"));
    setMaxTradesPerDay(String(user.max_trades_per_day ?? "50"));
  };

  const closeRiskModal = () => {
    if (saving) return;
    setEditingUser(null);
  };

  const handleSaveRiskLimits = async () => {
    if (!editingUser) return;
    const loss = Number(maxDailyLoss);
    const trades = Number(maxTradesPerDay);
    if (!Number.isFinite(loss) || loss <= 0) return;
    if (!Number.isInteger(trades) || trades < 1) return;

    setSaving(true);
    try {
      await onSaveRiskLimits(editingUser.id, loss, trades);
      setEditingUser(null);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <section className="mt-5 rounded-[28px] border border-[#1A212A] bg-[#0B1118] p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[#9BFF00]">Accounts</p>
            <h2 className="mt-1 text-xl font-semibold text-[#F3F7FB]">Users Management</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            <input
              value={userSearch}
              onChange={(e) => onUserSearchChange(e.target.value)}
              placeholder="Search users"
              className="rounded-xl border border-[#242D37] bg-[#050607] px-3 py-2 text-sm text-[#F3F7FB] outline-none focus:border-[#9BFF00]"
            />
            <select
              value={kycFilter}
              onChange={(e) => onKycFilterChange(e.target.value)}
              className="rounded-xl border border-[#242D37] bg-[#050607] px-3 py-2 text-sm text-[#F3F7FB]"
            >
              <option value="all">All KYC</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
            <select
              value={subscriptionFilter}
              onChange={(e) => onSubscriptionFilterChange(e.target.value)}
              className="rounded-xl border border-[#242D37] bg-[#050607] px-3 py-2 text-sm text-[#F3F7FB]"
            >
              <option value="all">All subscriptions</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <button
              type="button"
              onClick={onApply}
              className="rounded-xl bg-[#9BFF00] px-4 py-2 text-sm font-semibold text-[#11140D]"
            >
              Apply
            </button>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-[#1A212A] text-left text-xs uppercase tracking-wide text-[#6B7785]">
                <th className="px-3 py-2">User</th>
                <th className="px-3 py-2">KYC</th>
                <th className="px-3 py-2">Plan</th>
                <th className="px-3 py-2">Access</th>
                <th className="px-3 py-2">Wallet</th>
                <th className="px-3 py-2">Daily loss limit</th>
                <th className="px-3 py-2">Exchanges</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users?.items.map((item: AdminUserItem) => (
                <tr key={item.id} className="border-b border-[#121820]">
                  <td className="px-3 py-3">
                    <p className="font-medium text-[#F3F7FB]">{item.full_name}</p>
                    <p className="text-xs text-[#8E9AAA]">{item.email}</p>
                  </td>
                  <td className="px-3 py-3">
                    <AdminStatusBadge label={item.kyc_status} tone={kycTone(item.kyc_status)} />
                  </td>
                  <td className="px-3 py-3">
                    {item.plan_name && item.subscription_status === "active" ? (
                      <AdminStatusBadge
                        label={item.plan_name}
                        tone={subscriptionTone(item.subscription_status, item.plan_name)}
                      />
                    ) : (
                      <span className="text-[#6B7785]">—</span>
                    )}
                  </td>
                  <td className="px-3 py-3 text-[#C9D4E0]">
                    {item.subscription_status === "active" ? `${item.access_percent ?? 0}%` : "—"}
                  </td>
                  <td className="px-3 py-3 text-[#C9D4E0]">${formatCurrency(item.wallet_balance)}</td>
                  <td className="px-3 py-3 text-[#C9D4E0]">
                    <p>${formatCurrency(item.max_daily_loss)}</p>
                    <p className="text-xs text-[#6B7785]">{item.max_trades_per_day} trades/day max</p>
                  </td>
                  <td className="px-3 py-3 text-[#C9D4E0]">{item.linked_exchange_accounts}</td>
                  <td className="px-3 py-3">
                    <AdminStatusBadge
                      label={item.is_active ? "Active" : "Banned"}
                      tone={item.is_active ? "success" : "danger"}
                    />
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => openRiskModal(item)}
                        className="rounded-lg border border-[#242D37] px-3 py-1.5 text-xs font-medium text-[#C9D4E0] hover:border-[#9BFF00]/40 hover:text-[#9BFF00] hover:bg-[#9BFF00]/5 transition duration-150 active:scale-95"
                      >
                        Risk limits
                      </button>
                      <button
                        type="button"
                        onClick={() => onBanToggle(item.id, item.is_active)}
                        className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition duration-150 active:scale-95 ${
                          item.is_active
                            ? "border-[#5C2A35] text-[#FFBAC8] hover:border-red-500/40 hover:text-red-400 hover:bg-red-500/10"
                            : "border-[#2A4A1A] text-[#B7FF45] hover:border-[#9BFF00]/40 hover:text-[#9BFF00] hover:bg-[#9BFF00]/5"
                        }`}
                      >
                        {item.is_active ? "Ban" : "Unban"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {users ? (
          <p className="mt-4 text-xs text-[#6B7785]">
            Showing {users.items.length} of {users.meta.total} users
          </p>
        ) : null}
      </section>

      {editingUser ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-2xl border border-[#1E2A39] bg-[#0D1725] p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-[#F3F7FB]">Edit risk limits</h3>
            <p className="mt-1 text-sm text-[#8E9AAA]">
              {editingUser.full_name} · {editingUser.email}
            </p>
            <p className="mt-3 text-xs text-[#6B7785]">
              When today&apos;s total PnL across all strategies reaches this loss, new orders are blocked.
            </p>

            <div className="mt-4 space-y-3">
              <label className="block text-sm text-[#C9D4E0]">
                Max daily loss (USD)
                <input
                  type="number"
                  min={1}
                  step={1}
                  value={maxDailyLoss}
                  onChange={(e) => setMaxDailyLoss(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-[#2A3B50] bg-[#0F1B2B] px-3 py-2 text-[#F3F7FB]"
                />
              </label>
              <div className="flex flex-wrap gap-2">
                {[500, 1000, 2000, 5000].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setMaxDailyLoss(String(preset))}
                    className={`rounded-lg border px-3 py-1 text-xs ${
                      maxDailyLoss === String(preset)
                        ? "border-[#9BFF00] text-[#9BFF00]"
                        : "border-[#2A3B50] text-[#8E9AAA] hover:border-[#3A4B60]"
                    }`}
                  >
                    ${preset}
                  </button>
                ))}
              </div>

              <label className="block text-sm text-[#C9D4E0]">
                Max trades per day
                <input
                  type="number"
                  min={1}
                  max={1000}
                  step={1}
                  value={maxTradesPerDay}
                  onChange={(e) => setMaxTradesPerDay(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-[#2A3B50] bg-[#0F1B2B] px-3 py-2 text-[#F3F7FB]"
                />
              </label>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={closeRiskModal}
                disabled={saving}
                className="rounded-lg border border-[#2A3B50] px-4 py-2 text-sm text-[#C9D4E0] disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void handleSaveRiskLimits()}
                disabled={saving}
                className="rounded-lg bg-[#9BFF00] px-4 py-2 text-sm font-semibold text-[#11140D] disabled:opacity-50"
              >
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
