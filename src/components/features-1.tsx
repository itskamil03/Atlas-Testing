"use client"

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { ShieldCheck, Sparkles, TrendingUp, Zap, BarChart2, Database, Activity, ArrowUpRight } from 'lucide-react'
import { ReactNode, useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion, useInView, useSpring, useTransform, useMotionValue } from 'framer-motion'

// ─── Types ────────────────────────────────────────────────────────────────────

type MarketPulse = {
    label: string
    value: string
    delta: string
    direction: 'up' | 'down'
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const basePulses: MarketPulse[] = [
    { label: 'Gold',           value: '$2,418', delta: '+0.72%', direction: 'up'   },
    { label: 'USDINR',         value: '83.21',  delta: '-0.18%', direction: 'down' },
    { label: 'Crypto Breadth', value: '68%',    delta: '+4.1%',  direction: 'up'   },
]

const featureCards = [
    {
        icon: Zap,
        title: 'Algorithmic Trading Engine',
        description:
            'Automated execution algorithms designed to identify and act on high-probability opportunities across global markets.',
        accent: 'from-emerald-400/30 to-cyan-400/10',
    },
    {
        icon: Sparkles,
        title: 'Forex Intelligence Suite',
        description:
            'AI-driven currency market signals, macro analysis, and volatility-aware strategies built for FX traders.',
        accent: 'from-cyan-400/30 to-sky-400/10',
    },
    {
        icon: TrendingUp,
        title: 'Crypto Quant Engine',
        description:
            'Quantitative crypto strategies with momentum, mean-reversion, and risk-managed execution for digital asset markets.',
        accent: 'from-fuchsia-400/30 to-violet-400/10',
    },
    {
        icon: ShieldCheck,
        title: 'Risk Management Engine',
        description:
            'Integrated risk controls, position sizing, and drawdown management to protect capital while trading aggressively.',
        accent: 'from-amber-400/30 to-orange-400/10',
    },
    {
        icon: BarChart2,
        title: 'Portfolio & Performance Dashboard',
        description:
            'Track trading performance, risk metrics, and portfolio allocations with intuitive analytics designed for professional traders.',
        accent: 'from-lime-400/30 to-emerald-400/10',
    },
    {
        icon: Database,
        title: 'Advanced Backtesting Suite',
        description:
            'Historical data analysis, Monte Carlo simulations, and strategy optimization for professional traders and institutions.',
        accent: 'from-indigo-400/30 to-slate-400/10',
    },
]

// ─── Shared animation variants ────────────────────────────────────────────────

const fadeUpVariants = {
    hidden:  { opacity: 0, y: 28, filter: 'blur(4px)' },
    visible: { opacity: 1, y: 0,  filter: 'blur(0px)' },
}

const cardVariants = {
    hidden:  { opacity: 0, y: 36, scale: 0.96, filter: 'blur(3px)' },
    visible: { opacity: 1, y: 0,  scale: 1,    filter: 'blur(0px)' },
}

const pulseCardVariants = {
    hidden:  { opacity: 0, y: 20, scale: 0.97 },
    visible: { opacity: 1, y: 0,  scale: 1    },
}

// ─── Smooth number spring hook ────────────────────────────────────────────────
// Keeps the float value animated so market-pulse number changes feel live, not jarring.
function useSmoothNumber(value: number, stiffness = 80, damping = 18) {
    const mv     = useMotionValue(value)
    const spring = useSpring(mv, { stiffness, damping })
    useEffect(() => { mv.set(value) }, [value, mv])
    return spring
}

// ─── Animated market-pulse card ───────────────────────────────────────────────

function PulseCard({ pulse, index, enableMotion }: { pulse: MarketPulse; index: number; enableMotion: boolean }) {
    return (
        <motion.div
            variants={pulseCardVariants}
            transition={{
                duration: 0.55,
                delay: index * 0.08,
                ease: [0.25, 0.46, 0.45, 0.94],
            }}
            // No whileHover y-bob here — it fights the ticker interval and causes jank.
            className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white/90 p-4 text-center text-slate-950 shadow-2xl shadow-slate-900/10 md:max-w-none md:text-left dark:border-white/10 dark:bg-slate-950/80 dark:text-white dark:shadow-black/20 "
        >
            <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
                <span>{pulse.label}</span>
                <motion.span
                    key={pulse.delta}
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    className={pulse.direction === 'up' ? 'text-emerald-600 dark:text-emerald-300' : 'text-rose-600 dark:text-rose-300'}
                >
                    {pulse.delta}
                </motion.span>
            </div>
            <div className="mt-3 flex items-end justify-between gap-4">
                <div>
                    <motion.p
                        key={pulse.value}
                        initial={{ opacity: 0.6 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.25, ease: 'easeOut' }}
                        className="text-2xl font-semibold text-slate-950 tabular-nums dark:text-white"
                    >
                        {pulse.value}
                    </motion.p>
                    <p className="text-xs uppercase tracking-[0.25em] text-slate-500 dark:text-slate-500">live feed</p>
                </div>
                <ArrowUpRight
                    className={pulse.direction === 'up' ? 'size-5 text-emerald-600 dark:text-emerald-300' : 'size-5 rotate-90 text-rose-600 dark:text-rose-300'}
                    aria-hidden
                />
            </div>
        </motion.div>
    )
}

// ─── Feature card ─────────────────────────────────────────────────────────────

function FeatureCard({ item, index, enableMotion }: { item: typeof featureCards[0]; index: number; enableMotion: boolean }) {
    return (
        <motion.div
            variants={cardVariants}
            transition={{
                duration: 0.6,
                delay: index * 0.07,          // 70 ms stagger — clearly visible, not sluggish
                ease: [0.22, 1, 0.36, 1],     // custom cubic-bezier for a springy feel
            }}
            whileHover={enableMotion ? {
                y: -6,
                scale: 1.018,
                transition: { duration: 0.22, ease: [0.22, 1, 0.36, 1] },
            } : undefined}
        >
            <Card className="group relative h-full overflow-hidden border border-slate-200 bg-white/90 text-slate-950 shadow-2xl shadow-slate-900/10 backdrop-blur-xl transition-colors duration-300 hover:border-emerald-400/30 dark:border-white/10 dark:bg-white/5 dark:text-white dark:shadow-black/20">
                {/* Hover accent fill */}
                <div className={`absolute inset-0 bg-linear-to-br ${item.accent} opacity-0 transition-opacity duration-300 group-hover:opacity-100`} />

                <CardHeader className="relative pb-3 pt-6 text-center md:text-center">
                    <CardDecorator animate={enableMotion}>
                        <item.icon className="size-6" aria-hidden />
                    </CardDecorator>
                    <h3 className="mt-6 text-lg font-medium text-slate-950 dark:text-white">{item.title}</h3>
                </CardHeader>

                <CardContent className="relative pb-6 text-center">
                    <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">{item.description}</p>
                </CardContent>
            </Card>
        </motion.div>
    )
}

// ─── Card decorator ───────────────────────────────────────────────────────────

const CardDecorator = ({ children, animate = true }: { children: ReactNode; animate?: boolean }) => (
    <div className="mask-radial-from-40% mask-radial-to-60% relative mx-auto size-36 [--color-border:color-mix(in_oklab,var(--color-white)12%,transparent)] group-hover:[--color-border:color-mix(in_oklab,var(--color-white)22%,transparent)]">
        {/* Grid background */}
        <div
            aria-hidden
            className="absolute inset-0 bg-[linear-gradient(to_right,var(--color-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-border)_1px,transparent_1px)] bg-size-[24px_24px] opacity-60"
        />

        {/* Rotating glow — pure CSS so it never restarts on re-render */}
        {animate && (
            <div
                aria-hidden
                className="absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(16,185,129,0.2),transparent_60%)] blur-xl animate-[spin_10s_linear_infinite]"
            />
        )}

        {/* Icon container — subtle breathe pulse via CSS */}
        <div
            className={`bg-white/95 absolute inset-0 m-auto flex size-12 items-center justify-center rounded-2xl border border-slate-200 shadow-lg shadow-slate-900/10 dark:bg-background/95 dark:border-white/10 dark:shadow-emerald-950/20
            ${animate ? 'animate-[breathe_1.6s_ease-in-out_infinite]' : ''}`}
        >
            {children}
        </div>
    </div>
)

// ─── Main component ───────────────────────────────────────────────────────────

export default function Features() {
    const [pulses, setPulses] = useState(basePulses)
    const shouldReduceMotion  = useReducedMotion()

    // Detect mobile once on mount — stable, no resize loop needed for animation decisions
    const [isMobile, setIsMobile] = useState(false)
    useEffect(() => {
        setIsMobile(window.matchMedia('(max-width: 767px)').matches)
    }, [])

    const enableMotion = !shouldReduceMotion && !isMobile

    // ── InView refs for orchestrated entrance animations ──────────────────────
    // Each ref triggers its own stagger group. Using `once: true` means the animation
    // plays exactly once when scrolled into view — no jank from exit/re-enter toggling.
    const headingRef  = useRef<HTMLDivElement>(null)
    const pulsesRef   = useRef<HTMLDivElement>(null)
    const cardsRef    = useRef<HTMLDivElement>(null)

    const headingInView = useInView(headingRef,  { once: true, margin: '0px 0px -80px 0px' })
    const pulsesInView  = useInView(pulsesRef,   { once: true, margin: '0px 0px -60px 0px' })
    const cardsInView   = useInView(cardsRef,    { once: true, margin: '0px 0px -40px 0px' })

    // ── Market pulse tick — runs independently of animation state ─────────────
    useEffect(() => {
        const interval = window.setInterval(() => {
            setPulses(current =>
                current.map(pulse => {
                    const drift = (Math.random() * 0.6 + 0.1).toFixed(2)
                    const flip  = Math.random() > 0.55 ? 1 : -1
                    return {
                        ...pulse,
                        delta: `${pulse.direction === 'up' ? '+' : '-'}${drift}%`,
                        value:
                            pulse.label === 'Gold'
                                ? `$${(2418 + flip * Math.round(Math.random() * 6)).toLocaleString()}`
                                : pulse.label === 'USDINR'
                                ? (83.21 + flip * Math.random() * 0.08).toFixed(2)
                                : `${Math.max(52, Math.min(92, 68 + flip * Math.round(Math.random() * 4)))}%`,
                    }
                })
            )
        }, isMobile ? 3600 : 2200)

        return () => window.clearInterval(interval)
    }, [isMobile])

    return (
        <section
            id="features"
            className="relative overflow-hidden bg-slate-50 py-20 text-slate-950 md:py-24 dark:bg-slate-950 dark:text-white mt-4"
        >
            {/* ── Background gradients — pure CSS, zero JS ── */}
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.12),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.08),transparent_28%),linear-gradient(180deg,rgba(248,250,252,0.96),rgba(241,245,249,0.9))] dark:bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.18),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.12),transparent_28%),linear-gradient(180deg,rgba(2,6,23,0.96),rgba(2,6,23,0.82))]"
            />

            {/* ── Floating orbs — CSS keyframes, never restart on state change ── */}
            {enableMotion && (
                <>
                    <div
                        aria-hidden
                        className="pointer-events-none absolute -left-24 top-12 size-72 rounded-full bg-emerald-400/10 blur-3xl animate-[floatA_12s_ease-in-out_infinite]"
                    />
                    <div
                        aria-hidden
                        className="pointer-events-none absolute -right-24 bottom-0 size-80 rounded-full bg-cyan-400/10 blur-3xl animate-[floatB_14s_ease-in-out_infinite]"
                    />
                </>
            )}

            <div className="relative @container mx-auto max-w-6xl px-6">

                {/* ── Heading group ── */}
                <motion.div
                    ref={headingRef}
                    variants={fadeUpVariants}
                    initial="hidden"
                    animate={headingInView ? 'visible' : 'hidden'}
                    transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
                    className="mx-auto max-w-3xl text-center"
                >
                    <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-700 backdrop-blur dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-200">
                        <Activity className="size-4 animate-pulse" aria-hidden />
                        Live market intelligence
                    </div>
                    <h2 className="text-4xl font-semibold tracking-tight text-slate-950 lg:text-6xl dark:text-white">
                        What ATLAS Does
                    </h2>
                    <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-600 md:text-lg dark:text-slate-300">
                        A next-generation algorithmic trading platform for Forex, Crypto, and Indices. We combine
                        quantitative models, AI-driven signals, and automated execution with a sleek, real-time
                        market experience.
                    </p>
                </motion.div>

                {/* ── Market pulse strip ── */}
                <motion.div
                    ref={pulsesRef}
                    variants={{ hidden: {}, visible: {} }}   // container — stagger children
                    initial="hidden"
                    animate={pulsesInView ? 'visible' : 'hidden'}
                    className="mx-auto mt-10 grid max-w-4xl grid-cols-1 justify-items-center gap-4 rounded-3xl border border-slate-200 bg-white/70 p-4 backdrop-blur-xl md:grid-cols-3 dark:border-white/10 dark:bg-white/5"
                >
                    {pulses.map((pulse, i) => (
                        <PulseCard
                            key={pulse.label}
                            pulse={pulse}
                            index={i}
                            enableMotion={enableMotion}
                        />
                    ))}
                </motion.div>

                {/* ── Feature cards grid ── */}
                <motion.div
                    ref={cardsRef}
                    variants={{ hidden: {}, visible: {} }}   // container — stagger children
                    initial="hidden"
                    animate={cardsInView ? 'visible' : 'hidden'}
                    className="mx-auto mt-6 grid max-w-sm gap-6 *:text-center md:max-w-none md:grid-cols-2 lg:grid-cols-3"
                >
                    {featureCards.map((item, i) => (
                        <FeatureCard
                            key={item.title}
                            item={item}
                            index={i}
                            enableMotion={enableMotion}
                        />
                    ))}
                </motion.div>
            </div>

            {/* ── Global keyframes injected once ── */}
            <style>{`
                @keyframes floatA {
                    0%, 100% { transform: translate(0,  0);    }
                    50%       { transform: translate(24px, -18px); }
                }
                @keyframes floatB {
                    0%, 100% { transform: translate(0, 0);     }
                    50%       { transform: translate(-20px, 16px); }
                }
                @keyframes breathe {
                    0%, 100% { opacity: 0.75; transform: scale(1);    }
                    50%       { opacity: 1;    transform: scale(1.05); }
                }
            `}</style>
        </section>
    )
}