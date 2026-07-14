"use client";
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getCandles } from '@/lib/api';
import { toBackendSymbol } from '@/lib/tradingFormat';

export type CandlePoint = {
  ts: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
};

type BackendCandle = {
  ts?: number | string;
  timestamp?: number | string;
  t?: number | string;
  start_time?: string;
  end_time?: string;
  open?: number | string;
  high?: number | string;
  low?: number | string;
  close?: number | string;
  volume?: number | string | null;
};

function normalizeCandle(candle: BackendCandle): CandlePoint {
  const timestampCandidate = candle.ts ?? candle.timestamp ?? candle.t ?? candle.end_time ?? candle.start_time;
  const ts = typeof timestampCandidate === 'string' ? Date.parse(timestampCandidate) : Number(timestampCandidate ?? 0);

  return {
    ts: Number.isFinite(ts) ? ts : 0,
    open: Number(candle.open ?? 0),
    high: Number(candle.high ?? 0),
    low: Number(candle.low ?? 0),
    close: Number(candle.close ?? 0),
    volume: candle.volume == null ? undefined : Number(candle.volume),
  };
}

export function useCandlesQuery(symbol: string, period = '1m') {
  const qc = useQueryClient();
  const backendSymbol = toBackendSymbol(symbol);
  const key = ['candles', backendSymbol, period];

  const query = useQuery<CandlePoint[]>({
    queryKey: key,
    queryFn: async () => {
      const res = await getCandles(backendSymbol, period, 200, true);
      const candles = Array.isArray(res.data) ? res.data : [];
      return candles.map((candle: BackendCandle) => normalizeCandle(candle));
    },
    enabled: !!symbol,
    refetchInterval: false,
    staleTime: 5000,  // Cache for 5 seconds to reduce API hammering
    retry: 2,  // Retry failed requests twice
  });

  // Expose simple updater for websocket payloads
  const applyRealtimeCandle = (candle: BackendCandle | { data?: BackendCandle } | null | undefined) => {
    let nextCandle: BackendCandle | undefined;
    if (candle && typeof candle === 'object' && 'data' in candle) {
      nextCandle = candle.data;
    } else if (candle && typeof candle === 'object' && 'close' in candle) {
      nextCandle = candle as BackendCandle;
    }
    
    if (!nextCandle) return;

    qc.setQueryData<CandlePoint[]>(key, (old) => {
      const arr = Array.isArray(old) ? [...old] : [];
      const mapped = normalizeCandle(nextCandle);
      const last = arr[arr.length - 1];
      if (!last || mapped.ts > last.ts) arr.push(mapped);
      else arr[arr.length - 1] = mapped;
      return arr.slice(-200);
    });
  };

  return { ...query, applyRealtimeCandle };
}

export default useCandlesQuery;
