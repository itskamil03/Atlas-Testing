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
  if (isNaN(date.getTime())) return dateValue;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatShortDate(dateValue: string) {
  const date = new Date(`${dateValue}T00:00:00`);
  if (isNaN(date.getTime())) return dateValue;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatYValue(value: number, mode: PortfolioChartMode) {
  if (mode === "roi") return `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`;
  const abs = Math.abs(value);
  const sign = value >= 0 ? "+" : "-";
  if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `${sign}$${(abs / 1_000).toFixed(0)}K`;
  return `${sign}$${abs.toFixed(0)}`;
}

function formatTooltipValue(value: number, mode: PortfolioChartMode) {
  if (mode === "roi") return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
  return `${value >= 0 ? "+" : ""}$${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function computeDomain(values: number[]) {
  if (!values.length) return { min: 0, max: 1 };
  let min = Math.min(...values);
  let max = Math.max(...values);
  if (min === max) {
    const pad = Math.max(Math.abs(min) * 0.1, 10);
    min -= pad;
    max += pad;
  } else {
    const pad = (max - min) * 0.12;
    min -= pad;
    max += pad;
  }
  return { min, max };
}

function buildTicks(min: number, max: number, count = 6) {
  const step = (max - min) / Math.max(count - 1, 1);
  return Array.from({ length: count }, (_, i) => min + step * i);
}

function plotSeries(series: PortfolioChartPoint[]) {
  if (!series.length) return { points: [] as PlottedPoint[], yTicks: [] as number[], yMin: 0, yMax: 0 };

  // If there's only 1 point, create a baseline starting point so SVG polyline can render a full line
  let normalizedSeries = series;
  if (series.length === 1) {
    const singlePoint = series[0];
    const pointDate = new Date(`${singlePoint.date}T00:00:00`);
    const startDate = new Date(isNaN(pointDate.getTime()) ? Date.now() : pointDate.getTime());
    startDate.setDate(startDate.getDate() - 7);
    const startDateStr = startDate.toISOString().slice(0, 10);

    normalizedSeries = [
      {
        date: startDateStr,
        label: startDate.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        value: 0,
      },
      singlePoint,
    ];
  }

  const { min, max } = computeDomain(normalizedSeries.map((p) => p.value));
  const plotWidth = CHART_WIDTH - PADDING.left - PADDING.right;
  const plotHeight = CHART_HEIGHT - PADDING.top - PADDING.bottom;
  const yTicks = buildTicks(min, max);
  const points = normalizedSeries.map((p, i) => {
    const x = PADDING.left + (i / Math.max(normalizedSeries.length - 1, 1)) * plotWidth;
    const normalized = (p.value - min) / (max - min || 1);
    const y = PADDING.top + (1 - normalized) * plotHeight;
    const prev = i > 0 ? normalizedSeries[i - 1].value : p.value;
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

  const isPositive = (points[points.length - 1]?.value ?? 0) >= 0;
  const themeColor = isPositive ? "#10B981" : "#FB7185";

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
    <div className="rounded-2xl border border-[#1A212A] bg-[#0A0A0A] p-5 transition-colors duration-300">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <svg viewBox="0 0 24 24" className="h-5 w-5 text-[#8E9AAA]" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 18l4-6 4 3 4-8 4 5" />
          </svg>
          <h2 className="text-lg font-semibold text-[#F3F7FB]">Portfolio Performance</h2>
        </div>
        <div className="flex items-center rounded-xl border border-[#24303A] bg-[#0E141B] p-1 text-xs">
          {(["pnl", "roi"] as PortfolioChartMode[]).map((m) => {
            const isActive = mode === m;
            return (
              <button
                key={m}
                type="button"
                onClick={() => onModeChange(m)}
                className={`rounded-lg px-3 py-1.5 font-medium transition duration-150 ${
                  isActive
                    ? "bg-purple-600 text-white shadow-sm shadow-purple-600/30 font-semibold"
                    : "text-[#8E9AAA] hover:text-[#F3F7FB] border border-transparent"
                }`}
              >
                {m === "pnl" ? "P&L" : "ROI"}
              </button>
            );
          })}
        </div>
      </div>

      {/* Chart Area */}
      <div
        className="relative h-[320px] overflow-hidden rounded-xl border border-[#1A212A] bg-[#0B1118]"
        onPointerMove={hasData ? handlePointerMove : undefined}
        onPointerLeave={() => setHoveredIndex(null)}
      >
        {!hasData ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <p className="text-sm text-[#8E9AAA]">No trade performance data yet.</p>
            {emptyAction && (
              <button
                type="button"
                onClick={emptyAction.onClick}
                className="mt-3 rounded-full bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-700 shadow-md shadow-purple-600/20 transition active:scale-95"
              >
                {emptyAction.label}
              </button>
            )}
          </div>
        ) : (
          <>
            <svg viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`} className="absolute inset-0 h-full w-full">
              {/* Grid Lines & Y Ticks */}
              {yTicks.map((tick) => {
                const y = valueToY(tick, yMin, yMax);
                return (
                  <g key={tick}>
                    <line
                      x1={PADDING.left}
                      x2={CHART_WIDTH - PADDING.right}
                      y1={y}
                      y2={y}
                      stroke="#1A212A"
                      strokeWidth="1"
                      strokeDasharray="2 2"
                    />
                    <text
                      x={PADDING.left - 10}
                      y={y + 4}
                      textAnchor="end"
                      fill="#8E9AAA"
                      fontSize="11"
                      fontFamily="monospace"
                    >
                      {formatYValue(tick, mode)}
                    </text>
                  </g>
                );
              })}

              {/* Zero baseline */}
              {yMin < 0 && yMax > 0 && (
                <line
                  x1={PADDING.left}
                  x2={CHART_WIDTH - PADDING.right}
                  y1={baselineY}
                  y2={baselineY}
                  stroke="#374151"
                  strokeDasharray="4 4"
                  strokeWidth="1"
                />
              )}

              {/* Y Axis Label */}
              <text
                x={16}
                y={CHART_HEIGHT / 2}
                textAnchor="middle"
                transform={`rotate(-90 16 ${CHART_HEIGHT / 2})`}
                fill="#8E9AAA"
                fontSize="11"
                fontWeight="500"
              >
                {mode === "pnl" ? "P&L ($)" : "ROI (%)"}
              </text>

              <defs>
                <linearGradient id="portfolioAreaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={themeColor} stopOpacity="0.25" />
                  <stop offset="100%" stopColor={themeColor} stopOpacity="0" />
                </linearGradient>
              </defs>

              {/* Area Fill */}
              {areaPath && <path d={areaPath} fill="url(#portfolioAreaGradient)" />}

              {/* Line Polyline */}
              <polyline
                fill="none"
                stroke={themeColor}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={linePoints}
              />

              {/* X Axis Labels */}
              {xLabelIndices.map((i) => {
                const p = points[i];
                if (!p) return null;
                return (
                  <text
                    key={`${p.date}-${i}`}
                    x={p.x}
                    y={CHART_HEIGHT - 18}
                    textAnchor="middle"
                    fill="#8E9AAA"
                    fontSize="10"
                  >
                    {formatAxisDate(p.date)}
                  </text>
                );
              })}

              {/* Hover Indicator */}
              {hoveredPoint && (
                <g>
                  <line
                    x1={hoveredPoint.x}
                    x2={hoveredPoint.x}
                    y1={PADDING.top}
                    y2={CHART_HEIGHT - PADDING.bottom}
                    stroke={themeColor}
                    strokeDasharray="4 4"
                    opacity="0.6"
                  />
                  <circle cx={hoveredPoint.x} cy={hoveredPoint.y} r="8" fill={themeColor} opacity="0.2" />
                  <circle cx={hoveredPoint.x} cy={hoveredPoint.y} r="4.5" fill={themeColor} />
                </g>
              )}
            </svg>

            {/* Hover Tooltip */}
            {hoveredPoint && (
              <div
                className="pointer-events-none absolute z-10 rounded-xl border border-[#24303A] bg-[#0E141B] px-3.5 py-2.5 shadow-2xl transition-all duration-150"
                style={{
                  left: `${(hoveredPoint.x / CHART_WIDTH) * 100}%`,
                  top: `${((hoveredPoint.y - 14) / CHART_HEIGHT) * 100}%`,
                  transform: "translate(-50%, -100%)",
                }}
              >
                <p
                  className={`text-base font-bold ${
                    hoveredPoint.value >= 0 ? "text-emerald-400" : "text-[#FB7185]"
                  }`}
                >
                  {formatTooltipValue(hoveredPoint.value, mode)}
                </p>
                <p className="mt-0.5 text-[11px] text-[#8E9AAA]">
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