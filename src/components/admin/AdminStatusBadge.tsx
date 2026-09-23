"use client";

type BadgeTone = "success" | "warning" | "danger" | "info" | "neutral" | "elite" | "pro" | "basic";

const TONE_STYLES: Record<BadgeTone, string> = {
  success: "border-emerald-900/50 bg-emerald-950/30 text-emerald-400",
  warning: "border-[#5A4A1A] bg-[#1A1508] text-[#FFD56A]",
  danger: "border-[#5A2A2A] bg-[#2A1414] text-[#FFB4B4]",
  info: "border-[#1A3A4A] bg-[#0E1A22] text-[#7DD3FC]",
  neutral: "border-[#242D37] bg-[#0E141B] text-[#8E9AAA]",
  elite: "border-[#4A3A14] bg-[#1A1508] text-[#FFD56A]",
  pro: "border-purple-900/50 bg-purple-950/30 text-purple-300",
  basic: "border-[#242D37] bg-[#10151D] text-[#C9D4E0]",
};

export function AdminStatusBadge({
  label,
  tone = "neutral",
}: {
  label: string;
  tone?: BadgeTone;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${TONE_STYLES[tone]}`}
    >
      {label}
    </span>
  );
}

export function subscriptionTone(status: string, planName?: string | null): BadgeTone {
  if (status === "active") {
    if (planName === "elite") return "elite";
    if (planName === "pro") return "pro";
    if (planName === "basic") return "basic";
    return "success";
  }
  if (status === "cancelled") return "danger";
  return "neutral";
}

export function kycTone(status: string): BadgeTone {
  if (status === "approved") return "success";
  if (status === "rejected") return "danger";
  return "warning";
}

export function paymentTone(status: string): BadgeTone {
  if (status === "verified") return "success";
  if (status === "submitted") return "warning";
  if (status === "rejected" || status === "expired") return "danger";
  return "info";
}
