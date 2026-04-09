import SignalPerformance from './signal-performance'
import EquityCurve from './equity-curve'

export default function PerformanceSection() {
    return (
        <section id="performance" className="bg-background py-16 md:py-32">
            <div className="mx-auto max-w-6xl px-6">
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-semibold lg:text-5xl mb-4">
                        Proven Track Record
                    </h2>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                        Transparency matters. See our recent signal performance with real data.
                    </p>
                </div>

                {/* Equity Curve - Full Width */}
                <div className="mb-8">
                    <EquityCurve />
                </div>

                <div className="grid lg:grid-cols-2 gap-8 items-start">
                    <SignalPerformance />

                    {/* Additional Stats */}
                    <div className="space-y-6">
                        {/* Key Metrics */}
                        <div className="bg-background border rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
                            <h3 className="text-lg font-semibold mb-4">Key Metrics</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="border-l-4 border-green-500 pl-3 hover:bg-green-500/5 transition-colors rounded-r cursor-pointer p-2">
                                    <p className="text-sm text-muted-foreground">Avg Win</p>
                                    <p className="text-xl font-bold text-green-600">+58 pips</p>
                                </div>
                                <div className="border-l-4 border-red-500 pl-3 hover:bg-red-500/5 transition-colors rounded-r cursor-pointer p-2">
                                    <p className="text-sm text-muted-foreground">Avg Loss</p>
                                    <p className="text-xl font-bold text-red-600">-22 pips</p>
                                </div>
                                <div className="border-l-4 border-blue-500 pl-3 hover:bg-blue-500/5 transition-colors rounded-r cursor-pointer p-2">
                                    <p className="text-sm text-muted-foreground">Best Signal</p>
                                    <p className="text-xl font-bold text-blue-600">+8.3%</p>
                                </div>
                                <div className="border-l-4 border-purple-500 pl-3 hover:bg-purple-500/5 transition-colors rounded-r cursor-pointer p-2">
                                    <p className="text-sm text-muted-foreground">R/R Ratio</p>
                                    <p className="text-xl font-bold text-purple-600">1:2.6</p>
                                </div>
                            </div>
                        </div>

                        {/* Markets Covered */}
                        <div className="bg-gradient-to-br from-primary/10 to-primary/5 border rounded-xl p-6 hover:from-primary/15 hover:to-primary/10 transition-all duration-300">
                            <h3 className="text-lg font-semibold mb-4">Markets We Cover</h3>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div className="flex items-center gap-2 hover:translate-x-1 transition-transform cursor-pointer">
                                    <div className="size-2 rounded-full bg-green-500 animate-pulse" />
                                    <span>Forex (28 pairs)</span>
                                </div>
                                <div className="flex items-center gap-2 hover:translate-x-1 transition-transform cursor-pointer">
                                    <div className="size-2 rounded-full bg-blue-500 animate-pulse" />
                                    <span>Crypto (15 coins)</span>
                                </div>
                                <div className="flex items-center gap-2 hover:translate-x-1 transition-transform cursor-pointer">
                                    <div className="size-2 rounded-full bg-purple-500 animate-pulse" />
                                    <span>Stocks (S&P 500)</span>
                                </div>
                                <div className="flex items-center gap-2 hover:translate-x-1 transition-transform cursor-pointer">
                                    <div className="size-2 rounded-full bg-yellow-500 animate-pulse" />
                                    <span>Commodities (Gold, Oil)</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
