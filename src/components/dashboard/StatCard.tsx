"use client";

type StatCardProps = {
  label: string;
  value: string;
  subtext?: string;
};

export function StatCard({ label, value, subtext }: StatCardProps) {
  return (
    <article
      className="rounded-2xl px-5 py-4 transition-colors duration-300"
      style={{
        border: "1px solid var(--card-border)",
        backgroundColor: "var(--card-bg)",
      }}
    >
      <p className="text-sm" style={{ color: "var(--text-muted)" }}>{label}</p>
      <p className="mt-2 text-[28px] font-semibold leading-none" style={{ color: "var(--text-heading)" }}>
        {value}
      </p>
      {subtext ? (
        <p className="mt-2 text-xs" style={{ color: "var(--text-subtle)" }}>{subtext}</p>
      ) : null}
    </article>
  );
}