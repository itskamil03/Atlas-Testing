import SignalPerformance from './signal-performance'
import EquityCurve from './equity-curve'
import { ShieldAlert, Zap, Cpu } from 'lucide-react'

const KEY_METRICS = [
    { label: 'Avg Win',      value: '+58 pips', color: 'text-emerald-500' },
    { label: 'Avg Loss',     value: '−22 pips', color: 'text-rose-500'    },
    { label: 'Best Signal',  value: '+8.3%',    color: 'text-sky-500'     },
    { label: 'R/R Ratio',    value: '1 : 2.6',  color: 'text-purple-500'  },
]

const MARKETS = [
    { label: 'Forex',       sub: '28 major & minor pairs', color: 'bg-emerald-500' },
    { label: 'Crypto',      sub: '15 high-volume coins',   color: 'bg-sky-500'     },
    { label: 'Stocks',      sub: 'S&P 500 & Nasdaq',       color: 'bg-purple-500'  },
    { label: 'Commodities', sub: 'Gold, Crude Oil & Silver', color: 'bg-amber-500' },
]

export default function PerformanceSection() {
    return (
        <section id="performance" className="bg-muted/10 py-16 md:py-24 border-y border-border/40">
            <div className="mx-auto max-w-6xl px-4 sm:px-6">

                {/* ── Heading ── */}
                <div className="text-center mb-10 md:mb-12 -mt-[0.5in]">
                    <div className="inline-flex items-center gap-2 bg-purple-500/10 text-purple-600 dark:text-purple-400 text-xs font-semibold tracking-widest px-3.5 py-1.5 rounded-full mb-3 border border-purple-500/20">
                        <span className="size-2 rounded-full bg-purple-500 animate-pulse" />
                        LIVE PERFORMANCE
                    </div>
                    <h2 className="text-3xl font-semibold sm:text-4xl text-foreground">Proven Track Record</h2>
                    <p className="text-muted-foreground text-sm sm:text-base max-w-2xl mx-auto mt-2">
                        Transparency matters. Explore verified algorithm signals, win rates, and live market distribution.
                    </p>
                </div>

                {/* ── Equity Curve ── */}
                <div className="mb-8 w-full">
                    <EquityCurve />
                </div>

                {/* ── Balanced Performance Grid ── */}
                <div className="grid lg:grid-cols-12 gap-6 items-stretch w-full">

                    {/* Left: Signal Performance Card (7 cols) */}
                    <div className="lg:col-span-7">
                        <SignalPerformance />
                    </div>

                    {/* Right: Unified Market & Execution Intel Panel (5 cols) */}
                    <div className="lg:col-span-5 flex flex-col justify-between h-full rounded-2xl border border-border bg-card/90 p-5 sm:p-6 shadow-sm backdrop-blur-sm">

                        {/* Section 1: Key Metrics */}
                        <div>
                            <div className="flex items-center justify-between border-b border-border/60 pb-3 mb-4">
                                <h3 className="text-xs font-bold tracking-widest uppercase text-muted-foreground font-mono">
                                    KEY METRICS
                                </h3>
                                <span className="text-[10px] text-muted-foreground uppercase font-semibold">Verified Averages</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2.5">
                                {KEY_METRICS.map(m => (
                                    <div key={m.label}
                                         className="rounded-xl border border-border/60 bg-muted/40 p-3 hover:bg-muted/60 transition-colors">
                                        <p className="text-xs text-muted-foreground mb-1">{m.label}</p>
                                        <p className={`text-xl font-bold font-mono ${m.color}`}>{m.value}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Section 2: Markets Covered */}
                        <div className="border-t border-border/60 pt-4 mt-4">
                            <div className="flex items-center justify-between pb-3 mb-1">
                                <h3 className="text-xs font-bold tracking-widest uppercase text-muted-foreground font-mono">
                                    MARKETS COVERED
                                </h3>
                                <span className="text-[10px] text-purple-400 font-semibold bg-purple-500/10 px-2 py-0.5 rounded">Active Feeds</span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                {MARKETS.map((m, i) => (
                                    <div key={m.label}
                                         className="flex items-center gap-3 rounded-xl border border-border/60 bg-muted/40 p-3 hover:bg-muted/60 transition-colors">
                                        <span
                                            className={`size-2.5 rounded-full shrink-0 ${m.color} animate-pulse`}
                                            style={{ animationDelay: `${i * 0.3}s` }}
                                        />
                                        <div className="min-w-0">
                                            <p className="text-xs font-semibold text-foreground leading-tight">{m.label}</p>
                                            <p className="text-[11px] text-muted-foreground truncate">{m.sub}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Section 3: Algorithmic Safeguards */}
                        <div className="border-t border-border/60 pt-4 mt-4">
                            <div className="rounded-xl border border-purple-500/20 bg-purple-500/5 p-3.5 sm:p-4">
                                <div className="flex items-center gap-2 text-foreground font-semibold text-xs uppercase tracking-wider mb-1.5">
                                    <Cpu className="size-4 text-purple-400 shrink-0" />
                                    <span>Algorithmic Safeguards</span>
                                </div>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    Automated dynamic stop-loss positioning and low-latency execution ensure protected capital allocation across all supported asset classes.
                                </p>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </section>
    )
}