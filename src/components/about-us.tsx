"use client"

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Check } from 'lucide-react'
import { motion } from 'framer-motion'

export default function AboutUs() {
  const fadeUp = { hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0 } }

  return (
    <section id="about" className="py-16 md:py-20">
      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          variants={fadeUp}
          className="mb-8 text-center lg:text-left"
        >
          <h2 className="text-3xl font-semibold sm:text-4xl lg:text-5xl">About ATLAS</h2>
          <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
            Research-first macro intelligence and execution infrastructure for modern traders — blending data,
            strategy, and institutional-grade analysis.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 items-center gap-10 md:grid-cols-2">
          {/* Left: Decorative artwork + mini cards */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            whileHover={{ translateY: -4 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="group flex items-center justify-center"
          >
            <div className="relative w-full max-w-md">
              <div className="pointer-events-auto transform-gpu transition-transform duration-300 will-change-transform aspect-[4/3] w-full rounded-2xl bg-gradient-to-br from-emerald-400/20 via-cyan-200/10 to-sky-400/10 p-6 shadow-lg dark:from-emerald-900/30 dark:via-sky-900/20 dark:to-slate-900/40 group-hover:scale-105">
                <svg className="absolute -left-12 -top-10 h-48 w-48 opacity-30" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                  <defs>
                    <linearGradient id="g" x1="0" x2="1">
                      <stop offset="0" stopColor="#34D399" />
                      <stop offset="1" stopColor="#06B6D4" />
                    </linearGradient>
                  </defs>
                  <circle cx="100" cy="100" r="80" fill="url(#g)" />
                </svg>

                <div className="relative z-10 h-full w-full flex items-center justify-center">
                  <div className="w-full space-y-4">
                    <motion.div whileHover={{ y: -6 }} whileTap={{ scale: 0.995 }} transition={{ duration: 0.18 }}>
                      <Card className="rounded-xl bg-white/60 dark:bg-slate-900/60 hover:shadow-xl transition-shadow duration-200">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-xs font-medium text-muted-foreground">Signals Delivered</div>
                              <div className="mt-1 text-lg font-semibold">1,200 / mo</div>
                            </div>
                            <div className="text-emerald-500">▲</div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>

                    <motion.div whileHover={{ y: -6 }} whileTap={{ scale: 0.995 }} transition={{ duration: 0.18 }}>
                      <Card className="rounded-xl bg-white/60 dark:bg-slate-900/60 hover:shadow-xl transition-shadow duration-200">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-xs font-medium text-muted-foreground">Markets Covered</div>
                              <div className="mt-1 text-lg font-semibold">FX · Crypto · Commodities</div>
                            </div>
                            <div className="text-cyan-500">●</div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right: Content */}
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} transition={{ duration: 0.6 }}>
            <p className="text-lg text-muted-foreground leading-relaxed">
              ATLAS translates macroeconomic signals, market microstructure, and liquidity dynamics into clear,
              actionable ideas. We combine quantitative research, institutional workflows, and risk-first frameworks
              to help traders make disciplined decisions.
            </p>

            <div className="mt-6 space-y-4">
              <ul className="grid gap-3 sm:grid-cols-2">
                {[
                  'Institutional-style research',
                  'Technical & macro analysis',
                  'Risk-focused frameworks',
                  'Data-driven market interpretation',
                ].map((item) => (
                  <motion.li
                    key={item}
                    whileHover={{ x: 6 }}
                    whileTap={{ scale: 0.995 }}
                    transition={{ type: 'spring', stiffness: 350 }}
                    className="flex items-start gap-3"
                  >
                    <span className="mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-300 group-hover:bg-emerald-100 transition-colors duration-150">
                      <Check className="h-4 w-4" />
                    </span>
                    <span className="text-sm text-muted-foreground">{item}</span>
                  </motion.li>
                ))}
              </ul>
            </div>

            <p className="mt-6 text-sm text-muted-foreground">
              We focus on clarity and long-term research — not short-term noise. Our insights are designed for
              traders, portfolio managers, and institutions seeking disciplined market understanding.
            </p>

            <div className="mt-6">
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }} transition={{ duration: 0.12 }}>
                <Button asChild className="shadow-md">
                  <a href="#contact">Explore Our Research</a>
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
