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
    <section id="academy" className="py-20 md:py-28" style={{ zoom: 0.70 }}>
      <div className="mx-auto max-w-7xl px-6">
        {/* Header */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          variants={fadeUp}
          className="mb-14 text-center"
        >
          <div className="flex flex-col items-center justify-center">
            <motion.p className="text-xs font-semibold uppercase tracking-widest text-[#9BFF00] dark:text-[#9BFF00]">
              ATLAS Academy
            </motion.p>
            <h2 className="mt-3 text-4xl font-bold sm:text-5xl lg:text-6xl">Master Trading Program</h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              Institutional-grade learning designed for traders and quantitative strategists seeking disciplined execution across global markets.
            </p>

            {/* Enroll Now Button Shifted to Top */}
            <motion.div 
              className="mt-6"
              whileHover={{ scale: 1.04 }} 
              whileTap={{ scale: 0.98 }} 
              transition={{ duration: 0.12 }}
            >
              <Button asChild size="lg" className="rounded-xl px-8 py-6 text-base shadow-lg bg-[#9BFF00] hover:bg-[#B7FF45] text-[#11140D] font-bold active:scale-95 transition-all duration-100 border-none shadow-[#9BFF00]/20">
                <Link href="/signup">
                  Enroll Now
                </Link>
              </Button>
            </motion.div>
          </div>
        </motion.div>

        {/* Two Column: Description + Modules */}
        <div className="grid gap-8 lg:grid-cols-3 lg:gap-10">
          {/* Left: Description + Focus */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.15 }}
          >
            <Card className="h-full border bg-white/50 backdrop-blur-sm dark:bg-slate-900/40">
              <CardContent className="p-8">
                <p className="text-lg leading-8 text-muted-foreground">
                  ATLAS Academy combines market theory, technical mastery, algo design, and risk management to help traders build and execute professional-grade systems.
                </p>
                <motion.div
                  whileHover={{ y: -4, boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}
                  transition={{ duration: 0.2 }}
                  className="mt-6 rounded-2xl bg-linear-to-br from-cyan-50/50 to-blue-50/50 p-6 dark:from-cyan-900/20 dark:to-blue-900/20"
                >
                  <h3 className="text-xl font-semibold">Program Focus</h3>
                  <p className="mt-3 text-sm text-muted-foreground">
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
            <h3 className="mb-6 text-2xl font-bold">Core Modules</h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {modules.map((module, index) => {
                const IconComponent = moduleIcons[index]
                return (
                  <motion.div
                    key={module}
                    variants={fadeUp}
                    whileHover={{ y: -6, boxShadow: '0 12px 24px -5px rgba(0,0,0,0.15)' }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    <Card className="group h-full cursor-pointer border bg-linear-to-br from-slate-50 to-slate-50/50 transition-all duration-200 dark:from-slate-800/40 dark:to-slate-900/40">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="rounded-lg bg-linear-to-br from-cyan-100 to-blue-100 p-3 group-hover:scale-110 transition-transform duration-200 dark:from-cyan-900/30 dark:to-blue-900/30">
                            <IconComponent className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />
                          </div>
                          <p className="font-semibold text-slate-900 dark:text-white group-hover:text-cyan-600 transition-colors duration-200 dark:group-hover:text-cyan-400">
                            {module}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </div>
            <p className="mt-6 text-sm text-muted-foreground">
              Designed for traders preparing to trade with institutional discipline, prop desk precision, and automated execution workflows.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  )
}