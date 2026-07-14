"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import useEmblaCarousel from 'embla-carousel-react';

import { api } from "@/lib/api";
import { clearTokens, getAccessToken } from "@/lib/auth";
import { getAdminRoute, setAdminViewMode } from "@/lib/adminRoutes";
import { extractApiErrorMessage } from "@/lib/errors";
import type { StrategyCard, UserProfile } from "@/lib/types";

const rawDummyStrategies = [
  {
    id: 1,
    name: "Momentum Master",
    description: "",
    strategy_tag: "MOMENTUM",
    exchange: "Binance",
    followers: 1247,
    pnl: "15420.75",
    roi_percent: "42.3",
    chart_points: "120,145,138,162,158,175,189,201,198,215,234,248",
    recommended_margin: "2500",
    mdd_percent: "12.5",
    win_rate_percent: "68.4",
    is_featured: true,
    is_public: true,
    user_id: 101,
    risk_level: "high",
    academy_slugs: "",
    logo_url: "/strategies/momentum-master-logo.png",
    image_url: "/strategies/momentum-master-banner.png",
    tags: "",
    created_at: new Date().toISOString(),
  },
  {
    id: 2,
    name: "Scalping Pro",
    description: "",
    strategy_tag: "SCALPING",
    exchange: "Bybit",
    followers: 892,
    pnl: "8750.30",
    roi_percent: "28.7",
    chart_points: "85,92,88,95,102,98,105,112,108,115,122,128",
    recommended_margin: "1500",
    mdd_percent: "8.2",
    win_rate_percent: "74.1",
    is_featured: false,
    is_public: true,
    user_id: 102,
    risk_level: "high",
    academy_slugs: "scalping-techniques,risk-management",
    logo_url: "/strategies/scalping-pro-logo.png",
    image_url: "/strategies/scalping-pro-banner.png",
    tags: "scalping,high-frequency,short-term",
    created_at: new Date().toISOString(),
  },
  {
    id: 3,
    name: "Trend Hunter",
    description: "",
    strategy_tag: "TREND",
    exchange: "OKX",
    followers: 2156,
    pnl: "28750.40",
    roi_percent: "67.8",
    chart_points: "200,185,210,245,238,265,289,312,308,335,358,392",
    recommended_margin: "5000",
    mdd_percent: "15.3",
    win_rate_percent: "62.7",
    is_featured: true,
    is_public: true,
    user_id: 103,
    risk_level: "high",
    academy_slugs: "trend-following,market-analysis",
    logo_url: "/strategies/trend-hunter-logo.png",
    image_url: "/strategies/trend-hunter-banner.png",
    tags: "trend,long-term,swing",
    created_at: new Date().toISOString(),
  },
  {
    id: 4,
    name: "Arbitrage Alpha",
    description: "",
    strategy_tag: "ARBITRAGE",
    exchange: "KuCoin",
    followers: 534,
    pnl: "6320.15",
    roi_percent: "15.9",
    chart_points: "150,155,152,158,160,157,163,165,162,168,170,167",
    recommended_margin: "3000",
    mdd_percent: "4.8",
    win_rate_percent: "82.3",
    is_featured: false,
    is_public: true,
    user_id: 104,
    risk_level: "low",
    academy_slugs: "arbitrage-basics",
    logo_url: "/strategies/arbitrage-alpha-logo.png",
    image_url: "/strategies/arbitrage-alpha-banner.png",
    tags: "arbitrage,low-risk,market-neutral",
    created_at: new Date().toISOString(),
  },
  {
    id: 5,
    name: "Mean Reversion",
    description: "",
    strategy_tag: "REVERSION",
    exchange: "Bitget",
    followers: 1678,
    pnl: "-3240.50",
    roi_percent: "-12.4",
    chart_points: "300,285,278,265,259,248,235,228,215,208,195,188",
    recommended_margin: "2000",
    mdd_percent: "18.7",
    win_rate_percent: "45.2",
    is_featured: false,
    is_public: true,
    user_id: 105,
    risk_level: "medium",
    academy_slugs: "mean-reversion,market-psychology",
    logo_url: "/strategies/mean-reversion-logo.png",
    image_url: "/strategies/mean-reversion-banner.png",
    tags: "mean-reversion,statistical,ranging-market",
    created_at: new Date().toISOString(),
  },
];

const dummyStrategies: StrategyCard[] = rawDummyStrategies.map((s) => ({
  strategy_type: "CUSTOM",
  parameters: null,
  symbol: null,
  timeframe: "1h",
  signal_source: "platform_engine",
  last_backtest_id: null,
  ...s,
})) as StrategyCard[];

