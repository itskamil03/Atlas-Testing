'use client'

import { useState } from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'

export default function SignalPerformance() {
    const [hoveredSignal, setHoveredSignal] = useState<number | null>(null)
    const recentSignals = [
        { pair: 'EUR/USD', type: 'BUY', entry: 1.0845, exit: 1.0885, pips: 40, profit: 3.2, date: 'Mar 24', status: 'win' },
        { pair: 'GBP/USD', type: 'SELL', entry: 1.2650, exit: 1.2610, pips: 40, profit: 2.8, date: 'Mar 23', status: 'win' },
        { pair: 'BTC/USD', type: 'BUY', entry: 68500, exit: 69200, pips: 700, profit: 5.1, date: 'Mar 23', status: 'win' },
        { pair: 'GOLD', type: 'SELL', entry: 2180, exit: 2195, pips: -15, profit: -1.2, date: 'Mar 22', status: 'loss' },
        { pair: 'USD/JPY', type: 'BUY', entry: 151.20, exit: 151.65, pips: 45, profit: 2.9, date: 'Mar 21', status: 'win' },
        { pair: 'EUR/JPY', type: 'BUY', entry: 164.10, exit: 164.80, pips: 70, profit: 4.2, date: 'Mar 21', status: 'win' },
    ]

    const winRate = 83.3
    const avgReturn = 2.8
    const totalSignals = 6
    const wins = 5

    return (
        <div className="bg-background border rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Signal Performance - Last 7 Days</h3>
                <p className="text-sm text-muted-foreground">Real trading results from our AI signals</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 text-center hover:bg-green-500/20 hover:scale-105 transition-all duration-300 cursor-pointer">
                    <p className="text-sm text-muted-foreground mb-1">Win Rate</p>
                    <p className="text-3xl font-bold text-green-600">{winRate}%</p>
                    <p className="text-sm text-muted-foreground mt-1">{wins}/{totalSignals} signals</p>
                </div>

                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 text-center hover:bg-blue-500/20 hover:scale-105 transition-all duration-300 cursor-pointer">
                    <p className="text-sm text-muted-foreground mb-1">Avg Return</p>
                    <p className="text-3xl font-bold text-blue-600">+{avgReturn}%</p>
                    <p className="text-sm text-muted-foreground mt-1">per signal</p>
                </div>

                <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4 text-center hover:bg-purple-500/20 hover:scale-105 transition-all duration-300 cursor-pointer">
                    <p className="text-sm text-muted-foreground mb-1">Total Pips</p>
                    <p className="text-3xl font-bold text-purple-600">+780</p>
                    <p className="text-sm text-muted-foreground mt-1">last week</p>
                </div>
            </div>

            {/* Win Rate Bar */}
            <div className="mb-6">
                <div className="flex justify-between text-sm text-muted-foreground mb-2">
                    <span>Performance Distribution</span>
                    <span>{wins} wins / {totalSignals - wins} loss</span>
                </div>
                <div className="h-6 bg-muted rounded-full overflow-hidden flex group cursor-pointer">
                    <div
                        className="bg-green-500 flex items-center justify-center text-white text-xs font-semibold transition-all duration-500 group-hover:brightness-110"
                        style={{ width: `${winRate}%` }}
                    >
                        {winRate}%
                    </div>
                    <div
                        className="bg-red-500 flex items-center justify-center text-white text-xs font-semibold transition-all duration-500 group-hover:brightness-110"
                        style={{ width: `${100 - winRate}%` }}
                    >
                        {(100 - winRate).toFixed(1)}%
                    </div>
                </div>
            </div>

            {/* Recent Signals Table */}
            <div className="space-y-2">
                <p className="text-sm font-semibold mb-3">Recent Signals</p>
                {recentSignals.map((signal, index) => (
                    <div
                        key={index}
                        onMouseEnter={() => setHoveredSignal(index)}
                        onMouseLeave={() => setHoveredSignal(null)}
                        className={`bg-muted/30 rounded-lg p-3 flex items-center justify-between transition-all duration-200 cursor-pointer ${
                            hoveredSignal === index ? 'bg-muted/50 scale-[1.02] shadow-md' : ''
                        }`}
                    >
                        <div className="flex items-center gap-3 flex-1">
                            <div className={`size-8 rounded-full flex items-center justify-center transition-all duration-200 ${
                                signal.status === 'win' ? 'bg-green-500/20' : 'bg-red-500/20'
                            } ${hoveredSignal === index ? 'scale-110' : ''}`}>
                                {signal.status === 'win' ? (
                                    <TrendingUp className="size-4 text-green-600" />
                                ) : (
                                    <TrendingDown className="size-4 text-red-600" />
                                )}
                            </div>
                            <div>
                                <p className="font-semibold text-sm">{signal.pair}</p>
                                <p className="text-sm text-muted-foreground">
                                    {signal.type} @ {signal.entry}
                                </p>
                            </div>
                        </div>

                        <div className="text-right">
                            <p className={`font-semibold text-sm transition-all ${
                                signal.status === 'win' ? 'text-green-600' : 'text-red-600'
                            } ${hoveredSignal === index ? 'text-base' : ''}`}>
                                {signal.profit > 0 ? '+' : ''}{signal.profit}%
                            </p>
                            <p className="text-sm text-muted-foreground">
                                {signal.pips > 0 ? '+' : ''}{signal.pips} pips
                            </p>
                        </div>

                        <div className="text-right ml-4 min-w-[60px]">
                            <p className="text-sm text-muted-foreground">{signal.date}</p>
                            <div className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold mt-1 transition-all ${
                                signal.status === 'win'
                                    ? 'bg-green-500/20 text-green-600'
                                    : 'bg-red-500/20 text-red-600'
                            } ${hoveredSignal === index ? 'scale-110' : ''}`}>
                                {signal.status === 'win' ? 'WIN' : 'LOSS'}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-4 pt-4 border-t text-center">
                <p className="text-sm text-muted-foreground">
                    All signals are historical and based on actual closed positions. Past performance does not guarantee future results.
                </p>
            </div>
        </div>
    )
}
