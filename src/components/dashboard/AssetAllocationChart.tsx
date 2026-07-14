"use client";

type AllocationSlice = {
  symbol: string;
  percentage: number;
};

const COLORS = ["#9BFF00", "#4ADE80", "#22C55E", "#16A34A", "#15803D"];

type AssetAllocationChartProps = {
  slices: AllocationSlice[];
};

export function AssetAllocationChart({ slices }: AssetAllocationChartProps) {
  if (!slices.length) {
    return (
      <div className="flex h-[220px] flex-col items-center justify-center text-center">
        <div
          className="relative mb-4 flex h-28 w-28 items-center justify-center rounded-full border-[10px]"
          style={{ borderColor: "var(--win-rate-bg)" }}
        >
          <span className="text-xs" style={{ color: "var(--text-subtle)" }}>No data</span>
        </div>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          You have no Assets Allocation yet!
        </p>
      </div>
    );
  }

  let cumulative = 0;
  const gradientStops = slices
    .map((slice, index) => {
      const start = cumulative;
      cumulative += slice.percentage;
      return `${COLORS[index % COLORS.length]} ${start}% ${cumulative}%`;
    })
    .join(", ");

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
      <div
        className="relative h-32 w-32 shrink-0 rounded-full"
        style={{ background: `conic-gradient(${gradientStops})` }}
      >
        <div
          className="absolute inset-[18%] flex items-center justify-center rounded-full text-center"
          style={{ backgroundColor: "var(--card-bg)" }}
        >
          <span className="text-[10px] leading-tight" style={{ color: "var(--text-muted)" }}>
            Allocation
          </span>
        </div>
      </div>
      <ul className="space-y-2 text-sm">
        {slices.map((slice, index) => (
          <li key={slice.symbol} className="flex items-center gap-2" style={{ color: "var(--text-body)" }}>
            <span
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: COLORS[index % COLORS.length] }}
            />
            <span className="font-medium">{slice.symbol}</span>
            <span style={{ color: "var(--text-subtle)" }}>{slice.percentage.toFixed(1)}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}