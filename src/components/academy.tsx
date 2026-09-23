'use client'
import { motion } from 'framer-motion'
import { Zap, TrendingUp, Shield, Brain, Code, BookOpen } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function Academy() {
  const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }

  const modules = [
    'Market Foundations',
    'Technical Mastery',
    'Algo Trading Fundamentals',
    'Automation',
    'Risk',
    'Psychology',
  ]

  const moduleIcons = [BookOpen, TrendingUp, Code, Zap, Shield, Brain]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.1 },
    },
  }

  return (
    <section id="academy" className="py-14 md:py-20">
      <div className="mx-auto max-w-7xl px-6">
        {/* Header */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          variants={fadeUp}
          className="mb-12 text-center"
        >
          <div className="flex flex-col items-center justify-center">
            <motion.p className="text-sm font-semibold uppercase tracking-widest text-purple-400 dark:text-purple-400">
              ATLAS Academy
            </motion.p>
            <h2 className="mt-3 text-3xl font-bold sm:text-4xl lg:text-5xl">Master Trading Program</h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm sm:text-base text-muted-foreground leading-relaxed">
              Institutional-grade learning designed for traders and quantitative strategists seeking disciplined execution across global markets.
            </p>

            {/* Enroll Now Button Shifted to Top */}
            <motion.div 
              className="mt-6"
              whileHover={{ scale: 1.04 }} 
              whileTap={{ scale: 0.98 }} 
              transition={{ duration: 0.12 }}
            >
              <Button asChild size="lg" className="rounded-xl px-7 py-5 text-sm sm:text-base shadow-lg bg-purple-600 hover:bg-purple-700 text-white font-bold active:scale-95 transition-all duration-100 border-none shadow-purple-600/25">
                <Link href="/signup">
                  Enroll Now
                </Link>
              </Button>
            </motion.div>
          </div>
        </motion.div>

        {/* Two Column: Description + Modules */}
        <div className="grid gap-6 lg:grid-cols-3 lg:gap-8">
          {/* Left: Description + Focus */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.15 }}
          >
            <Card className="h-full border bg-card/60 backdrop-blur-sm rounded-2xl">
              <CardContent className="p-6 sm:p-7">
                <p className="text-sm sm:text-base leading-relaxed text-muted-foreground">
                  ATLAS Academy combines market theory, technical mastery, algo design, and risk management to help traders build and execute professional-grade systems.
                </p>
                <motion.div
                  whileHover={{ y: -4, boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}
                  transition={{ duration: 0.2 }}
                  className="mt-6 rounded-2xl bg-linear-to-br from-purple-500/10 to-indigo-500/10 p-5 dark:from-purple-900/20 dark:to-indigo-900/20 border border-purple-500/15"
                >
                  <h3 className="text-lg font-semibold">Program Focus</h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">
                    Trade with discipline. Build algos that adapt to market conditions. Deploy automation for retail and institutional workflows.
                  </p>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Right: Core Modules (6 items in grid) */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
            className="lg:col-span-2"
          >
            <h3 className="mb-4 text-xl font-bold">Core Modules</h3>
            <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
              {modules.map((module, index) => {
                const IconComponent = moduleIcons[index]
                return (
                  <motion.div
                    key={module}
                    variants={fadeUp}
                    whileHover={{ y: -4, boxShadow: '0 12px 24px -5px rgba(124,58,237,0.15)' }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    <Card className="group h-full cursor-pointer border bg-card/50 rounded-2xl transition-all duration-200 hover:border-purple-500/40">
                      <CardContent className="p-4 sm:p-5">
                        <div className="flex items-center gap-3.5">
                          <div className="rounded-xl bg-linear-to-br from-purple-500/15 to-indigo-500/15 p-2.5 group-hover:scale-110 transition-transform duration-200">
                            <IconComponent className="size-5 text-purple-400" />
                          </div>
                          <p className="text-sm sm:text-base font-semibold text-foreground group-hover:text-purple-400 transition-colors duration-200">
                            {module}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </div>
            <p className="mt-5 text-sm text-muted-foreground leading-relaxed">
              Designed for traders preparing to trade with institutional discipline, prop desk precision, and automated execution workflows.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  )
}