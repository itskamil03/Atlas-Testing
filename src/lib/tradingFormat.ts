const KNOWN_QUOTES = ["USDT", "USD", "BTC", "ETH", "INR", "USDC"];

// Delta Exchange symbol mapping (USDT → USD conversion)
export function toDeltaSymbol(symbol: string): string {
  const normalized = normalizeSymbol(symbol);
  // Convert BTCUSDT → BTCUSD for Delta Exchange
  if (normalized.endsWith("USDT")) {
    return normalized.slice(0, -1); // Remove the 'T' from USDT
  }
  return normalized;
}

// Convert Delta symbols back to display format
export function toDisplaySymbol(symbol: string): string {
  const normalized = normalizeSymbol(symbol);
  // Convert BTCUSD → BTCUSDT for UI display
  if (normalized.endsWith("USD") && !normalized.endsWith("USDT")) {
    return normalized + "T";
  }
  return normalized;
}

export const TIMEFRAME_OPTIONS = [
  { value: "1", label: "1m" },
  { value: "5", label: "5m" },
  { value: "15", label: "15m" },
  { value: "60", label: "1h" },
  { value: "240", label: "4h" },
] as const;

export function normalizeSymbol(raw: string): string {
  return (raw || "")
    .toUpperCase()
    .trim()
    .replace(/\s+/g, "")
    .replace(/_/g, "-")
    .replace(/\/+$/, "");
}

/** Map UI/API symbols to Delta Exchange backend format (BTCUSD, not BTCUSDT). */
export function toBackendSymbol(raw: string): string {
  return toDeltaSymbol(normalizeSymbol(raw).replace(/\//g, ""));
}

export function cleanContractSuffix(symbol: string): string {
  return symbol
    .replace(/-(PERP|PERPETUAL|FUT|FUTURES)$/i, "")
    .replace(/-(P|T)$/i, "");
}

export function formatSymbolForUi(raw: string): string {
  const normalized = cleanContractSuffix(normalizeSymbol(raw));
  if (!normalized) return "--";

  if (normalized.includes("/")) {
    const [base, quote] = normalized.split("/");
    return `${base}/${quote}`;
  }

  for (const quote of KNOWN_QUOTES) {
    if (normalized.endsWith(quote) && normalized.length > quote.length) {
      const base = normalized.slice(0, normalized.length - quote.length);
      return `${base}/${quote}`;
    }
  }

  return normalized;
}

export function formatTimeframeLabel(value: string | number): string {
  const num = Number(value);
  if (!Number.isFinite(num) || num <= 0) return "15m";
  if (num < 60) return `${num}m`;
  if (num % 60 === 0) {
    const hours = num / 60;
    if (hours < 24) return `${hours}h`;
    return `${Math.round(hours / 24)}d`;
  }
  return `${num}m`;
}

export function formatCurrencyCompact(value: number | string | null | undefined): string {
  const n = Number(value);
  if (!Number.isFinite(n)) return "--";
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: n >= 1000 ? 0 : 2,
  }).format(n);
}

export function safeNumber(value: unknown, fallback = 0): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}
