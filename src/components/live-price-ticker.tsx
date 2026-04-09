'use client'

import { useEffect, useState } from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'

export default function LivePriceTicker() {
    const [animationKey, setAnimationKey] = useState(0)

    useEffect(() => {
        // Restart animation every 30 seconds
        const interval = setInterval(() => {
            setAnimationKey(prev => prev + 1)
        }, 30000)
        return () => clearInterval(interval)
    }, [])

    const markets = [
        { symbol: 'EUR/USD', price: '1.0885', change: '+0.65', trend: 'up' },
        { symbol: 'GBP/USD', price: '1.2642', change: '-0.32', trend: 'down' },
        { symbol: 'BTC/USD', price: '69,245', change: '+2.14', trend: 'up' },
        { symbol: 'ETH/USD', price: '3,842', change: '+1.85', trend: 'up' },
        { symbol: 'GOLD', price: '2,183', change: '+1.08', trend: 'up' },
        { symbol: 'USD/JPY', price: '151.45', change: '+0.45', trend: 'up' },
        { symbol: 'AUD/USD', price: '0.6523', change: '-0.18', trend: 'down' },
        { symbol: 'S&P 500', price: '5,234', change: '+0.89', trend: 'up' },
        { symbol: 'NASDAQ', price: '16,428', change: '+1.24', trend: 'up' },
        { symbol: 'OIL', price: '82.15', change: '+2.35', trend: 'up' },
    ]

    // Duplicate for seamless loop
    const duplicatedMarkets = [...markets, ...markets]

    return (
        <div className="bg-muted/50 border-y overflow-hidden py-3">
            <div className="flex items-center gap-4" style={{ animation: 'scroll 40s linear infinite' }}>
                {duplicatedMarkets.map((market, index) => (
                    <div
                        key={`${index}-${animationKey}`}
                        className="flex items-center gap-2 px-4 hover:bg-background/50 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                    >
                        <span className="font-semibold text-sm">{market.symbol}</span>
                        <span className="text-sm">{market.price}</span>
                        <span className={`text-xs font-semibold flex items-center gap-1 ${
                            market.trend === 'up' ? 'text-green-600' : 'text-red-600'
                        }`}>
                            {market.trend === 'up' ? (
                                <TrendingUp className="size-3" />
                            ) : (
                                <TrendingDown className="size-3" />
                            )}
                            {market.change}%
                        </span>
                        <div className="size-1 rounded-full bg-muted-foreground/30 ml-2" />
                    </div>
                ))}
            </div>

            <style jsx>{`
                @keyframes scroll {
                    0% {
                        transform: translateX(0);
                    }
                    100% {
                        transform: translateX(-50%);
                    }
                }
            `}</style>
        </div>
    )
}
