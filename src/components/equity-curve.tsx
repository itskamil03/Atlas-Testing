'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

const dataPoints = [
    { day: 'Day 1',  return: 0,    balance: 10000 },
    { day: 'Day 2',  return: 2.1,  balance: 10210 },
    { day: 'Day 3',  return: 3.8,  balance: 10380 },
    { day: 'Day 4',  return: 5.5,  balance: 10550 },
    { day: 'Day 5',  return: 4.2,  balance: 10420 },
    { day: 'Day 6',  return: 6.8,  balance: 10680 },
    { day: 'Day 7',  return: 8.5,  balance: 10850 },
    { day: 'Day 8',  return: 11.2, balance: 11120 },
    { day: 'Day 9',  return: 9.8,  balance: 10980 },
    { day: 'Day 10', return: 13.4, balance: 11340 },
    { day: 'Day 11', return: 15.1, balance: 11510 },
    { day: 'Day 12', return: 17.2, balance: 11720 },
]

const TICKER_ITEMS = [
    { label: 'EUR/USD', value: '1.0842',  change: '+0.12%', up: true  },
    { label: 'BTC/USD', value: '68,420',  change: '+2.4%',  up: true  },
    { label: 'XAU/USD', value: '2,347',   change: '+0.8%',  up: true  },
    { label: 'GBP/USD', value: '1.2718',  change: '−0.05%', up: false },
    { label: 'SPX500',  value: '5,241',   change: '+0.33%', up: true  },
    { label: 'WTI/OIL', value: '78.14',   change: '−0.6%',  up: false },
    { label: 'ETH/USD', value: '3,862',   change: '+1.7%',  up: true  },
    { label: 'NAS100',  value: '18,340',  change: '+0.55%', up: true  },
]

const W = 620, PL = 50, PR = 590, PT = 25, PB = 197

function gx(i: number) { return PL + (i / (dataPoints.length - 1)) * (PR - PL) }
function gy(v: number) { return PB - ((v - 0) / 17.2) * (PB - PT) }

const LINE_PATH = dataPoints.map((d, i) => `${i === 0 ? 'M' : 'L'} ${gx(i).toFixed(1)} ${gy(d.return).toFixed(1)}`).join(' ')
const AREA_PATH = `${LINE_PATH} L ${gx(dataPoints.length - 1).toFixed(1)} ${PB} L ${gx(0).toFixed(1)} ${PB} Z`

interface Tooltip { visible: boolean; index: number; x: number; y: number }

