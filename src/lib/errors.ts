function isHtmlLike(text: string): boolean {
  const sample = text.trim().slice(0, 500).toLowerCase();
  return sample.includes("<html") || sample.includes("<!doctype") || sample.includes("<body");
}

function titleFromHtml(html: string): string | null {
  const match = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  return match?.[1]?.trim() ?? null;
}

function messageFromHttpStatus(status: number | undefined, fallback: string): string {
  switch (status) {
    case 401:
      return "Session expired. Please log in again.";
    case 403:
      return "You do not have permission for this action.";
    case 404:
      return "The requested resource was not found.";
    case 408:
      return "Request timed out. Please try again.";
    case 429:
      return "Too many requests. Please wait a moment and try again.";
    case 502:
      return "Broker service is temporarily unavailable. Delta Exchange may be down — try again in a few minutes.";
    case 503:
      return "Service temporarily unavailable. Please try again shortly.";
    case 504:
      return "Broker request timed out. Please try again.";
    default:
      return fallback;
  }
}

export function sanitizeErrorText(text: string, httpStatus?: number): string {
  const trimmed = text.trim();
  if (!trimmed) {
    return messageFromHttpStatus(httpStatus, "Something went wrong. Please try again.");
  }

  if (isHtmlLike(trimmed)) {
    const title = titleFromHtml(trimmed);
    if (title?.includes("502")) {
      return "Delta Exchange returned 502 Bad Gateway. Their server is temporarily unavailable — try again in a few minutes.";
    }
    if (title?.includes("503")) {
      return "Delta Exchange is temporarily unavailable (503). Please try again shortly.";
    }
    if (title?.includes("504")) {
      return "Delta Exchange request timed out (504). Please try again.";
    }
    if (title) {
      return `Broker service error: ${title}. Please try again.`;
    }
    return messageFromHttpStatus(
      httpStatus ?? 502,
      "Broker returned an unexpected response. Please try again.",
    );
  }

  // Strip accidental HTML fragments embedded in longer messages
  const htmlIndex = trimmed.search(/<html|<!doctype|<body/i);
  if (htmlIndex > 0) {
    const prefix = trimmed.slice(0, htmlIndex).trim().replace(/[:\s-]+$/, "");
    if (prefix.length >= 12) {
      return prefix.endsWith(".") ? prefix : `${prefix}.`;
    }
    return sanitizeErrorText(trimmed.slice(htmlIndex), httpStatus);
  }

  if (trimmed.length > 320) {
    return `${trimmed.slice(0, 280).trim()}…`;
  }

  return trimmed;
}

function normalizeRawMessage(raw: string, httpStatus?: number): string {
  const cleaned = sanitizeErrorText(raw, httpStatus);

  const lower = cleaned.toLowerCase();
  if (lower.includes("invalid phone number format") || lower.includes("e.164 format")) {
    return "Please enter a valid Email address (e.g. you@example.com) or Mobile Number with country code (e.g. +91 98765 43210).";
  }
  if (lower.includes("ip_not_whitelisted") || lower.includes("ip whitelist")) {
    return cleaned.includes("Add")
      ? cleaned
      : "API key IP whitelist mismatch. Add your server IP to Delta API settings, then reconnect.";
  }
  if (lower.includes("invalid_api_key") || lower.includes("invalid api key")) {
    return "Invalid API key or secret. Confirm keys match live vs testnet and have no extra spaces.";
  }

  return cleaned;
}