// ─────────────────────────────────────────────
// FAQ DATA
// ─────────────────────────────────────────────
interface FaqItem {
  tag: string;
  question: string;
  answer: string;
}

const faqs: FaqItem[] = [
  {
    tag: "General",
    question: "What is a Strategy on Atlas Trading Software?",
    answer:
      "A Strategy is a rule-based trading system listed on the platform that can automatically execute trades on your connected exchange account. Strategies may be fully automated, semi-automated, or signal-based depending on the creator.",
  },
  {
    tag: "Getting Started",
    question: "How do I start using a Strategy?",
    answer:
      "Simply select a strategy, connect your exchange account using API keys, configure your capital allocation and settings, then activate the strategy. Once enabled, trades will begin executing automatically based on the strategy logic.",
  },
  {
    tag: "Risk",
    question: "Can I customize risk and capital allocation?",
    answer:
      "Yes. You can control how much capital is allocated to each strategy and manage risk settings according to your preference. This helps you use strategies more safely and diversify across multiple systems.",
  },
  {
    tag: "Evaluation",
    question: "How can I evaluate a Strategy before subscribing?",
    answer:
      "Each strategy page includes performance analytics such as returns, drawdown, win rate, trade history, live P&L, and equity curves. You should review both profitability and risk metrics before activating any strategy.",
  },
  {
    tag: "Automation",
    question: "Are trades executed automatically without my input?",
    answer:
      "Yes — once a strategy is activated and your exchange is connected, all trades are placed automatically. You can pause or stop the strategy at any time from your dashboard without affecting open positions unless you choose to close them.",
  },
];

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────
function parseSeries(points: string | null): number[] {
  if (!points) return [];
  return points
    .split(",")
    .map((item) => Number(item.trim()))
    .filter((item) => Number.isFinite(item));
}

