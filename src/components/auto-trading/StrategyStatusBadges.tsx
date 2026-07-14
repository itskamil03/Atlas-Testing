import type { StrategyCard } from "@/lib/types";

type StrategyStatusBadgesProps = {
  strategy: Pick<StrategyCard, "is_public" | "is_featured">;
};

export function StrategyStatusBadges({ strategy }: StrategyStatusBadgesProps) {
  const badges: Array<{ label: string; className: string }> = [];

  if (strategy.is_featured) {
    badges.push({ label: "Featured", className: "border-[#3A4A28] bg-[#1A2410] text-[#DFFFAB]" });
  }
  if (strategy.is_public) {
    badges.push({ label: "Published", className: "border-[#31503A] bg-[#142419] text-[#AEE7B8]" });
  } else if (strategy.is_featured) {
    badges.push({ label: "Draft", className: "border-[#4A4428] bg-[#2A2414] text-[#F5D98B]" });
  } else {
    badges.push({ label: "Archived", className: "border-[#2B3440] bg-[#0B1118] text-[#93A0AE]" });
  }

  return (
    <div className="flex flex-wrap gap-1">
      {badges.map((badge) => (
        <span key={badge.label} className={`rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${badge.className}`}>
          {badge.label}
        </span>
      ))}
    </div>
  );
}
