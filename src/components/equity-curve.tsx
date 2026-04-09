'use client'

import { useState } from 'react'

export default function EquityCurve() {
    const [hoveredPoint, setHoveredPoint] = useState<number | null>(null)

    // Mock equity curve data (cumulative returns)
    const dataPoints = [
        { day: 'Day 1', return: 0, balance: 10000 },
        { day: 'Day 2', return: 2.1, balance: 10210 },
        { day: 'Day 3', return: 3.8, balance: 10380 },
        { day: 'Day 4', return: 5.5, balance: 10550 },
        { day: 'Day 5', return: 4.2, balance: 10420 },
        { day: 'Day 6', return: 6.8, balance: 10680 },
        { day: 'Day 7', return: 8.5, balance: 10850 },
        { day: 'Day 8', return: 11.2, balance: 11120 },
        { day: 'Day 9', return: 9.8, balance: 10980 },
        { day: 'Day 10', return: 13.4, balance: 11340 },
        { day: 'Day 11', return: 15.1, balance: 11510 },
        { day: 'Day 12', return: 17.2, balance: 11720 },
    ]

    const maxReturn = Math.max(...dataPoints.map(d => d.return))
    const minReturn = Math.min(...dataPoints.map(d => d.return))
    const chartWidth = 600
    const chartHeight = 250
    const padding = 40

    const getX = (index: number) => {
        return padding + (index / (dataPoints.length - 1)) * (chartWidth - padding * 2)
    }

    const getY = (value: number) => {
        const range = maxReturn - minReturn
        return chartHeight - padding - ((value - minReturn) / range) * (chartHeight - padding * 2)
    }

    // Generate path for the line
    const linePath = dataPoints
        .map((point, index) => {
            const x = getX(index)
            const y = getY(point.return)
            return `${index === 0 ? 'M' : 'L'} ${x} ${y}`
        })
        .join(' ')

    // Generate path for the area fill
    const areaPath = `${linePath} L ${getX(dataPoints.length - 1)} ${chartHeight - padding} L ${padding} ${chartHeight - padding} Z`

    return (
        <div className="bg-background border rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="mb-4">
                <h3 className="text-lg font-semibold">Equity Curve</h3>
                <p className="text-sm text-muted-foreground">12-day account growth trajectory</p>
            </div>

            <svg
                viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                className="w-full h-auto"
            >
                {/* Grid lines */}
                {[0, 1, 2, 3, 4].map((i) => {
                    const y = padding + (i / 4) * (chartHeight - padding * 2)
                    const value = maxReturn - (i / 4) * (maxReturn - minReturn)
                    return (
                        <g key={i}>
                            <line
                                x1={padding}
                                y1={y}
                                x2={chartWidth - padding}
                                y2={y}
                                stroke="currentColor"
                                strokeWidth="1"
                                className="opacity-10"
                            />
                            <text
                                x={padding - 10}
                                y={y + 4}
                                className="fill-muted-foreground text-[10px]"
                                textAnchor="end"
                            >
                                +{value.toFixed(1)}%
                            </text>
                        </g>
                    )
                })}

                {/* Area fill gradient */}
                <defs>
                    <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#22c55e" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#22c55e" stopOpacity="0.05" />
                    </linearGradient>
                </defs>

                {/* Area */}
                <path
                    d={areaPath}
                    fill="url(#areaGradient)"
                    className="transition-all duration-300"
                />

                {/* Line */}
                <path
                    d={linePath}
                    fill="none"
                    stroke="#22c55e"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="drop-shadow-[0_0_8px_rgba(34,197,94,0.5)]"
                />

                {/* Data points */}
                {dataPoints.map((point, index) => {
                    const x = getX(index)
                    const y = getY(point.return)
                    const isHovered = hoveredPoint === index

                    return (
                        <g
                            key={index}
                            onMouseEnter={() => setHoveredPoint(index)}
                            onMouseLeave={() => setHoveredPoint(null)}
                            className="cursor-pointer"
                        >
                            <circle
                                cx={x}
                                cy={y}
                                r={isHovered ? 8 : 5}
                                fill="#22c55e"
                                stroke="white"
                                strokeWidth="2"
                                className="transition-all duration-200"
                                style={{
                                    filter: isHovered ? 'drop-shadow(0 0 8px rgba(34, 197, 94, 0.8))' : 'none'
                                }}
                            />

                            {/* Tooltip on hover */}
                            {isHovered && (
                                <g>
                                    <rect
                                        x={x - 45}
                                        y={y - 50}
                                        width="90"
                                        height="40"
                                        fill="currentColor"
                                        className="fill-background"
                                        stroke="#22c55e"
                                        strokeWidth="2"
                                        rx="6"
                                        opacity="0.95"
                                    />
                                    <text
                                        x={x}
                                        y={y - 32}
                                        className="fill-foreground text-[10px] font-semibold"
                                        textAnchor="middle"
                                    >
                                        {point.day}
                                    </text>
                                    <text
                                        x={x}
                                        y={y - 20}
                                        className="fill-green-600 text-[11px] font-bold"
                                        textAnchor="middle"
                                    >
                                        +{point.return}%
                                    </text>
                                    <text
                                        x={x}
                                        y={y - 10}
                                        className="fill-muted-foreground text-[9px]"
                                        textAnchor="middle"
                                    >
                                        ${point.balance.toLocaleString()}
                                    </text>
                                </g>
                            )}
                        </g>
                    )
                })}

                {/* X-axis labels */}
                {[0, Math.floor(dataPoints.length / 2), dataPoints.length - 1].map((i) => {
                    const x = getX(i)
                    return (
                        <text
                            key={i}
                            x={x}
                            y={chartHeight - 20}
                            className="fill-muted-foreground text-[10px]"
                            textAnchor="middle"
                        >
                            {dataPoints[i].day}
                        </text>
                    )
                })}
            </svg>

            <div className="mt-4 grid grid-cols-3 gap-3 text-center text-xs">
                <div className="bg-green-500/10 rounded-lg p-2 hover:bg-green-500/20 transition-colors cursor-pointer">
                    <p className="text-muted-foreground">Starting</p>
                    <p className="font-semibold">$10,000</p>
                </div>
                <div className="bg-green-500/10 rounded-lg p-2 hover:bg-green-500/20 transition-colors cursor-pointer">
                    <p className="text-muted-foreground">Current</p>
                    <p className="font-semibold text-green-600">$11,720</p>
                </div>
                <div className="bg-green-500/10 rounded-lg p-2 hover:bg-green-500/20 transition-colors cursor-pointer">
                    <p className="text-muted-foreground">Profit</p>
                    <p className="font-semibold text-green-600">+$1,720</p>
                </div>
            </div>
        </div>
    )
}