function buildPolylinePoints(raw: number[]): string {
  if (!raw.length) return "0,80 320,80";
  const min = Math.min(...raw);
  const max = Math.max(...raw);
  const spread = max - min || 1;
  return raw
    .map((value, index) => {
      const x = (index / Math.max(raw.length - 1, 1)) * 320;
      const normalized = (value - min) / spread;
      const y = 70 - normalized * 50;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}

// ─────────────────────────────────────────────
// FAQ SUB-COMPONENTS
// ─────────────────────────────────────────────
function PlusIcon({ open }: { open: boolean }) {
  return (
    <span
      className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border transition-all duration-200 ${
        open ? "border-[#9BFF00] bg-[#9BFF00]" : "border-gray-300 dark:border-[#1D2A36] bg-gray-100 dark:bg-[#0D1520]"
      }`}
    >
      <svg
        width="12"
        height="12"
        viewBox="0 0 12 12"
        fill="none"
        className={`transition-transform duration-300 ${open ? "rotate-45" : "rotate-0"}`}
      >
        <path
          d="M6 2v8M2 6h8"
          strokeWidth="2"
          strokeLinecap="round"
          stroke={open ? "#11140D" : "#7A8A99"}
        />
      </svg>
    </span>
  );
}

function FaqAccordionItem({
  item,
  isOpen,
  onToggle,
}: {
  item: FaqItem;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border-t border-gray-200 dark:border-[#161D27] last:border-b last:border-gray-200 dark:last:border-[#161D27]">
      <button
        onClick={onToggle}
        aria-expanded={isOpen}
        className="flex w-full items-center justify-between gap-4 py-5 text-left"
      >
        <span
          className={`flex-1 text-[15px] font-semibold leading-snug transition-colors duration-200 ${
            isOpen ? "text-gray-900 dark:text-[#F6FAFF]" : "text-gray-600 dark:text-[#C8D5E0]"
          }`}
        >
          {item.question}
        </span>
        <PlusIcon open={isOpen} />
      </button>

      <div
        className="overflow-hidden transition-all duration-[350ms] ease-[cubic-bezier(0.4,0,0.2,1)]"
        style={{ maxHeight: isOpen ? "300px" : "0px" }}
      >
        <div className="pb-5 pr-11">
          <span className="mb-2.5 inline-block rounded-md border border-[rgba(155,255,0,0.18)] bg-[rgba(155,255,0,0.07)] px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-[#9BFF00]">
            {item.tag}
          </span>
          <p className="text-sm leading-relaxed text-gray-500 dark:text-[#7A8A99]">{item.answer}</p>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────
export default function StrategiesPage() {
  const router = useRouter();

  const [emblaRef, emblaApi] = useEmblaCarousel({
    slidesToScroll: 1,
    align: "start",
    containScroll: "trimSnaps",
    duration: 30,
    loop: false,
    breakpoints: {
      "(max-width: 768px)": { slidesToScroll: 1 },
    },
  });

  const [strategies, setStrategies] = useState<StrategyCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [prevBtnDisabled, setPrevBtnDisabled] = useState(true);
  const [nextBtnDisabled, setNextBtnDisabled] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  // FAQ state
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const loadPage = async () => {
    setLoading(true);
    setError(null);
    try {
      const [profileRes] = await Promise.all([api.get<UserProfile>("/auth/me")]);
      const viewMode = typeof window !== "undefined" ? sessionStorage.getItem("viewMode") : null;
      if (profileRes.data.role === "admin" && viewMode !== "trader") {
        setAdminViewMode();
        router.replace(getAdminRoute("strategies"));
        return;
      }
      setStrategies(dummyStrategies);
    } catch (err: unknown) {
      const status =
        typeof err === "object" && err && "response" in err
          ? ((err as { response?: { status?: unknown } }).response?.status as
              | number
              | undefined)
          : undefined;
      if (status === 401) {
        clearTokens();
        router.push("/login");
        return;
      }
      setError(extractApiErrorMessage(err, "Unable to load strategy catalog."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!getAccessToken()) {
      router.push("/login");
      return;
    }
    void loadPage();
  }, [router]);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => {
      setPrevBtnDisabled(!emblaApi.canScrollPrev());
      setNextBtnDisabled(!emblaApi.canScrollNext());
      setSelectedIndex(emblaApi.selectedScrollSnap());
    };
    const onInit = () => {
      setScrollSnaps(emblaApi.scrollSnapList());
      onSelect();
    };
    emblaApi.on("select", onSelect);
    emblaApi.on("init", onInit);
    onInit();
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("init", onInit);
    };
  }, [emblaApi]);

  const scrollPrev = () => emblaApi?.scrollPrev();
  const scrollNext = () => emblaApi?.scrollNext();
  const scrollTo = (index: number) => emblaApi?.scrollTo(index);

  const getRiskLevelColor = (riskLevel: string) => {
    switch (riskLevel) {
      case "low":    return "text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-400/10 border-green-300 dark:border-green-400/30";
      case "medium": return "text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-400/10 border-yellow-300 dark:border-yellow-400/30";
      case "high":   return "text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-400/10 border-red-300 dark:border-red-400/30";
      default:       return "text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-400/10 border-gray-300 dark:border-gray-400/30";
    }
  };

  // ── Strategy Card ──────────────────────────
  const StrategyCardComponent = ({ strategy }: { strategy: StrategyCard }) => {
    const pnl   = Number(strategy.pnl);
    const roi   = Number(strategy.roi_percent);
    const chart = parseSeries(strategy.chart_points);

    return (
      <article
        className="flex-shrink-0 w-full md:w-[calc(33.333%-1rem)] mx-2 rounded-3xl border border-gray-200 dark:border-[#1D2630] bg-white dark:bg-[linear-gradient(180deg,#0E141D,#0A1017)] p-4 shadow-md dark:shadow-[0_14px_30px_rgba(0,0,0,0.35)] transition-all duration-300"
        style={
          strategy.is_featured
            ? {
                outline: "1.5px solid #9BFF00",
                outlineOffset: "-1px",
                boxShadow:
                  "0 0 18px rgba(155,255,0,0.20), 0 14px 30px rgba(0,0,0,0.35)",
              }
            : undefined
        }
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-[#F4F9FF]">{strategy.name}</h3>
            <p className="text-xs text-gray-500 dark:text-[#8B97A5]">
              {strategy.exchange} • {strategy.followers.toLocaleString()} followers
            </p>
          </div>
          <div className="flex gap-2 flex-wrap justify-end">
            <span className="rounded-full border border-gray-300 dark:border-[#2B3440] px-2 py-0.5 text-[11px] text-gray-600 dark:text-[#B4BFCD]">
              {strategy.strategy_tag}
            </span>
            <span
              className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${getRiskLevelColor(strategy.risk_level)}`}
            >
              {strategy.risk_level.toUpperCase()}
            </span>
          </div>
        </div>

        {/* PnL */}
        <div className="mt-4">
          <p className={`text-[26px] font-semibold ${pnl >= 0 ? "text-green-600 dark:text-[#22D08C]" : "text-red-600 dark:text-[#FB6969]"}`}>
            {pnl >= 0 ? "+" : ""}${Math.abs(pnl).toFixed(2)}
          </p>
          <p className={`text-sm ${roi >= 0 ? "text-green-600 dark:text-[#22D08C]" : "text-red-600 dark:text-[#FB6969]"}`}>
            {roi >= 0 ? "▲" : "▼"} {Math.abs(roi).toFixed(2)}%
          </p>
        </div>

        {/* Chart */}
        <div className="mt-4 h-20 rounded-xl border border-gray-200 dark:border-[#202A35] bg-gray-50 dark:bg-[#0A1119] p-2">
          <svg viewBox="0 0 320 80" className="h-full w-full">
            <polyline
              fill="none"
              stroke={pnl >= 0 ? "#21D08A" : "#FB6969"}
              strokeWidth="2.5"
              points={buildPolylinePoints(chart)}
            />
          </svg>
        </div>

        {/* Stats */}
        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-lg border border-gray-200 dark:border-[#1F2833] bg-gray-50 dark:bg-[#0B121A] px-3 py-2">
            <p className="text-[11px] uppercase tracking-[0.08em] text-gray-500 dark:text-[#7D8A98]">
              Recommended Margin
            </p>
            <p className="mt-1 font-semibold text-gray-900 dark:text-[#EAF0F7]">
              ${Number(strategy.recommended_margin).toFixed(0)}
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 dark:border-[#1F2833] bg-gray-50 dark:bg-[#0B121A] px-3 py-2">
            <p className="text-[11px] uppercase tracking-[0.08em] text-gray-500 dark:text-[#7D8A98]">MDD</p>
            <p className="mt-1 font-semibold text-gray-900 dark:text-[#EAF0F7]">
              {Number(strategy.mdd_percent).toFixed(1)}%
            </p>
          </div>
        </div>

        {/* Win Rate */}
        <div className="mt-3">
          <div className="mb-1 flex items-center justify-between text-xs text-gray-500 dark:text-[#8B97A5]">
            <span>Win Rate</span>
            <span>{Number(strategy.win_rate_percent).toFixed(1)}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-red-100 dark:bg-[#2A1212]">
            <div
              className="h-full rounded-full bg-[#FB6969]"
              style={{
                width: `${Math.min(Math.max(Number(strategy.win_rate_percent), 0), 100)}%`,
              }}
            />
          </div>
        </div>

        {/* Description */}
        <div className="mt-3">
          <p className="text-xs text-gray-500 dark:text-[#A4B0BF] line-clamp-2">{strategy.description}</p>
        </div>

        {/* CTA */}
        <button
          onClick={() => router.push(`/dashboard/strategy/${strategy.id}`)}
          className="mt-4 w-full rounded-xl bg-[#9BFF00] px-4 py-2 font-semibold text-[#11140D] hover:bg-[#B7FF45] transition-colors duration-200"
        >
          Explore Strategy
        </button>
      </article>
    );
  };

  // ── Page ───────────────────────────────────
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-[#040607] text-gray-900 dark:text-[#E8ECEF]">
      <div className="mx-auto w-full max-w-[1240px] px-4 py-6 sm:px-6 lg:px-8">

        {/* ── Top Nav Header ── */}
        <header className="rounded-2xl border border-gray-200 dark:border-[#1A1F26] bg-white dark:bg-[#080B10] px-5 py-4">
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-gray-500 dark:text-[#91A0AF]">ATLUS BOARD</p>
              <h1 className="mt-1 text-[28px] font-semibold text-gray-900 dark:text-[#F6FAFF]">Sample Strategies</h1>
            </div>
          </div>
        </header>

        {/* ── Error Banner ── */}
        {error && (
          <p className="mt-4 rounded-lg border border-red-300 dark:border-[#4F2A2A] bg-red-50 dark:bg-[#2A1414] px-3 py-2 text-sm text-red-600 dark:text-[#FFB4B4]">
            {error}
          </p>
        )}

        {/* ── Strategy Carousel ── */}
        {loading ? (
          <p className="mt-5 rounded-xl border border-gray-200 dark:border-[#1A1E23] bg-white dark:bg-[#090B0F] px-5 py-8 text-gray-500 dark:text-[#9AA5B1]">
            Loading strategies...
          </p>
        ) : (
          <section className="relative mt-5 overflow-hidden rounded-2xl border border-gray-200 bg-white/80 p-4 dark:border-[#1A212A] dark:bg-[#070A10]/80">
            <div className="pointer-events-none select-none blur-[5px]">
            {/* Carousel header */}
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-sm font-semibold text-gray-700 dark:text-[#DDE5EE]">
                Sample Strategies ({strategies.length})
              </h2>
              {strategies.length > 3 && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={scrollPrev}
                    disabled={prevBtnDisabled}
                    className="rounded-full border border-gray-300 dark:border-[#28323D] p-2 text-gray-500 dark:text-[#A6B1BE] disabled:cursor-not-allowed disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-[#1A2028] transition-all duration-200 hover:scale-110"
                    aria-label="Previous slide"
                  >
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M15 18l-6-6 6-6" />
                    </svg>
                  </button>
                  <button
                    onClick={scrollNext}
                    disabled={nextBtnDisabled}
                    className="rounded-full border border-gray-300 dark:border-[#28323D] p-2 text-gray-500 dark:text-[#A6B1BE] disabled:cursor-not-allowed disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-[#1A2028] transition-all duration-200 hover:scale-110"
                    aria-label="Next slide"
                  >
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 6l6 6-6 6" />
                    </svg>
                  </button>
                </div>
              )}
            </div>

            {/* Embla carousel — padding+negative-margin trick prevents hover clipping */}
            <div
              ref={emblaRef}
              style={{
                overflow: "hidden",
                padding: "12px 8px",
                margin: "-12px -8px",
              }}
            >
              <div className="flex" style={{ gap: "1rem" }}>
                {strategies.map((strategy) => (
                  <StrategyCardComponent key={strategy.id} strategy={strategy} />
                ))}
              </div>
            </div>

            {/* Dots navigation */}
            {strategies.length > 3 && scrollSnaps.length > 1 && (
              <div className="flex justify-center gap-2 mt-6">
                {scrollSnaps.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => scrollTo(index)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      index === selectedIndex
                        ? "w-6 bg-[#9BFF00]"
                        : "w-2 bg-gray-300 dark:bg-[#2A3440] hover:bg-gray-400 dark:hover:bg-[#4A5A6E]"
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            )}

            {/* Empty state */}
            {strategies.length === 0 && (
              <div className="mt-4 rounded-2xl border border-gray-200 dark:border-[#1A212A] bg-white dark:bg-[#070A10] p-6 text-center text-gray-500 dark:text-[#97A2AF]">
                No public strategies available yet. Admin panel se strategy upload karne ke baad ye section auto-fill hoga.
              </div>
            )}
            </div>

            <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/55 px-4 dark:bg-[#040607]/65">
              <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white px-5 py-6 text-center shadow-xl dark:border-[#26313D] dark:bg-[#0B1018]">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500 dark:text-[#91A0AF]">Subscription required</p>
                <h2 className="mt-2 text-2xl font-semibold text-gray-900 dark:text-[#F6FAFF]">Unlock strategy access</h2>
                <p className="mt-2 text-sm leading-6 text-gray-500 dark:text-[#9AA6B2]">
                  Choose a subscription plan to view published strategies and start exploring automated trading systems.
                </p>
                <button
                  type="button"
                  onClick={() => router.push("/dashboard/subscription")}
                  className="mt-5 rounded-xl bg-[#9BFF00] px-5 py-3 text-sm font-semibold text-[#11140D] transition hover:bg-[#B7FF45]"
                >
                  Go to Subscription Plan
                </button>
              </div>
            </div>
          </section>
        )}

        {/* ── FAQ Section ── */}
        <section className="mt-8">
          <div className="rounded-[20px] border border-gray-200 dark:border-[#111820] bg-white dark:bg-[#080B10] px-8 py-10">

            {/* FAQ Header */}
            <div className="mb-9">
              <div className="mb-3.5 inline-flex items-center gap-1.5 rounded-full border border-[rgba(155,255,0,0.25)] bg-[rgba(155,255,0,0.08)] px-3 py-1">
                <span className="h-2 w-2 rounded-full bg-[#9BFF00]" />
                <span className="text-[11px] font-semibold uppercase tracking-widest text-[#9BFF00]">
                  Atlas Trading Software
                </span>
              </div>
              <h2 className="text-[26px] font-bold leading-tight text-gray-900 dark:text-[#F6FAFF]">
                Frequently asked questions
              </h2>
              <p className="mt-2 text-sm text-gray-500 dark:text-[#7A8A99]">
                Everything you need to know about strategies on the platform.
              </p>
            </div>

            {/* Accordion */}
            <div>
              {faqs.map((item, i) => (
                <FaqAccordionItem
                  key={i}
                  item={item}
                  isOpen={openFaqIndex === i}
                  onToggle={() => setOpenFaqIndex(prev => (prev === i ? null : i))}
                />
              ))}
            </div>

          </div>
        </section>

      </div>
    </main>
  );
}
