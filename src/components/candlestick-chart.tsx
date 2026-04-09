'use client'

import { useState } from 'react'

export default function CandlestickChart() {
    const [hoveredCandle, setHoveredCandle] = useState<number | null>(null)
    // Mock candlestick data for visualization
    const candles = [
        { open: 1.0820, high: 1.0835, low: 1.0815, close: 1.0830, bullish: true, time: '06:00' },
        { open: 1.0830, high: 1.0850, low: 1.0825, close: 1.0845, bullish: true, time: '10:00' },
        { open: 1.0845, high: 1.0860, low: 1.0840, close: 1.0855, bullish: true, time: '14:00' },
        { open: 1.0855, high: 1.0865, low: 1.0835, close: 1.0840, bullish: false, time: '18:00' },
        { open: 1.0840, high: 1.0855, low: 1.0838, close: 1.0850, bullish: true, time: '22:00' },
        { open: 1.0850, high: 1.0870, low: 1.0848, close: 1.0865, bullish: true, time: '02:00' },
        { open: 1.0865, high: 1.0880, low: 1.0860, close: 1.0875, bullish: true, time: '06:00' },
        { open: 1.0875, high: 1.0885, low: 1.0850, close: 1.0855, bullish: false, time: '10:00' },
        { open: 1.0855, high: 1.0870, low: 1.0845, close: 1.0868, bullish: true, time: '14:00' },
        { open: 1.0868, high: 1.0890, low: 1.0865, close: 1.0885, bullish: true, time: '18:00' },
    ]

    const minPrice = Math.min(...candles.map(c => c.low)) - 0.001
    const maxPrice = Math.max(...candles.map(c => c.high)) + 0.001
    const priceRange = maxPrice - minPrice

    const chartHeight = 300
    const chartWidth = 600
    const candleWidth = 40
    const spacing = 60

    const priceToY = (price: number) => {
        return chartHeight - ((price - minPrice) / priceRange) * chartHeight
    }

    return (
        <div className="bg-background border rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="mb-4 flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold">EUR/USD - 4H Chart</h3>
                    <p className="text-sm text-muted-foreground">Real-time market analysis</p>
                </div>
                <div className="text-right">
                    <p className="text-2xl font-bold text-green-600 animate-pulse">1.0885</p>
                    <p className="text-sm text-green-600">+0.65% ↑</p>
                </div>
            </div>

            <div className="relative overflow-x-auto">
                <svg
                    viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                    className="w-full h-auto"
                    style={{ minHeight: '300px' }}
                >
                    {/* Grid lines */}
                    {[0, 1, 2, 3, 4].map((i) => {
                        const y = (chartHeight / 4) * i
                        const price = (maxPrice - (priceRange / 4) * i).toFixed(4)
                        return (
                            <g key={i}>
                                <line
                                    x1="0"
                                    y1={y}
                                    x2={chartWidth}
                                    y2={y}
                                    stroke="currentColor"
                                    strokeWidth="1"
                                    className="opacity-10"
                                />
                                <text
                                    x={chartWidth - 5}
                                    y={y - 5}
                                    className="fill-muted-foreground text-[10px]"
                                    textAnchor="end"
                                >
                                    {price}
                                </text>
                            </g>
                        )
                    })}

                    {/* Support/Resistance Lines */}
                    <line
                        x1="0"
                        y1={priceToY(1.0840)}
                        x2={chartWidth}
                        y2={priceToY(1.0840)}
                        stroke="#22c55e"
                        strokeWidth="2"
                        strokeDasharray="5,5"
                        opacity="0.5"
                        className="hover:opacity-100 transition-opacity"
                    />
                    <text
                        x="5"
                        y={priceToY(1.0840) - 5}
                        className="fill-green-600 text-[10px] font-semibold"
                    >
                        Support: 1.0840
                    </text>

                    {/* Candlesticks */}
                    {candles.map((candle, index) => {
                        const x = spacing * index + spacing / 2
                        const openY = priceToY(candle.open)
                        const closeY = priceToY(candle.close)
                        const highY = priceToY(candle.high)
                        const lowY = priceToY(candle.low)
                        const bodyTop = Math.min(openY, closeY)
                        const bodyHeight = Math.abs(openY - closeY)
                        const color = candle.bullish ? '#22c55e' : '#ef4444'
                        const isHovered = hoveredCandle === index

                        return (
                            <g
                                key={index}
                                className="cursor-pointer transition-opacity"
                                style={{ opacity: hoveredCandle === null || isHovered ? 1 : 0.5 }}
                                onMouseEnter={() => setHoveredCandle(index)}
                                onMouseLeave={() => setHoveredCandle(null)}
                            >
                                {/* Wick */}
                                <line
                                    x1={x}
                                    y1={highY}
                                    x2={x}
                                    y2={lowY}
                                    stroke={color}
                                    strokeWidth={isHovered ? "3" : "2"}
                                    className="transition-all"
                                />
                                {/* Body */}
                                <rect
                                    x={x - candleWidth / 2}
                                    y={bodyTop}
                                    width={candleWidth}
                                    height={Math.max(bodyHeight, 2)}
                                    fill={color}
                                    stroke={color}
                                    strokeWidth="1"
                                    className="transition-all"
                                    style={{
                                        filter: isHovered ? 'brightness(1.2) drop-shadow(0 0 8px currentColor)' : 'none'
                                    }}
                                />

                                {/* Hover Tooltip */}
                                {isHovered && (
                                    <g>
                                        <rect
                                            x={x - 50}
                                            y={bodyTop - 70}
                                            width="100"
                                            height="60"
                                            fill="currentColor"
                                            className="fill-background"
                                            stroke={color}
                                            strokeWidth="2"
                                            rx="4"
                                            opacity="0.95"
                                        />
                                        <text x={x} y={bodyTop - 52} className="fill-foreground text-[10px] font-semibold" textAnchor="middle">
                                            {candle.time}
                                        </text>
                                        <text x={x} y={bodyTop - 40} className="fill-foreground text-[9px]" textAnchor="middle">
                                            O: {candle.open}
                                        </text>
                                        <text x={x} y={bodyTop - 30} className="fill-foreground text-[9px]" textAnchor="middle">
                                            H: {candle.high}
                                        </text>
                                        <text x={x} y={bodyTop - 20} className="fill-foreground text-[9px]" textAnchor="middle">
                                            L: {candle.low}
                                        </text>
                                        <text x={x} y={bodyTop - 10} className="fill-foreground text-[9px]" textAnchor="middle">
                                            C: {candle.close}
                                        </text>
                                    </g>
                                )}
                            </g>
                        )
                    })}

                    {/* Signal Arrow */}
                    <g className="animate-pulse">
                        <line
                            x1={spacing * 1.5}
                            y1={priceToY(1.0845) + 40}
                            x2={spacing * 1.5}
                            y2={priceToY(1.0845) + 10}
                            stroke="#3b82f6"
                            strokeWidth="3"
                            markerEnd="url(#arrowhead)"
                        />
                        <defs>
                            <marker
                                id="arrowhead"
                                markerWidth="10"
                                markerHeight="10"
                                refX="5"
                                refY="3"
                                orient="auto"
                            >
                                <polygon points="0 0, 10 3, 0 6" fill="#3b82f6" />
                            </marker>
                        </defs>
                        <rect
                            x={spacing * 1.5 - 40}
                            y={priceToY(1.0845) + 45}
                            width="80"
                            height="18"
                            fill="#3b82f6"
                            rx="4"
                        />
                        <text
                            x={spacing * 1.5}
                            y={priceToY(1.0845) + 57}
                            className="fill-white text-[10px] font-semibold"
                            textAnchor="middle"
                        >
                            BUY @ 1.0845
                        </text>
                    </g>
                </svg>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
                <div className="bg-muted/50 rounded-lg p-2 hover:bg-muted transition-colors cursor-pointer">
                    <p className="text-muted-foreground">Timeframe</p>
                    <p className="font-semibold">4H</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-2 hover:bg-muted transition-colors cursor-pointer">
                    <p className="text-muted-foreground">Trend</p>
                    <p className="font-semibold text-green-600">Bullish ↑</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-2 hover:bg-muted transition-colors cursor-pointer">
                    <p className="text-muted-foreground">Confidence</p>
                    <p className="font-semibold">87%</p>
                </div>
            </div>
        </div>
    )
}
