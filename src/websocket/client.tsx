"use client";
import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { getAccessToken } from "../lib/auth";

type WebsocketContextValue = {
  send: (event: string, payload?: unknown) => void;
  subscribe: (event: string, cb: (payload: any) => void) => () => void;
  subscribeMarketChannels: (channels: string[]) => void;
  isConnected: boolean;
};

const LIVE_WS_PATH = "/api/v1/ws/live";
const DEFAULT_MARKET_SYMBOLS = ["BTCUSD", "ETHUSD", "SOLUSD", "BNBUSD", "XRPUSD"];
const DEFAULT_MARKET_CHANNELS = DEFAULT_MARKET_SYMBOLS.map((symbol) => `candle:${symbol}`);

const WebsocketContext = createContext<WebsocketContextValue | null>(null);

// ─── Auth pages — no WS needed ───────────────────────────────────────────────
const SKIP_WS_PATHS = ["/login", "/register", "/forgot-password", "/reset-password", "/verify-otp", "/verify"];
function isAuthPage() {
  if (typeof window === "undefined") return false;
  const path = window.location.pathname;
  return SKIP_WS_PATHS.some((p) => path === p || path.startsWith(p + "/"));
}

// Backend WS endpoints (see backend/app/api/v1/ws_routes.py)
const WS_PATHS = [
  "/api/v1/ws/signals",
  "/api/v1/ws/pnl",
  "/api/v1/ws/strategies",
  "/api/v1/ws/auto-trading",
] as const;

function buildWsBaseUrl(): string {
  if (typeof window === "undefined") return "";

  const wsEnv = process.env.NEXT_PUBLIC_WS_BASE_URL;
  if (wsEnv) {
    try {
      const parsed = new URL(wsEnv);
      const protocol = parsed.protocol === "wss:" || parsed.protocol === "https:" ? "wss:" : "ws:";
      return `${protocol}//${parsed.host}`;
    } catch {
      // fall through
    }
  }

  const apiEnv = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (apiEnv) {
    try {
      const parsed = new URL(apiEnv);
      const protocol = parsed.protocol === "https:" ? "wss:" : "ws:";
      return `${protocol}//${parsed.host}`;
    } catch {
      // fall through
    }
  }

  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  return `${protocol}//${window.location.host}`;
}

function shouldAttachWsToken(wsBase: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    return new URL(wsBase).host !== window.location.host;
  } catch {
    return true;
  }
}

