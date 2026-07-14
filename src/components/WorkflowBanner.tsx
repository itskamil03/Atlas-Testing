"use client";

import Link from "next/link";

import { useBrokerConnected } from "@/hooks/useBrokerConnected";

type WorkflowBannerProps = {
  activeStep?: "broker" | "strategies" | "deploy" | "monitor";
};

const STEPS = [
  { id: "broker" as const, label: "Connect Broker", href: "/dashboard/broker" },
  { id: "strategies" as const, label: "Select Strategy", href: "/strategies" },
  { id: "deploy" as const, label: "Deploy & Set Limits", href: "/strategies" },
  { id: "monitor" as const, label: "Auto Trade Live", href: "/my-strategies" },
];

export function WorkflowBanner({ activeStep = "broker" }: WorkflowBannerProps) {
  const { hasBroker, isLoading } = useBrokerConnected();
  const resolvedStep = !isLoading && hasBroker && activeStep === "broker" ? "strategies" : activeStep;

  return (
    <section className="rounded-2xl border border-[#1A212A] bg-[linear-gradient(135deg,#0A1017,#070A10)] px-5 py-4">
      <p className="text-xs uppercase tracking-[0.14em] text-[#8E9AAA]">Auto trading workflow</p>
      <ol className="mt-4 flex flex-wrap gap-2">
        {STEPS.map((step, index) => {
          const isActive = step.id === resolvedStep;
          const isComplete =
            (step.id === "broker" && hasBroker) ||
            (step.id === "strategies" && resolvedStep === "deploy") ||
            (step.id === "deploy" && resolvedStep === "monitor");

          return (
            <li key={step.id}>
              <Link
                href={step.href}
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm transition ${
                  isActive
                    ? "border-[#9BFF00]/40 bg-[#10150E] text-[#DFFFAB]"
                    : isComplete
                      ? "border-[#2B3440] bg-[#0D1218] text-[#9BFF00]"
                      : "border-[#242D37] bg-[#0D1218] text-[#B7C2CF] hover:border-[#33404D]"
                }`}
              >
                <span className="flex h-5 w-5 items-center justify-center rounded-full border border-current text-[11px]">
                  {isComplete && !isActive ? "✓" : index + 1}
                </span>
                {step.label}
              </Link>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