export function extractApiErrorMessage(err: unknown, fallback: string): string {
  if (typeof err !== "object" || !err) {
    return fallback;
  }

  const maybeAxios = err as {
    code?: string;
    message?: string;
    response?: { status?: number; data?: unknown };
  };

  const httpStatus = maybeAxios.response?.status;

  if (maybeAxios.code === "ECONNABORTED") {
    return "Request timed out. Please try again.";
  }

  const data = maybeAxios.response?.data;

  if (typeof data === "string" && data.trim()) {
    return normalizeRawMessage(data, httpStatus);
  }

  if (typeof data === "object" && data) {
    const payload = data as {
      detail?: unknown;
      message?: unknown;
      error?: { code?: unknown; message?: unknown } | unknown;
    };

    if (typeof payload.detail === "string" && payload.detail.trim()) {
      return normalizeRawMessage(payload.detail, httpStatus);
    }

    if (Array.isArray(payload.detail)) {
      const first = payload.detail[0] as { msg?: unknown } | undefined;
      if (first && typeof first.msg === "string" && first.msg.trim()) {
        return normalizeRawMessage(first.msg, httpStatus);
      }
    }

    if (typeof payload.message === "string" && payload.message.trim()) {
      return normalizeRawMessage(payload.message, httpStatus);
    }

    if (typeof payload.error === "object" && payload.error) {
      const structured = payload.error as { code?: unknown; message?: unknown };
      if (typeof structured.message === "string" && structured.message.trim()) {
        return normalizeRawMessage(structured.message, httpStatus);
      }
      if (typeof structured.code === "string" && structured.code.trim()) {
        return normalizeRawMessage(structured.code, httpStatus);
      }
    }
  }

  if (typeof maybeAxios.message === "string" && maybeAxios.message.includes("Network Error")) {
    return "Network error. Please check that the backend server is running.";
  }

  if (httpStatus && httpStatus >= 400) {
    return messageFromHttpStatus(httpStatus, fallback);
  }

  return fallback;
}

export function extractIpFromErrorText(text: string): string | null {
  const ipv6 = text.match(/([0-9a-fA-F]{1,4}:){2,}([0-9a-fA-F]{1,4})/);
  if (ipv6) return ipv6[0];
  const ipv4 = text.match(/\b(?:\d{1,3}\.){3}\d{1,3}\b/);
  return ipv4 ? ipv4[0] : null;
}

export function formatBrokerSyncWarningText(
  raw: string,
  whitelistIp?: string | null,
  meta?: {
    deltaClientIp?: string | null;
    errorCode?: string | null;
    environment?: string | null;
    baseUrl?: string | null;
  },
): string {
  const deltaIp = meta?.deltaClientIp?.trim() || null;
  const shownIp = whitelistIp?.trim() || null;

  if (deltaIp && shownIp && deltaIp !== shownIp) {
    return `Delta sees requests from ${deltaIp}, but this page shows ${shownIp}. Whitelist ${deltaIp} on Delta, then click Refresh.`;
  }

  if (meta?.errorCode === "ip_not_whitelisted_for_api_key" && deltaIp) {
    return `Whitelist ${deltaIp} on Delta (${meta.environment ?? "live"} API), wait 2–3 minutes, then Refresh. If already added, Disconnect → enable correct Testnet/Live mode → Connect again.`;
  }

  if (meta?.errorCode === "invalid_api_key") {
    const env = meta.environment === "testnet" ? "testnet" : "live";
    return `API keys don't match ${env} mode (${meta.baseUrl ?? env}). Use Delta testnet keys with testnet checked, or live keys without it, then Disconnect and Connect again.`;
  }

  const base = brokerSyncWarningMessage({ response: { data: { detail: raw }, status: 400 } }, whitelistIp);
  if (meta?.environment) {
    return `${base} (Using ${meta.environment} API)`;
  }
  return base;
}

/** User-friendly warning when broker is linked but live balance/positions sync failed. */
export function brokerSyncWarningMessage(err: unknown, whitelistIp?: string | null): string {
  const raw = extractApiErrorMessage(err, "Live broker data could not be loaded.");
  const lower = raw.toLowerCase();
  const ip = whitelistIp ?? extractIpFromErrorText(raw);

  if (lower.includes("ip whitelist") || lower.includes("ip_not_whitelisted")) {
    return ip
      ? `Broker connected. Add ${ip} to your Delta API IP whitelist, then click Refresh to sync balance and positions.`
      : "Broker connected. Add your server IP to Delta API whitelist, then click Refresh to sync live data.";
  }

  if (lower.includes("502") || lower.includes("bad gateway")) {
    return "Broker connected. Delta Exchange is temporarily unavailable — live balance will update when they're back online.";
  }

  if (lower.includes("invalid api key")) {
    return "Broker linked, but live sync failed. Re-check API keys (live vs testnet) and try Refresh.";
  }

  return `Broker connected. Live sync pending: ${raw}`;
}