export default function EquityCurve() {
    const [revealX, setRevealX]       = useState(PL)
    const [liveBalance, setLiveBalance] = useState(10000)
    const [statsVisible, setStatsVisible] = useState(false)
    const [pctVisible, setPctVisible]   = useState(false)
    const [tooltip, setTooltip]         = useState<Tooltip>({ visible: false, index: 0, x: 0, y: 0 })
    const [crosshairX, setCrosshairX]   = useState(0)
    const [crosshairOn, setCrosshairOn] = useState(false)
    const rafRef  = useRef<number | null>(null)
    const startRef = useRef<number | null>(null)

    const ANIM_DURATION = 1800

    const startAnimation = useCallback(() => {
        if (rafRef.current) cancelAnimationFrame(rafRef.current)
        setRevealX(PL)
        setLiveBalance(10000)
        setStatsVisible(false)
        setPctVisible(false)
        setTooltip(t => ({ ...t, visible: false }))
        startRef.current = null

        function frame(now: number) {
            if (!startRef.current) startRef.current = now
            const elapsed = now - startRef.current
            const raw    = Math.min(elapsed / ANIM_DURATION, 1)
            const eased  = 1 - Math.pow(1 - raw, 3)
            setRevealX(PL + eased * (PR - PL))
            setLiveBalance(Math.round(10000 + eased * 1720))
            if (raw < 1) {
                rafRef.current = requestAnimationFrame(frame)
            } else {
                setPctVisible(true)
                setTimeout(() => setStatsVisible(true), 200)
            }
        }
        rafRef.current = requestAnimationFrame(frame)
    }, [])

    useEffect(() => {
        const t = setTimeout(startAnimation, 400)
        return () => { clearTimeout(t); if (rafRef.current) cancelAnimationFrame(rafRef.current) }
    }, [startAnimation])

    const ttd  = dataPoints[tooltip.index]
    let ttX = tooltip.x - 44, ttY = tooltip.y - 64
    if (ttX < 0) ttX = 4
    if (ttX + 88 > W) ttX = W - 92
    if (ttY < 0) ttY = tooltip.y + 14

    return (
        <div className="bg-background border rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">

            {/* ── Ticker ── */}
            <div className="flex items-center border-b h-8">
                <div className="bg-green-600 text-white text-[10px] font-semibold tracking-widest px-3 h-full flex items-center shrink-0">
                    LIVE
                </div>
                <div className="overflow-hidden flex-1 h-full flex items-center">
                    <div className="flex gap-7 whitespace-nowrap items-center animate-ticker">
                        {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
                            <span key={i} className="text-[11px] text-muted-foreground font-mono">
                                {item.label}{' '}
                                <span className={item.up ? 'text-green-500' : 'text-red-500'}>
                                    {item.up ? '▲' : '▼'} {item.value} {item.change}
                                </span>
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            <div className="p-6">
                {/* ── Header ── */}
                <div className="flex items-start justify-between mb-5">
                    <div>
                        <p className="text-[11px] font-mono text-muted-foreground tracking-widest mb-1">
                            EQUITY CURVE — 12-DAY
                        </p>
                        <div className="flex items-baseline gap-3">
                            <span className="text-3xl font-semibold font-mono tabular-nums">
                                ${liveBalance.toLocaleString()}
                            </span>
                            <span
                                className="text-sm font-semibold text-green-600 transition-opacity duration-500"
                                style={{ opacity: pctVisible ? 1 : 0 }}
                            >
                                ▲ +17.2%
                            </span>
                        </div>
                    </div>
                    <button
                        onClick={startAnimation}
                        className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border text-muted-foreground hover:bg-muted/50 transition-colors"
                    >
                        <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
                            <path d="M21 3v5h-5" />
                        </svg>
                        Replay
                    </button>
                </div>

                {/* ── SVG Chart ── */}
                <svg viewBox={`0 0 ${W} 220`} className="w-full h-auto" onMouseLeave={() => { setTooltip(t => ({ ...t, visible: false })); setCrosshairOn(false) }}>
                    <defs>
                        <linearGradient id="ec-fill" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#16a34a" stopOpacity="0.15" />
                            <stop offset="100%" stopColor="#16a34a" stopOpacity="0.01" />
                        </linearGradient>
                        <clipPath id="ec-clip">
                            <rect x="0" y="0" width={revealX} height="220" />
                        </clipPath>
                    </defs>

                    {/* Grid */}
                    {[0, 1, 2, 3, 4].map(i => {
                        const y   = PT + (i / 4) * (PB - PT)
                        const pct = 17.2 - (i / 4) * 17.2
                        return (
                            <g key={i}>
                                <line x1={PL} y1={y} x2={PR} y2={y} stroke="currentColor" strokeWidth="0.5" opacity="0.08" />
                                <text x={PL - 6} y={y + 4} textAnchor="end" fontSize="9" fill="currentColor" opacity="0.4"
                                    style={{ fontFamily: 'var(--font-mono, monospace)' }}>
                                    +{pct.toFixed(1)}%
                                </text>
                            </g>
                        )
                    })}

                    {/* Area + Line */}
                    <path d={AREA_PATH} fill="url(#ec-fill)" clipPath="url(#ec-clip)" />
                    <path d={LINE_PATH} fill="none" stroke="#16a34a" strokeWidth="2.5"
                        strokeLinecap="round" strokeLinejoin="round" clipPath="url(#ec-clip)" />

                    {/* Crosshair */}
                    {crosshairOn && (
                        <line x1={crosshairX} y1={PT} x2={crosshairX} y2={PB}
                            stroke="#16a34a" strokeWidth="1" strokeDasharray="4 3" opacity="0.4" />
                    )}

                    {/* Dots */}
                    {dataPoints.map((d, i) => {
                        const x = gx(i), y = gy(d.return)
                        const revealed  = x <= revealX
                        const isLast    = i === dataPoints.length - 1
                        const isHovered = tooltip.visible && tooltip.index === i
                        return (
                            <circle key={i} cx={x} cy={y}
                                r={isHovered ? (isLast ? 9 : 6) : (isLast ? 7 : 4)}
                                fill="#16a34a" stroke="white" strokeWidth="2"
                                opacity={revealed ? 1 : 0}
                                style={{
                                    transition: 'opacity .25s, r .15s',
                                    cursor: 'pointer',
                                    animation: isLast && revealed ? 'ec-pulse 1.8s ease-in-out infinite' : undefined,
                                }}
                                onMouseEnter={() => { setTooltip({ visible: true, index: i, x, y }); setCrosshairX(x); setCrosshairOn(true) }}
                                onMouseLeave={() => { setTooltip(t => ({ ...t, visible: false })); setCrosshairOn(false) }}
                            />
                        )
                    })}

                    {/* Tooltip */}
                    {tooltip.visible && (
                        <g>
                            <rect x={ttX} y={ttY} width="88" height="54" rx="6"
                                fill="white" stroke="#16a34a" strokeWidth="1.5"
                                style={{ filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.1))' }} />
                            <text x={ttX + 44} y={ttY + 17} textAnchor="middle"
                                fontSize="10" fontWeight="500" fill="#111"
                                style={{ fontFamily: 'var(--font-sans)' }}>{ttd.day}</text>
                            <text x={ttX + 44} y={ttY + 33} textAnchor="middle"
                                fontSize="12" fontWeight="600" fill="#16a34a"
                                style={{ fontFamily: 'var(--font-mono, monospace)' }}>+{ttd.return}%</text>
                            <text x={ttX + 44} y={ttY + 48} textAnchor="middle"
                                fontSize="9" fill="#888"
                                style={{ fontFamily: 'var(--font-mono, monospace)' }}>${ttd.balance.toLocaleString()}</text>
                        </g>
                    )}

                    {/* X-axis labels */}
                    {[0, Math.floor(dataPoints.length / 2), dataPoints.length - 1].map(i => (
                        <text key={i} x={gx(i)} y={215} textAnchor="middle"
                            fontSize="9" fill="currentColor" opacity="0.4"
                            style={{ fontFamily: 'var(--font-mono, monospace)' }}>
                            {dataPoints[i].day}
                        </text>
                    ))}
                </svg>

                {/* ── Stats ── */}
                <div
                    className="grid grid-cols-3 gap-2 mt-5 transition-all duration-700"
                    style={{ opacity: statsVisible ? 1 : 0, transform: statsVisible ? 'translateY(0)' : 'translateY(8px)' }}
                >
                    {[
                        { label: 'Starting',   value: '$10,000',  color: '' },
                        { label: 'Current',    value: '$11,720',  color: 'text-green-600' },
                        { label: 'Net profit', value: '+$1,720',  color: 'text-green-600' },
                    ].map(s => (
                        <div key={s.label} className="bg-muted/40 rounded-lg p-3 text-center hover:bg-muted/60 transition-colors">
                            <p className="text-[11px] text-muted-foreground mb-1">{s.label}</p>
                            <p className={`text-[15px] font-semibold font-mono ${s.color}`}>{s.value}</p>
                        </div>
                    ))}
                </div>
            </div>

            <style>{`
                @keyframes ec-pulse { 0%,100%{r:7;opacity:1}50%{r:10;opacity:.5} }
                @keyframes ticker-scroll { 0%{transform:translateX(0)}100%{transform:translateX(-50%)} }
                .animate-ticker { animation: ticker-scroll 24s linear infinite; }
            `}</style>
        </div>
    )
}