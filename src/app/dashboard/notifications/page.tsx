"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { api } from "@/lib/api";
import { clearTokens, getAccessToken } from "@/lib/auth";
import { extractApiErrorMessage } from "@/lib/errors";
import type { AppNotification, CreateNotificationRequest } from "@/lib/types";

const DEFAULT_FORM: CreateNotificationRequest = {
  category: "system",
  title: "",
  message: "",
};

export default function NotificationsPage() {
  const router = useRouter();
  const [items, setItems] = useState<AppNotification[]>([]);
  const [form, setForm] = useState<CreateNotificationRequest>(DEFAULT_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const res = await api.get<AppNotification[]>("/notifications");
      setItems(res.data);
    } catch {
      setError("Unable to load notifications.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!getAccessToken()) {
      router.push("/login");
      return;
    }
    void loadNotifications();
  }, [router]);

  const onLogout = () => {
    clearTokens();
    router.push("/login");
  };

  const createNotification = async () => {
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      const res = await api.post<AppNotification>("/notifications", form);
      setItems((current) => [res.data, ...current]);
      setMessage("Notification created.");
      setForm(DEFAULT_FORM);
    } catch (err: unknown) {
      setError(extractApiErrorMessage(err, "Failed to create notification."));
    } finally {
      setSaving(false);
    }
  };

  const markAllRead = async () => {
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      await api.post("/notifications/mark-all-read");
      await loadNotifications();
      setMessage("All notifications marked as read.");
    } catch (err: unknown) {
      setError(extractApiErrorMessage(err, "Failed to mark all read."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-[#050607] text-gray-900 dark:text-[#E8ECEF]">
      <div className="mx-auto w-full max-w-[980px] px-4 py-6 sm:px-6">
        <header className="mb-6 flex items-center justify-between rounded-2xl border border-gray-200 dark:border-[#1A1E23] bg-white dark:bg-[#090B0F] px-5 py-4">
          <div>
            <p className="text-xs uppercase tracking-[0.14em] text-gray-500 dark:text-[#8B95A1]">Notifications</p>
            <h1 className="mt-1 text-2xl font-semibold text-gray-900 dark:text-[#F6FAFF]">Alerts & Updates</h1>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => router.push("/dashboard")} className="rounded-lg border border-[#242D37] px-3 py-2 text-sm text-[#C9D4E0] hover:border-purple-500/40 hover:text-purple-400 hover:bg-purple-500/5 transition duration-150 active:scale-95">Dashboard</button>
            <button onClick={onLogout} className="rounded-lg border border-[#242D37] px-3 py-2 text-sm text-[#C9D4E0] hover:border-purple-500/40 hover:text-purple-400 hover:bg-purple-500/5 transition duration-150 active:scale-95">Sign Out</button>
          </div>
        </header>

        {error ? <p className="mb-3 rounded-lg border border-red-300 dark:border-[#4F2A2A] bg-red-50 dark:bg-[#2A1414] px-3 py-2 text-sm text-red-600 dark:text-[#FFB4B4]">{error}</p> : null}
        {message ? <p className="mb-3 rounded-lg border border-purple-300 dark:border-purple-900/50 bg-purple-50 dark:bg-purple-950/20 px-3 py-2 text-sm text-purple-700 dark:text-purple-300">{message}</p> : null}

        <section className="rounded-2xl border border-gray-200 dark:border-[#1A1E23] bg-white dark:bg-[#0A0D13] p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-[#F3F7FB]">Create Notification</h2>
            <button onClick={markAllRead} disabled={saving} className="rounded-lg bg-purple-600 hover:bg-purple-700 active:scale-95 text-white px-3 py-2 text-xs font-semibold transition-all duration-100 disabled:opacity-50">Mark all read</button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm text-gray-500 dark:text-[#9AA5B1] flex flex-col">Category
              <select value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))} className="mt-1 w-full rounded-lg border border-gray-300 dark:border-[#26303B] hover:border-purple-400 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 bg-gray-50 dark:bg-[#0E141B] px-3 py-2 text-gray-900 dark:text-[#E8ECEF] outline-none transition-colors duration-150 cursor-pointer">
                <option value="system" className="bg-[#0F1B2B] text-white">System</option>
                <option value="admin" className="bg-[#0F1B2B] text-white">Admin</option>
                <option value="telegram" className="bg-[#0F1B2B] text-white">Telegram</option>
                <option value="email" className="bg-[#0F1B2B] text-white">Email</option>
              </select>
            </label>
            <label className="text-sm text-gray-500 dark:text-[#9AA5B1] flex flex-col">Title
              <input value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} className="mt-1 w-full rounded-lg border border-gray-300 dark:border-[#26303B] bg-gray-50 dark:bg-[#0E141B] px-3 py-2 text-gray-900 dark:text-[#E8ECEF] focus:border-purple-500 focus:outline-none transition-colors duration-150" />
            </label>
            <label className="text-sm text-gray-500 dark:text-[#9AA5B1] sm:col-span-2 flex flex-col">Message
              <textarea rows={3} value={form.message} onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))} className="mt-1 w-full rounded-lg border border-gray-300 dark:border-[#26303B] bg-gray-50 dark:bg-[#0E141B] px-3 py-2 text-gray-900 dark:text-[#E8ECEF] focus:border-purple-500 focus:outline-none transition-colors duration-150" />
            </label>
          </div>
          <button onClick={createNotification} disabled={saving || !form.title || !form.message} className="mt-4 rounded-lg bg-purple-600 hover:bg-purple-700 active:scale-95 text-white px-5 py-2 font-semibold transition-all duration-100 disabled:opacity-60">{saving ? "Saving..." : "Create"}</button>
        </section>

        <section className="mt-5 rounded-2xl border border-gray-200 dark:border-[#1A1E23] bg-white dark:bg-[#0A0D13] p-5">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-[#F3F7FB]">Inbox</h2>
          {loading ? <p className="mt-3 text-sm text-gray-500 dark:text-[#9AA5B1]">Loading...</p> : null}
          <div className="mt-3 space-y-3">
            {items.map((item) => (
              <article key={item.id} className="rounded-xl border border-gray-200 dark:border-[#24303A] bg-gray-50 dark:bg-[#0D131B] p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-base font-semibold text-gray-800 dark:text-[#EFF4FA]">{item.title}</h3>
                    <p className="text-xs text-gray-500 dark:text-[#8D9AAA]">{item.category} • {new Date(item.created_at).toLocaleString()}</p>
                  </div>
                  <span className={`rounded-full px-2 py-1 text-xs font-medium ${item.is_read ? "bg-gray-200 dark:bg-[#19222D] text-gray-500 dark:text-[#8FA0B2]" : "bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300"}`}>{item.is_read ? "Read" : "Unread"}</span>
                </div>
                <p className="mt-2 text-sm text-gray-600 dark:text-[#B8C2CF]">{item.message}</p>
              </article>
            ))}
            {!loading && items.length === 0 ? <p className="text-sm text-gray-400 dark:text-[#7F8A97]">No notifications yet.</p> : null}
          </div>
        </section>
      </div>
    </main>
  );
}