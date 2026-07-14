"use client";

import { useMemo, useState, type PointerEvent } from "react";

export type PortfolioChartPoint = { date: string; label: string; value: number };
export type PortfolioChartMode = "pnl" | "roi";

const CHART_WIDTH = 760;
const CHART_HEIGHT = 320;
const PADDING = { top: 28, right: 20, bottom: 56, left: 72 };

type PlottedPoint = PortfolioChartPoint & { x: number; y: number; delta: number };

function formatAxisDate(dateValue: string) {
  const date = new Date(`${dateValue}T00:00:00`);
  return `${date.toLocaleDateString("en-US", { month: "short" })} '${date.toLocaleDateString("en-US", { year: "2-digit" })}`;
}

function formatShortDate(dateValue: string) {
  return new Date(`${dateValue}T00:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatYValue(value: number, mode: PortfolioChartMode) {
  if (mode === "roi") return `${value.toFixed(0)}%`;
  const abs = Math.abs(value);
  if (abs >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `${(value / 1_000).toFixed(0)}K`;
  return value.toFixed(0);
}

function formatTooltipValue(value: number, mode: PortfolioChartMode) {
  if (mode === "roi") return `${value.toFixed(2)}%`;
  return `$${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function computeDomain(values: number[]) {
  if (!values.length) return { min: 0, max: 1 };
  let min = Math.min(...values);
  let max = Math.max(...values);
  if (min === max) { const pad = Math.max(Math.abs(min) * 0.1, 1); min -= pad; max += pad; }
  else { const pad = (max - min) * 0.08; min -= pad; max += pad; }
  return { min, max };
}

function buildTicks(min: number, max: number, count = 6) {
  const step = (max - min) / Math.max(count - 1, 1);
  return Array.from({ length: count }, (_, i) => min + step * i);
}

function plotSeries(series: PortfolioChartPoint[]) {
  if (!series.length) return { points: [] as PlottedPoint[], yTicks: [] as number[], yMin: 0, yMax: 0 };
  const { min, max } = computeDomain(series.map((p) => p.value));
  const plotWidth = CHART_WIDTH - PADDING.left - PADDING.right;
  const plotHeight = CHART_HEIGHT - PADDING.top - PADDING.bottom;
  const yTicks = buildTicks(min, max);
  const points = series.map((p, i) => {
    const x = PADDING.left + (i / Math.max(series.length - 1, 1)) * plotWidth;
    const normalized = (p.value - min) / (max - min || 1);
    const y = PADDING.top + (1 - normalized) * plotHeight;
    const prev = i > 0 ? series[i - 1].value : p.value;
    return { ...p, x, y, delta: p.value - prev };
  });
  return { points, yTicks, yMin: min, yMax: max };
}

function valueToY(value: number, yMin: number, yMax: number) {
  const plotHeight = CHART_HEIGHT - PADDING.top - PADDING.bottom;
  return PADDING.top + (1 - (value - yMin) / (yMax - yMin || 1)) * plotHeight;
}

type Props = {
  series: PortfolioChartPoint[];
  mode: PortfolioChartMode;
  onModeChange: (mode: PortfolioChartMode) => void;
  emptyAction?: { label: string; onClick: () => void };
};

export function PortfolioPerformanceChart({ series, mode, onModeChange, emptyAction }: Props) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const { points, yTicks, yMin, yMax } = useMemo(() => plotSeries(series), [series]);
  const hasData = points.length > 0;
  const hoveredPoint = hoveredIndex === null ? null : (points[hoveredIndex] ?? null);
  const linePoints = points.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  const bottomY = CHART_HEIGHT - PADDING.bottom;
  const baselineY = valueToY(0, yMin, yMax);

  const areaPath = useMemo(() => {
    if (!points.length) return "";
    const first = points[0];
    const last = points[points.length - 1];
    const line = points.map((p) => `L ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
    return `M ${first.x.toFixed(1)} ${bottomY} L ${first.x.toFixed(1)} ${first.y.toFixed(1)} ${line.slice(1)} L ${last.x.toFixed(1)} ${bottomY} Z`;
  }, [points, bottomY]);

  const xLabelIndices = useMemo(() => {
    if (points.length <= 1) return [0];
    const target = Math.min(6, points.length);
    const step = Math.max(1, Math.floor((points.length - 1) / (target - 1)));
    const indices: number[] = [];
    for (let i = 0; i < points.length; i += step) indices.push(i);
    if (indices[indices.length - 1] !== points.length - 1) indices.push(points.length - 1);
    return indices;
  }, [points.length]);

  const handlePointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const chartX = ((e.clientX - rect.left) / rect.width) * CHART_WIDTH;
    const plotWidth = CHART_WIDTH - PADDING.left - PADDING.right;
    const step = plotWidth / Math.max(points.length - 1, 1);
    const idx = Math.min(Math.max(Math.round((chartX - PADDING.left) / Math.max(step, 1)), 0), points.length - 1);
    setHoveredIndex(idx);
  };

  return (
    <div
      className="rounded-2xl p-5 transition-colors duration-300"
      style={{ border: "1px solid var(--card-border)", backgroundColor: "var(--card-bg)" }}
    >
      {/* Header */}
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2"
            style={{ color: "var(--text-muted)" }}>
            <path d="M4 18l4-6 4 3 4-8 4 5" />
          </svg>
          <h2 className="text-lg font-semibold" style={{ color: "var(--text-heading)" }}>
            Portfolio Performance
          </h2>
        </div>
        <div
          className="flex items-center rounded-lg p-1 text-xs"
          style={{ border: "1px solid var(--chart-toggle-border)", backgroundColor: "var(--chart-toggle-bg)" }}
        >
          {(["pnl", "roi"] as PortfolioChartMode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => onModeChange(m)}
              className="rounded px-3 py-1.5 font-medium transition"
              style={{
                backgroundColor: mode === m ? "var(--chart-active-bg)" : "transparent",
                color: mode === m ? "var(--text-heading)" : "var(--chart-text)",
              }}
            >
              {m === "pnl" ? "P&L" : "ROI"}
            </button>
          ))}
        </div>
      </div>

      {/* Chart Area */}
      <div
        className="relative h-[320px] overflow-hidden rounded-xl transition-colors duration-300"
        style={{ border: "1px solid var(--chart-border)", backgroundColor: "var(--chart-bg)" }}
        onPointerMove={hasData ? handlePointerMove : undefined}
        onPointerLeave={() => setHoveredIndex(null)}
      >
        {!hasData ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>No trade performance data yet.</p>
            {emptyAction && (
              <button type="button" onClick={emptyAction.onClick}
                className="mt-3 rounded-full bg-[#9BFF00] px-4 py-2 text-sm font-semibold text-[#11140D]">
                {emptyAction.label}
              </button>
            )}
          </div>
        ) : (
          <>
            <svg viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`} className="absolute inset-0 h-full w-full">
              {yTicks.map((tick) => {
                const y = valueToY(tick, yMin, yMax);
                return (
                  <g key={tick}>
                    <line x1={PADDING.left} x2={CHART_WIDTH - PADDING.right} y1={y} y2={y}
                      stroke="var(--chart-border)" strokeWidth="1" />
                    <text x={PADDING.left - 10} y={y + 4} textAnchor="end"
                      fill="var(--text-subtle)" fontSize="11">
                      {formatYValue(tick, mode)}
                    </text>
                  </g>
                );
              })}

              {yMin < 0 && yMax > 0 && (
                <line x1={PADDING.left} x2={CHART_WIDTH - PADDING.right}
                  y1={baselineY} y2={baselineY}
                  stroke="var(--card-border-alt)" strokeDasharray="4 4" />
              )}

              <text x={16} y={CHART_HEIGHT / 2} textAnchor="middle"
                transform={`rotate(-90 16 ${CHART_HEIGHT / 2})`}
                fill="var(--text-muted)" fontSize="11" fontWeight="500">
                {mode === "pnl" ? "P&L ($)" : "ROI (%)"}
              </text>

              <defs>
                <linearGradient id="portfolioAreaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--text-body)" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="var(--text-body)" stopOpacity="0" />
                </linearGradient>
              </defs>

              {areaPath && <path d={areaPath} fill="url(#portfolioAreaGradient)" opacity="0.35" />}
              <polyline fill="none" stroke="var(--text-body)" strokeWidth="2" points={linePoints} />

              {xLabelIndices.map((i) => {
                const p = points[i];
                if (!p) return null;
                return (
                  <text key={`${p.date}-${i}`} x={p.x} y={CHART_HEIGHT - 18} textAnchor="end"
                    transform={`rotate(-35 ${p.x} ${CHART_HEIGHT - 18})`}
                    fill="var(--text-subtle)" fontSize="10">
                    {formatAxisDate(p.date)}
                  </text>
                );
              })}

              {hoveredPoint && (
                <g>
                  <line x1={hoveredPoint.x} x2={hoveredPoint.x}
                    y1={PADDING.top} y2={CHART_HEIGHT - PADDING.bottom}
                    stroke="#9BFF00" strokeDasharray="4 5" opacity="0.6" />
                  <circle cx={hoveredPoint.x} cy={hoveredPoint.y} r="5" fill="#9BFF00" />
                </g>
              )}
            </svg>

            {hoveredPoint && (
              <div
                className="pointer-events-none absolute z-10 rounded-xl px-4 py-3 text-center shadow-lg transition-colors duration-300"
                style={{
                  border: "1px solid var(--tooltip-border)",
                  backgroundColor: "var(--tooltip-bg)",
                  left: `${(hoveredPoint.x / CHART_WIDTH) * 100}%`,
                  top: `${((hoveredPoint.y - 14) / CHART_HEIGHT) * 100}%`,
                  transform: "translate(-50%, -100%)",
                }}
              >
                <p className="text-lg font-semibold" style={{ color: "var(--text-heading)" }}>
                  {formatTooltipValue(hoveredPoint.value, mode)}
                </p>
                <p className="mt-1 text-[11px]" style={{ color: "var(--text-body)" }}>
                  {formatShortDate(hoveredPoint.date)}
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}