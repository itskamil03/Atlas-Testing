import { pnlClass } from "@/lib/automatedStrategy";

type MetricCardProps = {
  label: string;
  value: string | number;
  format?: "number" | "pnl" | "percent";
};

export function MetricCard({ label, value, format = "number" }: MetricCardProps) {
  const displayValue =
    format === "pnl"
      ? Number(value).toFixed(2)
      : format === "percent"
        ? `${Number(value).toFixed(2)}%`
        : String(value);

  return (
    <article className="rounded-3xl border border-[#1A212A] bg-[#070A10] p-5">
      <p className="text-xs uppercase tracking-[0.12em] text-[#8E9AAA]">{label}</p>
      <p className={`mt-2 text-3xl font-semibold ${format === "pnl" ? pnlClass(value) : "text-[#F3F7FB]"}`}>
        {displayValue}
      </p>
    </article>
  );
}
