"use client";

import { FormEvent, useEffect, useState } from "react";

import { api } from "@/lib/api";
import { extractApiErrorMessage } from "@/lib/errors";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { BrokerAccount } from "@/lib/types";

const SERVER_WHITELIST_IP_STORAGE_KEY = "delta_server_whitelist_ip";

function extractIpFromText(value: string): string | null {
  if (!value || typeof value !== "string") return null;
  const ipv6 = value.match(/([0-9a-fA-F]{1,4}:){2,}([0-9a-fA-F]{1,4})/);
  if (ipv6) return ipv6[0];
  const ipv4 = value.match(/\b(?:\d{1,3}\.){3}\d{1,3}\b/);
  return ipv4 ? ipv4[0] : null;
}

function extractIpFromUnknownError(error: unknown): string | null {
  if (!error || typeof error !== "object") return null;
  const maybeAxios = error as { message?: string; response?: { data?: unknown } };
  if (typeof maybeAxios.message === "string") {
    const fromMessage = extractIpFromText(maybeAxios.message);
    if (fromMessage) return fromMessage;
  }
  const responseData = maybeAxios.response?.data;
  if (typeof responseData === "string") return extractIpFromText(responseData);
  if (responseData && typeof responseData === "object") {
    try {
      return extractIpFromText(JSON.stringify(responseData));
    } catch {
      return null;
    }
  }
  return null;
}

function persistServerWhitelistIp(ip: string) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(SERVER_WHITELIST_IP_STORAGE_KEY, ip);
  } catch {
    // ignore
  }
}

type Props = {
  onConnected: (account: BrokerAccount) => void;
};