function buildAuthenticatedWsUrl(path: string, token: string | null): string {
  const base = buildWsBaseUrl();
  const url = `${base}${path}`;
  if (!token || !shouldAttachWsToken(base)) return url;
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}token=${encodeURIComponent(token)}`;
}

// ─── Backoff ──────────────────────────────────────────────────────────────────
function getBackoffMs(attempt: number, base = 3000, max = 60_000) {
  return Math.min(base * 2 ** attempt + Math.random() * 1000, max);
}

const MAX_FAILURES = 5;
const COOLDOWN_MS = 5 * 60 * 1000;

// ─── Single-channel WS connection manager ────────────────────────────────────
function createChannelConnection(
  url: string,
  listenersRef: React.MutableRefObject<Map<string, Set<(payload: any) => void>>>,
  onConnected: () => void,
  onDisconnected: () => void,
  onOpen?: (send: (msg: object) => void) => void,
) {
  // Redacted display URL for logging (avoid printing tokens)
  const displayUrl = url.replace(/([?&](?:token|ticket)=)[^&]+/, "$1REDACTED");
  let mounted = true;
  let ws: WebSocket | null = null;
  let reconnectTimer: number | null = null;
  let heartbeatTimer: number | null = null;
  let attempt = 0;
  let failures = 0;
  let coolingDown = false;
  let loggedConnectFailure = false;

  const clearTimers = () => {
    if (reconnectTimer) { window.clearTimeout(reconnectTimer); reconnectTimer = null; }
    if (heartbeatTimer) { window.clearInterval(heartbeatTimer); heartbeatTimer = null; }
  };

  const deliver = (key: string | null, payload: any) => {
    if (!key) return;
    listenersRef.current.get(key)?.forEach((cb) => cb(payload));
  };

  const connect = () => {
    if (!mounted || coolingDown) return;
    if (reconnectTimer) { window.clearTimeout(reconnectTimer); reconnectTimer = null; }
    if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) return;

    try {
      ws = new WebSocket(url);
    } catch (e) {
      if (!loggedConnectFailure) {
        console.warn(`[WS ${displayUrl}] Failed to create WebSocket:`, e);
        loggedConnectFailure = true;
      }
      failures++;
      scheduleReconnect();
      return;
    }

    ws.addEventListener("open", () => {
      if (!mounted) return;
      attempt = 0;
      failures = 0;
      loggedConnectFailure = false;
      onConnected();
      onOpen?.(send);
      if (heartbeatTimer) window.clearInterval(heartbeatTimer);
      heartbeatTimer = window.setInterval(() => {
        try {
          if (ws?.readyState === WebSocket.OPEN) ws.send(JSON.stringify({ type: "heartbeat" }));
        } catch {}
      }, 25_000);
    });

    ws.addEventListener("message", (ev) => {
      try {
        const data = JSON.parse(ev.data) as Record<string, any>;
        const channel = typeof data.channel === "string" ? data.channel : null;
        const typeKey = typeof data.type === "string" ? data.type : null;
        const payload = data.data ?? data.payload ?? data;
        deliver(channel, payload);
        if (channel !== typeKey) deliver(typeKey, payload);
      } catch {}
    });

    ws.addEventListener("close", (ev) => {
      if (!mounted) return;
      onDisconnected();
      if (heartbeatTimer) { window.clearInterval(heartbeatTimer); heartbeatTimer = null; }
      if (ev.code !== 1000 && ev.code !== 1001) {
        failures++;
        if (!loggedConnectFailure && failures >= MAX_FAILURES) {
          console.warn(`[WS ${displayUrl}] Connection unavailable after ${MAX_FAILURES} attempts (code ${ev.code}).`);
          loggedConnectFailure = true;
        }
      } else {
        failures = 0;
      }
      scheduleReconnect();
    });

    ws.addEventListener("error", () => {
      try { ws?.close(); } catch {}
    });
  };

  const scheduleReconnect = () => {
    if (!mounted) return;
    if (failures >= MAX_FAILURES) {
      if (!coolingDown) {
        coolingDown = true;
        reconnectTimer = window.setTimeout(() => {
          coolingDown = false;
          failures = 0;
          attempt = 0;
          connect();
        }, COOLDOWN_MS);
      }
      return;
    }
    const delay = getBackoffMs(attempt);
    attempt++;
    reconnectTimer = window.setTimeout(connect, delay);
  };

  const send = (msg: object) => {
    try {
      if (ws?.readyState === WebSocket.OPEN) ws.send(JSON.stringify(msg));
    } catch {}
  };

  const destroy = () => {
    mounted = false;
    clearTimers();
    try { ws?.close(1000, "unmounted"); } catch {}
    ws = null;
  };

  connect();
  return { send, destroy };
}

// ─── Provider ─────────────────────────────────────────────────────────────────
export function WebsocketProvider({ children }: { children: React.ReactNode }) {
  const listenersRef = useRef<Map<string, Set<(payload: any) => void>>>(new Map());
  const connectionsRef = useRef<Array<ReturnType<typeof createChannelConnection>>>([]);
  const liveSendRef = useRef<((msg: object) => void) | null>(null);
  const [connectedCount, setConnectedCount] = useState(0);
  const [accessToken, setAccessToken] = useState<string | null>(() => (typeof window === "undefined" ? null : getAccessToken()));

  useEffect(() => {
    if (isAuthPage()) return;

    const interval = window.setInterval(() => {
      const nextToken = getAccessToken();
      setAccessToken((current) => (current === nextToken ? current : nextToken));
    }, 2000);

    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isAuthPage()) return;

    const base = buildWsBaseUrl();
    if (!base) {
      console.error("[WS] Could not build WS base URL. Check NEXT_PUBLIC_WS_BASE_URL in .env");
      return;
    }

    if (!accessToken) return;

    const connections = WS_PATHS.map((path) =>
      createChannelConnection(
        buildAuthenticatedWsUrl(path, accessToken),
        listenersRef,
        () => setConnectedCount((n) => n + 1),
        () => setConnectedCount((n) => Math.max(0, n - 1)),
      ),
    );

    const liveConnection = createChannelConnection(
      buildAuthenticatedWsUrl(LIVE_WS_PATH, accessToken),
      listenersRef,
      () => setConnectedCount((n) => n + 1),
      () => setConnectedCount((n) => Math.max(0, n - 1)),
      (send) => {
        liveSendRef.current = send;
        send({ action: "subscribe", channels: DEFAULT_MARKET_CHANNELS });
      },
    );

    connectionsRef.current = [...connections, liveConnection];

    return () => {
      connectionsRef.current.forEach((c) => c.destroy());
      connectionsRef.current = [];
      liveSendRef.current = null;
      setConnectedCount(0);
    };
  }, [accessToken]);

  const send = (event: string, payload?: unknown) => {
    const msg = { type: event, payload };
    connectionsRef.current.forEach((c) => c.send(msg));
  };

  const subscribe = (event: string, cb: (payload: any) => void) => {
    const map = listenersRef.current;
    if (!map.has(event)) map.set(event, new Set());
    map.get(event)!.add(cb);
    return () => {
      map.get(event)?.delete(cb);
    };
  };

  const subscribeMarketChannels = (channels: string[]) => {
    const candleChannels = channels.filter((channel) => channel.startsWith("candle:"));
    if (!candleChannels.length) return;
    liveSendRef.current?.({ action: "subscribe", channels: candleChannels });
  };

  // isConnected = true if at least one channel is up
  const isConnected = connectedCount > 0;
  const value = useMemo(() => ({ send, subscribe, subscribeMarketChannels, isConnected }), [isConnected]);

  return (
    <WebsocketContext.Provider value={value}>
      {children}
    </WebsocketContext.Provider>
  );
}

export function useWebsocket() {
  const ctx = useContext(WebsocketContext);
  if (!ctx) throw new Error("useWebsocket must be used inside WebsocketProvider");
  return ctx;
}