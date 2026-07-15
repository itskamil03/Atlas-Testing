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

  const features = [
    {
      title: 'Automated Execution Algorithms',
      description: 'Designed to identify and act on high-probability opportunities across global markets.',
      icon: Zap,
      gradient: 'from-blue-400/20 to-cyan-400/10'
    },
    {
      title: 'Forex Intelligence Suite',
      description: 'AI-driven currency market signals, macro analysis, and volatility-aware strategies built for FX traders.',
      icon: TrendingUp,
      gradient: 'from-emerald-400/20 to-teal-400/10'
    },
    {
      title: 'Crypto Quant Engine',
      description: 'Quantitative crypto strategies with momentum, mean-reversion, and risk-managed execution for digital asset markets.',
      icon: Code,
      gradient: 'from-purple-400/20 to-pink-400/10'
    },
    {
      title: 'Risk Management Engine',
      description: 'Integrated risk controls, position sizing, and drawdown management to protect capital while trading aggressively.',
      icon: Shield,
      gradient: 'from-orange-400/20 to-red-400/10'
    },
    {
      title: 'Portfolio & Performance Dashboard',
      description: 'Track trading performance, risk metrics, and portfolio allocations with intuitive analytics designed for professional traders.',
      icon: TrendingUp,
      gradient: 'from-indigo-400/20 to-blue-400/10'
    },
  ]

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
          className="mb-12 text-center"
        >
          <motion.p className="text-xs font-semibold uppercase tracking-widest text-cyan-600 dark:text-cyan-400">
            ATLAS Academy
          </motion.p>
          <h2 className="mt-3 text-4xl font-bold sm:text-5xl lg:text-6xl">Master Trading Program</h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Institutional-grade learning designed for traders and quantitative strategists seeking disciplined execution across global markets.
          </p>
        </motion.div>

        {/* Two Column: Description + Modules */}
        <div className="grid gap-8 lg:grid-cols-3 lg:gap-10 mb-20">
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

        {/* Features Grid */}
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={containerVariants}>
          <h3 className="mb-8 text-3xl font-bold">Platform Capabilities</h3>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => {
              const IconComponent = feature.icon
              const colorClasses = [
                'dark:from-blue-900/30 dark:to-cyan-900/30',
                'dark:from-emerald-900/30 dark:to-teal-900/30',
                'dark:from-purple-900/30 dark:to-pink-900/30',
                'dark:from-orange-900/30 dark:to-red-900/30',
                'dark:from-indigo-900/30 dark:to-blue-900/30',
              ][index]
              return (
                <motion.div
                  key={feature.title}
                  variants={fadeUp}
                  whileHover={{ y: -8, boxShadow: '0 20px 40px -5px rgba(0,0,0,0.15)' }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <Card className="group h-full overflow-hidden border bg-white/40 backdrop-blur-sm transition-all duration-200 dark:bg-slate-900/30">
                    <div
                      className={`absolute inset-0 bg-linear-to-br ${feature.gradient} ${colorClasses} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                    />
                    <CardContent className="relative p-6">
                      <div className="mb-4 inline-flex rounded-lg bg-linear-to-br from-slate-100 to-slate-50 p-3 group-hover:scale-110 transition-transform duration-200 dark:from-slate-700/50 dark:to-slate-800/50">
                        <IconComponent className="h-6 w-6 text-slate-700 dark:text-slate-300" />
                      </div>
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{feature.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors duration-200">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="mt-16 text-center"
        >
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }} transition={{ duration: 0.12 }}>
            <Button asChild size="lg" className="shadow-lg bg-[#9BFF00] hover:bg-[#B7FF45] text-[#11140D] font-semibold active:scale-95 transition-all duration-100 border-none">
              <Link href="/signup">
                Enroll Now
              </Link>
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}