export function BrokerConnectCard({ onConnected }: Props) {
  const [apiKey, setApiKey] = useState("");
  const [apiSecret, setApiSecret] = useState("");
  const [passphrase, setPassphrase] = useState("");
  const [useTestnet, setUseTestnet] = useState(false);
  const [serverWhitelistIp, setServerWhitelistIp] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const queryClient = useQueryClient();

  const connectMutation = useMutation<BrokerAccount, Error, void>({
    mutationFn: async () => {
      const res = await api.post<BrokerAccount>(
        "/broker/connect",
        {
          broker_name: "delta",
          api_key: apiKey.trim(),
          api_secret: apiSecret.trim(),
          passphrase: passphrase.trim() || null,
          is_testnet: useTestnet,
          account_type: useTestnet ? "testnet" : "real",
        },
        { timeout: 30000 },
      );
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["broker", "accounts"] });
      onConnected(data);
      setMessage("Broker connected successfully.");
      setApiKey("");
      setApiSecret("");
      setPassphrase("");
    },
    onError: (err: unknown) => {
      const extractedMessage = extractApiErrorMessage(err, "Broker connection failed. Check credentials and try again.");
      const detectedIp = extractIpFromUnknownError(err) || extractIpFromText(extractedMessage);
      if (detectedIp) {
        persistServerWhitelistIp(detectedIp);
        setServerWhitelistIp(detectedIp);
        setMessage(
          "Add the whitelisted IP above to your Delta API settings, then try connecting again.",
        );
        return;
      }
      setMessage(extractedMessage);
    },
  });

  const loading = connectMutation.isPending;

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");
    connectMutation.mutate();
  };

  useEffect(() => {
    void (async () => {
      try {
        const res = await api.get<{ whitelist: string | null }>("/broker/whitelist");
        if (res?.data?.whitelist) {
          setServerWhitelistIp(res.data.whitelist);
          persistServerWhitelistIp(res.data.whitelist);
          return;
        }
      } catch {
        // ignore
      }
      try {
        const persisted = window.localStorage.getItem(SERVER_WHITELIST_IP_STORAGE_KEY);
        if (persisted?.trim()) {
          setServerWhitelistIp(persisted.trim());
          return;
        }
      } catch {
        // ignore
      }
      try {
        const res = await api.get<{ ip: string }>("/client-ip");
        if (res?.data?.ip) setServerWhitelistIp(res.data.ip);
      } catch {
        // ignore
      }
    })();
  }, []);

  const isError = message.toLowerCase().includes("failed") || message.toLowerCase().includes("invalid");

  return (
    <section className="rounded-3xl border border-[#1F2833] bg-[#0A0A0A]/90 p-5 backdrop-blur sm:p-6">
      <div className="mb-5">
        <p className="text-xs uppercase tracking-[0.12em] text-[#6B7785]">Step 1</p>
        <h3 className="mt-1 text-xl font-semibold text-[#F3F7FB]">Connect Delta Exchange</h3>
        <p className="mt-1 text-sm text-[#8E9AAA]">Live trading is supported on Delta Exchange only.</p>
      </div>

      {serverWhitelistIp ? (
        <div className="mb-5 rounded-2xl border border-purple-500/20 bg-purple-500/5 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-purple-400">Whitelist this IP on Delta</p>
          <div className="mt-2 flex items-center gap-2">
            <code className="flex-1 overflow-x-auto rounded-xl border border-[#26303A] bg-[#0A0A0A] px-3 py-2 text-sm text-[#D5DEE8]">
              {serverWhitelistIp}
            </code>
            <button
              type="button"
              onClick={() => void navigator.clipboard?.writeText(serverWhitelistIp)}
              className="rounded-xl border border-[#26303A] px-3 py-2 text-sm text-[#C1CBD8] hover:border-purple-500/40 hover:text-purple-300"
            >
              Copy
            </button>
          </div>
        </div>
      ) : null}

      <form onSubmit={onSubmit} className="space-y-3">
        <label className="flex items-center gap-3 rounded-xl border border-[#26303A] bg-[#0E141B] px-3 py-2.5 text-sm text-[#C9D4E0]">
          <input
            type="checkbox"
            checked={useTestnet}
            onChange={(event) => setUseTestnet(event.target.checked)}
            className="rounded border-[#242C35] accent-purple-600"
          />
          Use Delta testnet (testnet-api.delta.exchange)
        </label>

        <input
          className="w-full rounded-xl border border-[#26303A] bg-[#0E141B] px-4 py-3 text-sm text-[#E8ECEF] placeholder:text-[#5C6775] focus:border-purple-500/50 focus:outline-none"
          value={apiKey}
          onChange={(event) => setApiKey(event.target.value)}
          placeholder="API Key"
          required
        />
        <input
          type="password"
          className="w-full rounded-xl border border-[#26303A] bg-[#0E141B] px-4 py-3 text-sm text-[#E8ECEF] placeholder:text-[#5C6775] focus:border-purple-500/50 focus:outline-none"
          value={apiSecret}
          onChange={(event) => setApiSecret(event.target.value)}
          placeholder="API Secret"
          required
        />
        <input
          className="w-full rounded-xl border border-[#26303A] bg-[#0E141B] px-4 py-3 text-sm text-[#E8ECEF] placeholder:text-[#5C6775] focus:border-purple-500/50 focus:outline-none"
          value={passphrase}
          onChange={(event) => setPassphrase(event.target.value)}
          placeholder="Passphrase (optional)"
        />

        <button
          className="w-full rounded-xl bg-purple-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-purple-700 shadow-md shadow-purple-600/20 disabled:opacity-60"
          type="submit"
          disabled={loading}
        >
          {loading ? "Connecting..." : "Connect broker"}
        </button>
      </form>

      {message ? (
        <p
          className={`mt-4 rounded-xl border px-3 py-2.5 text-sm ${
            isError
              ? "border-[#4F2A2A] bg-[#2A1414] text-[#FFB4B4]"
              : "border-[#31503A] bg-[#142419] text-[#AEE7B8]"
          }`}
        >
          {message}
        </p>
      ) : null}
    </section>
  );
}
