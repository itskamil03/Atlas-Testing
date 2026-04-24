'use client'

import { useState } from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'

export default function MarketTicker() {
    const [hoveredMarket, setHoveredMarket] = useState<number | null>(null)
    const markets = [
        { symbol: 'EUR/USD', price: '1.0885', change: '+0.65', trend: 'up' },
        { symbol: 'GBP/USD', price: '1.2642', change: '-0.32', trend: 'down' },
        { symbol: 'BTC/USD', price: '69,245', change: '+2.14', trend: 'up' },
        { symbol: 'GOLD', price: '2,183', change: '+1.08', trend: 'up' },
        { symbol: 'USD/JPY', price: '151.45', change: '+0.45', trend: 'up' },
        { symbol: 'S&P 500', price: '5,234', change: '+0.89', trend: 'up' },
    ]

    return (
        <div className="bg-muted/30 border rounded-xl p-16 overflow-visible">
            <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold">Live Markets</p>
                <div className="flex items-center gap-1">
                    <div className="size-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-xs text-muted-foreground">Real-time</span>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {markets.map((market, index) => (
                    <div
                        key={index}
                        onMouseEnter={() => setHoveredMarket(index)}
                        onMouseLeave={() => setHoveredMarket(null)}
                        className={`bg-background border rounded-lg p-3 transition-all duration-200 cursor-pointer ${
                            hoveredMarket === index
                                ? 'shadow-lg scale-105 border-primary/50'
                                : 'shadow-sm hover:shadow-md'
                        }`}
                    >
                        <div className="flex items-start justify-between mb-2">
                            <p className="text-xs font-semibold">{market.symbol}</p>
                            {market.trend === 'up' ? (
                                <TrendingUp className={`size-3 text-green-600 transition-transform ${
                                    hoveredMarket === index ? 'scale-125' : ''
                                }`} />
                            ) : (
                                <TrendingDown className={`size-3 text-red-600 transition-transform ${
                                    hoveredMarket === index ? 'scale-125' : ''
                                }`} />
                            )}
                        </div>
                        <p className={`text-lg font-bold mb-1 transition-all ${
                            hoveredMarket === index ? 'text-xl' : ''
                        }`}>{market.price}</p>
                        <p className={`text-xs font-semibold ${
                            market.trend === 'up' ? 'text-green-600' : 'text-red-600'
                        }`}>
                            {market.change}%
                        </p>
                    </div>
                ))}
            </div>
        </div>
    )
}
