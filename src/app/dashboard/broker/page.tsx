"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { BrokerConnectCard } from "@/components/BrokerConnectCard";
import { WorkflowBanner } from "@/components/WorkflowBanner";
import { api, getBrokerAccounts, getBrokerSnapshotSafe } from "@/lib/api";
import { getAccessToken } from "@/lib/auth";
import { extractApiErrorMessage } from "@/lib/errors";
import type { BrokerAccount, BrokerBalance, BrokerPosition } from "@/lib/types";

const SERVER_WHITELIST_IP_STORAGE_KEY = "delta_server_whitelist_ip";

function formatMoney(value: string | number | null | undefined, currency = "USD") {
  const num = Number(value);
  if (!Number.isFinite(num)) return "--";
  return `${currency} ${num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function StatTile({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: string;
  hint?: string;
  tone: "green" | "blue" | "amber";
}) {
  const styles = {
    green: "border-purple-500/30 bg-[linear-gradient(145deg,#130D24,#0A0A0A)]",
    blue: "border-[#60A5FA]/25 bg-[linear-gradient(145deg,#0A1018,#0A0A0A)]",
    amber: "border-[#F59E0B]/25 bg-[linear-gradient(145deg,#141008,#0A0A0A)]",
  };

  return (
    <article className={`rounded-2xl border p-5 ${styles[tone]}`}>
      <p className="text-sm text-[#8E9AAA]">{label}</p>
      <p className="mt-2 text-[26px] font-semibold leading-tight text-[#F3F7FB]">{value}</p>
      {hint ? <p className="mt-1 text-xs text-[#6B7785]">{hint}</p> : null}
    </article>
  );
}

function readStoredWhitelistIp(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(SERVER_WHITELIST_IP_STORAGE_KEY)?.trim() || null;
  } catch {
    return null;
  }
}

export default function BrokerPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const nextPath = searchParams.get("next");
  const [whitelistIp, setWhitelistIp] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    if (!getAccessToken()) router.push("/login");
  }, [router]);

  useEffect(() => {
    setWhitelistIp(readStoredWhitelistIp());
    void api
      .get<{ whitelist: string | null }>("/broker/whitelist")
      .then((res) => {
        if (res.data?.whitelist) setWhitelistIp(res.data.whitelist);
      })
      .catch(() => {
        // ignore — local storage fallback already applied
      });
  }, []);

  const accountsQuery = useQuery({
    queryKey: ["broker", "accounts"],
    queryFn: async () => (await getBrokerAccounts()).data as BrokerAccount[],
    throwOnError: false,
    retry: false,
  });

  const hasConnectedAccount = (accountsQuery.data?.length ?? 0) > 0;

  const snapshotQuery = useQuery({
    queryKey: ["broker", "snapshot"],
    queryFn: async () => {
      const previous = queryClient.getQueryData<Awaited<ReturnType<typeof getBrokerSnapshotSafe>>>([
        "broker",
        "snapshot",
      ]);
      return getBrokerSnapshotSafe(previous, whitelistIp);
    },
    enabled: hasConnectedAccount,
    throwOnError: false,
    retry: false,
    staleTime: 15_000,
  });

  const snapshot = snapshotQuery.data?.snapshot ?? null;
  const syncWarning = snapshotQuery.data?.syncWarning ?? null;
  const brokerEnvironment = snapshotQuery.data?.environment ?? null;
  const brokerBaseUrl = snapshotQuery.data?.baseUrl ?? null;

  const refreshAll = () => {
    void accountsQuery.refetch();
    void queryClient.invalidateQueries({ queryKey: ["broker", "snapshot"] });
  };

  const disconnect = async (id: number) => {
    setActionError(null);
    try {
      await api.delete(`/broker/accounts/${id}`);
      refreshAll();
    } catch (err) {
      setActionError(extractApiErrorMessage(err, "Unable to disconnect broker account."));
    }
  };

  const balance = snapshot?.balance as BrokerBalance | undefined;
  const positions = (snapshot?.positions ?? []) as BrokerPosition[];
  const balanceCurrency = balance?.currency || "USD";
  const balanceMain =
    snapshotQuery.isLoading && hasConnectedAccount
      ? "Loading..."
      : formatMoney(balance?.balance, balanceCurrency);
  const balanceHint = syncWarning
    ? "Sync pending — whitelist IP on Delta"
    : balance?.available_balance
      ? `Available ${formatMoney(balance.available_balance, balanceCurrency)}`
      : hasConnectedAccount
        ? "Live wallet snapshot"
        : "Connect a broker first";

  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-16 top-0 h-64 w-64 rounded-full bg-purple-600/15 blur-[90px]" />
        <div className="absolute right-0 top-24 h-72 w-72 rounded-full bg-[#3B82F6]/10 blur-[110px]" />
      </div>

      <div className="relative mx-auto w-full max-w-[1180px] px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <WorkflowBanner activeStep="broker" />
        </div>

        
        <section className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="inline-flex rounded-full border border-purple-500/25 bg-purple-500/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.12em] text-purple-400">
              Exchange connection
            </span>
            <h1 className="mt-3 text-[15px] font-semibold text-[#F3F7FB] sm:text-[32px]">Broker</h1>
          </div>
          {hasConnectedAccount ? (
            <button
              type="button"
              onClick={() => router.push("/strategies")}
              className="rounded-xl bg-purple-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-purple-700 shadow-md shadow-purple-600/25 transition active:scale-95"
            >
              Browse strategies →
            </button>
          ) : null}
        </section>

        <section className="mb-6 grid gap-4 sm:grid-cols-3">
          <StatTile
            label="Connected accounts"
            value={String(accountsQuery.data?.length ?? 0)}
            hint={hasConnectedAccount ? "Ready for auto trading" : "No account linked yet"}
            tone="green"
          />
          <StatTile label="Broker balance" value={balanceMain} hint={balanceHint} tone="blue" />
          <StatTile
            label="Open positions"
            value={String(positions.length)}
            hint={syncWarning ? "Refresh after whitelisting IP" : "From live broker feed"}
            tone="amber"
          />
        </section>

        {syncWarning ? (
          <div className="mb-4 space-y-2">
            <p className="rounded-xl border border-[#4A4428] bg-[#2A2414] px-4 py-3 text-sm text-[#F5D98B]">
              {syncWarning}
            </p>
            {brokerEnvironment ? (
              <p className="text-xs text-[#8E9AAA]">
                API mode: <span className="text-[#C9D4E0]">{brokerEnvironment.toUpperCase()}</span>
                {brokerBaseUrl ? ` · ${brokerBaseUrl.replace(/^https?:\/\//, "")}` : null}
              </p>
            ) : null}
          </div>
        ) : null}

        <section className="grid gap-5 xl:grid-cols-[1fr_1.05fr]">
          <BrokerConnectCard
            onConnected={() => {
              refreshAll();
              if (nextPath) router.push(nextPath);
            }}
          />

          <div className="space-y-5">
            <section className="rounded-3xl border border-[#1F2833] bg-[#0A0A0A]/90 p-5 backdrop-blur">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.12em] text-[#6B7785]">Your accounts</p>
                  <h2 className="mt-1 text-lg font-semibold text-[#F3F7FB]">Connected brokers</h2>
                </div>
                <button
                  type="button"
                  onClick={refreshAll}
                  disabled={snapshotQuery.isFetching || accountsQuery.isFetching}
                  className="rounded-xl border border-[#26303A] px-3 py-2 text-xs text-[#C1CBD8] hover:border-purple-500/40 hover:text-purple-300 disabled:opacity-60 transition"
                >
                  {snapshotQuery.isFetching || accountsQuery.isFetching ? "Refreshing..." : "Refresh"}
                </button>
              </div>

              <div className="space-y-3">
                {accountsQuery.data?.length ? (
                  accountsQuery.data.map((account) => (
                    <article
                      key={account.id}
                      className="rounded-2xl border border-[#242C35] bg-[#0E141B] p-4 transition hover:border-purple-500/30"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/15 text-sm font-bold uppercase text-purple-400">
                            {account.broker_name.slice(0, 2)}
                          </div>
                          <div>
                            <p className="font-semibold capitalize text-[#F3F7FB]">{account.broker_name}</p>
                            <p className="mt-0.5 text-xs text-[#8D9AAA]">
                              {account.display_client_id ?? account.exchange_user_id ?? `Account #${account.id}`}
                            </p>
                            <p className="mt-1 text-[11px] text-[#6B7785]">
                              Connected {new Date(account.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <span
                          className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${
                            account.is_active
                              ? "bg-purple-950/40 text-purple-400 border border-purple-500/30"
                              : "bg-[#2A1414] text-[#FFB4B4]"
                          }`}
                        >
                          {account.is_active ? "Active" : "Inactive"}
                        </span>
                      </div>
                      <div className="mt-4 flex justify-end">
                        <button
                          type="button"
                          onClick={() => void disconnect(account.id)}
                          className="rounded-lg border border-[#FB7185]/30 px-3 py-1.5 text-xs font-medium text-[#FB7185] hover:bg-[#FB7185]/10"
                        >
                          Disconnect
                        </button>
                      </div>
                    </article>
                  ))
                ) : (
                  <div className="rounded-2xl border border-dashed border-[#26303A] px-4 py-10 text-center">
                    <p className="text-sm font-medium text-[#C9D4E0]">No broker connected yet</p>
                    <p className="mt-1 text-xs text-[#6B7785]">
                      Use the form on the left to link Delta or a demo broker.
                    </p>
                  </div>
                )}
              </div>
            </section>

            <section className="rounded-3xl border border-[#1F2833] bg-[#0A0A0A]/90 p-5 backdrop-blur">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.12em] text-[#6B7785]">Live feed</p>
                  <h2 className="mt-1 text-lg font-semibold text-[#F3F7FB]">Broker positions</h2>
                </div>
                <span className="text-xs text-[#6B7785]">{positions.length} open</span>
              </div>

              {positions.length ? (
                <div className="overflow-hidden rounded-xl border border-[#212934]">
                  <table className="min-w-full text-left text-sm">
                    <thead className="border-b border-[#212934] bg-[#0E141B] text-[11px] uppercase tracking-wide text-[#778493]">
                      <tr>
                        <th className="px-3 py-2.5">Symbol</th>
                        <th className="px-3 py-2.5">Qty</th>
                        <th className="px-3 py-2.5">Unrealized P&amp;L</th>
                      </tr>
                    </thead>
                    <tbody>
                      {positions.map((position) => (
                        <tr key={position.symbol} className="border-t border-[#1D2530] text-[#C9D4E0]">
                          <td className="px-3 py-2.5 font-medium">{position.symbol}</td>
                          <td className="px-3 py-2.5">{position.quantity}</td>
                          <td
                            className={`px-3 py-2.5 font-medium ${
                              Number(position.unrealized_pnl) >= 0 ? "text-emerald-400" : "text-[#FB7185]"
                            }`}
                          >
                            {position.unrealized_pnl}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-[#26303A] px-4 py-8 text-center">
                  <p className="text-sm text-[#8E9AAA]">No live positions on broker</p>
                  <p className="mt-1 text-xs text-[#6B7785]">
                    {syncWarning
                      ? "Whitelist your IP on Delta, then click Refresh."
                      : "Positions sync after you connect and refresh."}
                  </p>
                </div>
              )}
            </section>
          </div>
        </section>
      </div>
    </div>
  );
}
