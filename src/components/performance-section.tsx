import SignalPerformance from './signal-performance'
import EquityCurve from './equity-curve'

const KEY_METRICS = [
    { label: 'Avg win',     value: '+58 pips', color: 'text-green-600'  },
    { label: 'Avg loss',    value: '−22 pips', color: 'text-red-500'    },
    { label: 'Best signal', value: '+8.3%',    color: 'text-blue-600'   },
    { label: 'R/R ratio',   value: '1 : 2.6',  color: 'text-violet-600' },
]

const MARKETS = [
    { label: 'Forex',       sub: '28 pairs',  color: 'bg-green-500'  },
    { label: 'Crypto',      sub: '15 coins',  color: 'bg-blue-500'   },
    { label: 'Stocks',      sub: 'S&P 500',   color: 'bg-violet-500' },
    { label: 'Commodities', sub: 'Gold, Oil', color: 'bg-amber-500'  },
]

export default function PerformanceSection() {
    return (
        <section id="performance" className="bg-muted/20 py-16 md:py-32">
            <div className="mx-auto max-w-6xl px-6">

                {/* ── Heading ── */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 bg-green-500/10 text-green-700 dark:text-green-400
                                    text-xs font-semibold tracking-widest px-3 py-1.5 rounded-full mb-4">
                        <span className="size-1.5 rounded-full bg-current animate-pulse" />
                        LIVE PERFORMANCE
                    </div>
                    <h2 className="text-4xl font-semibold lg:text-5xl mb-4">Proven Track Record</h2>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                        Transparency matters. See our recent signal performance with real data.
                    </p>
                </div>

                {/* ── Equity Curve ── */}
                <div className="mb-8">
                    <EquityCurve />
                </div>

                {/* ── Bottom Grid ── */}
                <div className="grid lg:grid-cols-2 gap-6 items-start">

                    {/* Signal Performance */}
                    <SignalPerformance />

                    {/* Right column */}
                    <div className="space-y-6">

                        {/* Key Metrics */}
                        <div className="bg-background border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
                            <h3 className="text-sm font-semibold tracking-widest text-muted-foreground font-mono mb-5">
                                KEY METRICS
                            </h3>
                            <div className="grid grid-cols-2 gap-3">
                                {KEY_METRICS.map(m => (
                                    <div key={m.label}
                                         className="bg-muted/40 rounded-lg p-4 hover:bg-muted/60 transition-colors cursor-default">
                                        <p className="text-xs text-muted-foreground mb-1.5">{m.label}</p>
                                        <p className={`text-xl font-semibold font-mono ${m.color}`}>{m.value}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Markets */}
                        <div className="bg-background border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
                            <h3 className="text-sm font-semibold tracking-widest text-muted-foreground font-mono mb-5">
                                MARKETS COVERED
                            </h3>
                            <div className="grid grid-cols-2 gap-3">
                                {MARKETS.map((m, i) => (
                                    <div key={m.label}
                                         className="flex items-center gap-3 bg-muted/40 rounded-lg p-3 hover:bg-muted/60 transition-colors cursor-default">
                                        <span
                                            className={`size-2.5 rounded-full flex-shrink-0 ${m.color} animate-pulse`}
                                            style={{ animationDelay: `${i * 0.4}s` }}
                                        />
                                        <div>
                                            <p className="text-sm font-medium leading-none mb-0.5">{m.label}</p>
                                            <p className="text-xs text-muted-foreground">{m.sub}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </section>
    )
}