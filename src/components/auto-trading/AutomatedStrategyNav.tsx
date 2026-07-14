import Link from "next/link";

type NavKey = "marketplace" | "list" | "detail" | "dashboard" | "signals" | "trades" | "logs";

type AutomatedStrategyNavProps = {
  strategyId?: number;
  active: NavKey;
};

export function AutomatedStrategyNav({ strategyId, active }: AutomatedStrategyNavProps) {
  const links: Array<{ href: string; label: string; key: NavKey }> = [
    { href: "/strategies", label: "Strategies", key: "marketplace" },
    { href: "/my-strategies", label: "My Strategies", key: "list" },
  ];

  if (strategyId) {
    links.push(
      { href: `/my-strategies/${strategyId}`, label: "Details", key: "detail" },
      { href: `/my-strategies/${strategyId}/trades`, label: "Trades", key: "trades" },
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Link
        href="/dashboard"
        className="rounded-full border border-[#242D37] bg-[#0D1218] px-3 py-2 text-sm text-[#9BFF00] transition hover:border-[#9BFF00]/50"
      >
        ← Home
      </Link>
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={`rounded-full border px-3 py-2 text-sm transition ${
            active === link.key
              ? "border-[#9BFF00] bg-[#10150E] text-[#DFFFAB]"
              : "border-[#242D37] bg-[#0D1218] text-[#B7C2CF] hover:border-[#33404D] hover:text-[#E8EEF5]"
          }`}
        >
          {link.label}
        </Link>
      ))}
    </div>
  );
}
