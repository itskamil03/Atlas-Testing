"use client"

import { useRef, useState, useEffect, useCallback } from 'react'
import { motion, useMotionValue, useAnimationFrame, animate } from 'framer-motion'
import { BrainCircuit, Zap, BarChart3, LayoutDashboard, Gauge, Sparkles, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react'

const PILLARS = [
  {
    title: "AI-Powered Insights",
    description: "Turn raw market data into meaningful, high-probability directional insights.",
    icon: BrainCircuit,
    iconColor: "text-purple-400",
    borderHover: "hover:border-purple-500/80",
    badgeColor: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  },
  {
    title: "Real-Time Intelligence",
    description: "Stay ahead of rapid volatility with instantaneous signal alerts as markets move.",
    icon: Zap,
    iconColor: "text-amber-400",
    borderHover: "hover:border-amber-500/80",
    badgeColor: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  },
  {
    title: "Advanced Analysis",
    description: "Institutional-grade technical, quantitative modeling, and liquidity-based order flow.",
    icon: BarChart3,
    iconColor: "text-emerald-400",
    borderHover: "hover:border-emerald-500/80",
    badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  },
  {
    title: "One Unified Terminal",
    description: "Less switching between fragmented charting tools. More focus on disciplined execution.",
    icon: LayoutDashboard,
    iconColor: "text-sky-400",
    borderHover: "hover:border-sky-500/80",
    badgeColor: "bg-sky-500/10 text-sky-400 border-sky-500/20",
  },
  {
    title: "Built for Speed",
    description: "Ultra low-latency architecture designed for faster analysis and lightning decision-making.",
    icon: Gauge,
    iconColor: "text-rose-400",
    borderHover: "hover:border-rose-500/80",
    badgeColor: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  },
]

export default function WhyChooseAtlas() {
  const trackRef = useRef<HTMLDivElement>(null)
  const [isPaused, setIsPaused] = useState(false)
  const isPausedRef = useRef(false)
  const pauseTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const halfWidthRef = useRef(0)

  // Motion value for continuous GPU-accelerated translateX
  const x = useMotionValue(0)

  // 4 sets of pillars (20 cards total) for seamless looping
  const duplicatedPillars = [...PILLARS, ...PILLARS, ...PILLARS, ...PILLARS]

  // Keep ref synchronized with state to avoid closure staleness
  useEffect(() => {
    isPausedRef.current = isPaused
  }, [isPaused])

  // Measure half-width of the duplicated track
  const measureTrack = useCallback(() => {
    if (trackRef.current) {
      halfWidthRef.current = trackRef.current.scrollWidth / 2
    }
  }, [])

  useEffect(() => {
    measureTrack()
    window.addEventListener('resize', measureTrack)
    return () => window.removeEventListener('resize', measureTrack)
  }, [measureTrack])

  // Continuous buttery-smooth sliding animation
  useAnimationFrame((time, delta) => {
    if (isPausedRef.current) return
    const halfWidth = halfWidthRef.current
    if (halfWidth <= 0) {
      measureTrack()
      return
    }

    // Move smoothly at ~75px per second
    const moveBy = (Math.min(delta, 50) / 1000) * 75
    const currentX = x.get()
    const nextX = currentX - moveBy

    // Seamless infinite wrap
    if (nextX <= -halfWidth) {
      x.set(nextX + halfWidth)
    } else if (nextX > 0) {
      x.set(nextX - halfWidth)
    } else {
      x.set(nextX)
    }
  })

  // Manual button navigation with smooth spring/ease transition
  const handleManualClick = (direction: 'next' | 'prev') => {
    measureTrack()
    const halfWidth = halfWidthRef.current
    const step = 350
    const currentX = x.get()
    const targetX = direction === 'next' ? currentX - step : currentX + step

    setIsPaused(true)
    if (pauseTimeoutRef.current) clearTimeout(pauseTimeoutRef.current)

    animate(x, targetX, {
      duration: 0.55,
      ease: 'easeOut',
      onComplete: () => {
        const finalX = x.get()
        if (halfWidth > 0) {
          if (finalX <= -halfWidth) {
            x.set(finalX + halfWidth)
          } else if (finalX > 0) {
            x.set(finalX - halfWidth)
          }
        }
      },
    })

    pauseTimeoutRef.current = setTimeout(() => {
      setIsPaused(false)
    }, 3500)
  }

  // Cleanup timeout
  useEffect(() => {
    return () => {
      if (pauseTimeoutRef.current) clearTimeout(pauseTimeoutRef.current)
    }
  }, [])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: 'easeOut' as const },
    },
  }

  return (
    <section id="why-choose-atlas" className="relative py-16 md:py-24 border-t border-border/40 bg-background overflow-hidden">
      <div className="mx-auto max-w-6xl px-6">
        {/* Header */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={containerVariants}
          className="text-center mb-12 md:mb-16"
        >
          <motion.div
            variants={itemVariants}
            className="inline-flex items-center gap-2 rounded-full border border-purple-500/20 bg-purple-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.25em] text-purple-400 mb-6"
          >
            <Sparkles className="size-3.5 text-purple-400" />
            <span>The ATLAS Advantage</span>
          </motion.div>

          <motion.h2
            variants={itemVariants}
            className="text-3xl font-semibold sm:text-4xl lg:text-5xl text-foreground tracking-tight"
          >
            Why Choose ATLAS
          </motion.h2>

          <motion.p
            variants={itemVariants}
            className="mx-auto mt-4 max-w-2xl text-base sm:text-lg font-medium text-muted-foreground"
          >
            Built for the Way Modern Traders Trade.
          </motion.p>
        </motion.div>
      </div>

      {/* Expanded Animation & Scroll Area with Left/Right Buttons */}
      <div className="mx-auto max-w-[1400px] px-4 sm:px-8 xl:px-12 relative group">
        {/* Side Gradient Fade Masks */}
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-12 sm:w-20 bg-gradient-to-r from-background to-transparent z-20" />
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-12 sm:w-20 bg-gradient-to-l from-background to-transparent z-20" />

        {/* Manual Scroll Button - Left (Shifted 0.5in left) */}
        <button
          type="button"
          onClick={() => handleManualClick('prev')}
          aria-label="Scroll cards left"
          className="absolute left-2 sm:left-4 xl:left-6 top-1/2 -translate-y-1/2 -translate-x-[0.5in] z-40 flex size-11 items-center justify-center rounded-full border border-border/80 bg-card/95 text-foreground backdrop-blur-md shadow-2xl transition-all duration-200 hover:border-purple-500 hover:bg-card hover:scale-110 active:scale-95 cursor-pointer"
        >
          <ChevronLeft className="size-5" />
        </button>

        {/* Manual Scroll Button - Right (Shifted 0.5in right) */}
        <button
          type="button"
          onClick={() => handleManualClick('next')}
          aria-label="Scroll cards right"
          className="absolute right-2 sm:right-4 xl:right-6 top-1/2 -translate-y-1/2 translate-x-[0.5in] z-40 flex size-11 items-center justify-center rounded-full border border-border/80 bg-card/95 text-foreground backdrop-blur-md shadow-2xl transition-all duration-200 hover:border-purple-500 hover:bg-card hover:scale-110 active:scale-95 cursor-pointer"
        >
          <ChevronRight className="size-5" />
        </button>

        {/* Continuous Hardware-Accelerated Sliding Track */}
        <div
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => {
            if (pauseTimeoutRef.current) clearTimeout(pauseTimeoutRef.current)
            pauseTimeoutRef.current = setTimeout(() => setIsPaused(false), 2000)
          }}
          className="overflow-hidden rounded-2xl py-3 select-none cursor-grab active:cursor-grabbing"
        >
          <motion.div
            ref={trackRef}
            style={{ x }}
            className="flex w-max gap-5 sm:gap-6 will-change-transform"
          >
            {duplicatedPillars.map((pillar, index) => {
              const Icon = pillar.icon
              return (
                <div
                  key={`${pillar.title}-${index}`}
                  className={`flex w-[300px] sm:w-[330px] shrink-0 flex-col justify-between rounded-2xl border border-border/80 bg-card/60 p-6 backdrop-blur-sm transition-all duration-200 hover:-translate-y-1 hover:bg-card/90 ${pillar.borderHover}`}
                >
                  <div>
                    <div className={`flex size-11 items-center justify-center rounded-xl border ${pillar.badgeColor} transition-transform duration-200 group-hover:scale-105`}>
                      <Icon className="size-5.5" />
                    </div>

                    <h3 className="mt-5 text-lg font-semibold text-foreground">
                      {pillar.title}
                    </h3>

                    <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                      {pillar.description}
                    </p>
                  </div>

                  <div className="mt-6 flex items-center gap-2 text-xs font-medium text-muted-foreground">
                    <CheckCircle2 className="size-3.5 text-purple-400" />
                    <span>Included in ATLAS</span>
                  </div>
                </div>
              )
            })}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
