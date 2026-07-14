export type SymbolSyncStatus = {
  candle_count?: number;
  latest_timestamp?: string | null;
  is_recent?: boolean;
  status?: string;
};

export type MarketHealth = {
  started?: boolean;
  candle_count?: number;
  tick_count?: number;
  websocket_connections?: number;
  last_candle_timestamp?: string | null;
  active_symbols?: string[];
  scheduler_started?: boolean;
  total_candles?: number;
  sync_status_by_symbol?: Record<string, SymbolSyncStatus>;
  realtime?: {
    service_started?: boolean;
    websocket_connections?: number;
    candles_generated?: number;
    ticks_received?: number;
    last_candle_time?: string | null;
    redis_available?: boolean;
    websocket_enabled?: boolean;
  };
  configured?: {
    symbols?: string[];
    periods?: number[];
  };
};

function latestTimestampFromSync(
  syncBySymbol: Record<string, SymbolSyncStatus> | undefined,
  symbols: string[],
): string | null {
  if (!syncBySymbol) return null;

  let latest: string | null = null;
  for (const symbol of symbols) {
    const candidate = syncBySymbol[symbol]?.latest_timestamp ?? null;
    if (candidate && (!latest || candidate > latest)) {
      latest = candidate;
    }
  }
  return latest;
}

/** Map nested /market-data/sync-status response to flat fields the UI expects. */
export function normalizeMarketHealth(raw: MarketHealth | null | undefined): MarketHealth | null {
  if (!raw) return null;

  const rt = raw.realtime;
  const configuredSymbols = raw.configured?.symbols ?? [];
  const dbLatest = latestTimestampFromSync(raw.sync_status_by_symbol, configuredSymbols);
  const liveCandles = rt?.candles_generated ?? 0;
  const dbCandles = raw.total_candles ?? 0;
  const configuredDbCount = configuredSymbols.reduce((sum, symbol) => {
    return sum + (raw.sync_status_by_symbol?.[symbol]?.candle_count ?? 0);
  }, 0);

  return {
    ...raw,
    started: raw.started ?? rt?.service_started ?? false,
    candle_count: Math.max(liveCandles, configuredDbCount, dbCandles > 0 ? 1 : 0),
    tick_count: raw.tick_count ?? rt?.ticks_received ?? 0,
    websocket_connections: raw.websocket_connections ?? rt?.websocket_connections ?? 0,
    last_candle_timestamp: raw.last_candle_timestamp ?? rt?.last_candle_time ?? dbLatest,
    active_symbols: raw.active_symbols ?? configuredSymbols,
    scheduler_started: raw.scheduler_started,
    realtime: rt,
  };
}
