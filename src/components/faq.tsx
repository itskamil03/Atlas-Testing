"use client"

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, HelpCircle, Sparkles, MessageCircleQuestion } from 'lucide-react'

interface FAQItem {
  question: string
  answer: string
  category?: string
}

const FAQS: FAQItem[] = [
  {
    question: "What is ATLAS and how does the platform work?",
    answer: "ATLAS is an institutional-grade algorithmic trading platform combining quantitative models, AI-driven market intelligence, and automated execution infrastructure. It delivers high-probability signals for Forex and Crypto markets with precise Entry, Take-Profit (TP), and Stop-Loss (SL) parameters.",
    category: "General",
  },
  {
    question: "Do I need prior trading experience to get started?",
    answer: "No prior experience is required. Our signals come with exact entry prices, target levels, and risk calculations ready for execution. For traders looking to build their own systematic edge, our Master Trading Academy offers step-by-step education from beginner foundations to advanced quantitative strategies.",
    category: "Getting Started",
  },
  {
    question: "Which markets and asset classes are supported?",
    answer: "ATLAS supports 28+ major and minor Forex currency pairs, high-volume Cryptocurrency assets (BTC, ETH, SOL, and top altcoins), Commodities (Gold, Silver, Crude Oil), and major global Indices.",
    category: "Markets",
  },
  {
    question: "How are trading signals delivered in real time?",
    answer: "Signals and market updates are delivered instantly to your ATLAS Web Dashboard, dedicated private WhatsApp desk groups, and Telegram channels with low-latency alerts and trade management updates.",
    category: "Delivery",
  },
  {
    question: "What is the difference between ATLAS PRO and ATLAS ELITE?",
    answer: "ATLAS PRO (₹6,999/mo) provides core trading software access, single active strategy execution, AI market analysis, and monthly Zoom sessions. ATLAS ELITE (₹9,999/mo) unlocks the entire ecosystem: all strategies simultaneously, full Master Trading Academy curriculum, weekly live trading Zoom sessions, and private desk community access.",
    category: "Plans",
  },
  {
    question: "Can I connect ATLAS to my own broker or exchange?",
    answer: "Yes. ATLAS connects via secure API keys and webhook integration with top exchanges (such as Binance), MetaTrader, TradingView, and major prop trading firm accounts without ever having withdrawal access to your funds.",
    category: "Integration",
  },
  {
    question: "How is risk managed across the algorithmic strategies?",
    answer: "Every strategy and signal incorporates strict algorithmic safeguards: predefined risk-to-reward ratios (typically 1:2 or higher), dynamic stop-loss positioning, and position sizing models designed to protect capital during market volatility.",
    category: "Risk Management",
  },
]

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

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
    hidden: { opacity: 0, y: 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: 'easeOut' as const },
    },
  }

  return (
    <section id="faq" className="relative overflow-hidden pt-24 pb-16 md:pt-36 md:pb-24 mt-10 md:mt-16 border-t border-border/40">
      {/* Background Ambient Glows */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[450px] w-[600px] rounded-full bg-purple-600/10 blur-[140px] animate-pulse"
          style={{ animationDuration: '8s' }}
        />
      </div>

      <div className="mx-auto max-w-4xl px-6">
        {/* Section Header */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={containerVariants}
          className="text-center mb-12 md:mb-16"
        >
          <motion.div
            variants={itemVariants}
            className="inline-flex items-center gap-2 rounded-full border border-purple-500/20 bg-purple-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.25em] text-purple-400 mb-8 md:mb-10"
          >
            <Sparkles className="size-3.5 text-purple-400" />
            <span>Got Questions?</span>
          </motion.div>

          <motion.h2
            variants={itemVariants}
            className="text-3xl font-semibold sm:text-4xl lg:text-5xl text-foreground tracking-tight"
          >
            Frequently Asked Questions
          </motion.h2>

          <motion.p
            variants={itemVariants}
            className="mx-auto mt-4 max-w-2xl text-sm sm:text-base text-muted-foreground"
          >
            Everything you need to know about ATLAS algorithms, signal delivery, subscriptions, and integrations.
          </motion.p>
        </motion.div>

        {/* FAQ Accordion List */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          variants={containerVariants}
          className="space-y-3.5"
        >
          {FAQS.map((faq, index) => {
            const isOpen = openIndex === index
            return (
              <motion.div
                key={index}
                variants={itemVariants}
                className="overflow-hidden rounded-2xl border border-border/80 bg-card/75 backdrop-blur-md transition-colors duration-200 hover:border-purple-500/40"
              >
                <button
                  type="button"
                  onClick={() => toggleFAQ(index)}
                  className="flex w-full items-center justify-between gap-4 p-5 text-left transition-colors duration-150 focus:outline-none"
                  aria-expanded={isOpen}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className={`flex size-8 shrink-0 items-center justify-center rounded-xl transition-colors duration-200 ${
                      isOpen ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30' : 'bg-muted/60 text-muted-foreground'
                    }`}>
                      <HelpCircle className="size-4" />
                    </div>
                    <span className="text-sm sm:text-base font-semibold text-foreground">
                      {faq.question}
                    </span>
                  </div>

                  <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.25, ease: 'easeInOut' }}
                    className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted/40 text-muted-foreground"
                  >
                    <ChevronDown className="size-4" />
                  </motion.div>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      key="content"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <div className="px-5 pb-5 pt-1 border-t border-border/40">
                        <p className="text-sm text-muted-foreground leading-relaxed pl-11">
                          {faq.answer}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </motion.div>

        {/* Still Have Questions CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-12 rounded-2xl border border-purple-500/20 bg-purple-500/5 p-6 text-center"
        >
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left">
              <h3 className="text-base font-semibold text-foreground">Have a specific question?</h3>
              <p className="text-sm text-muted-foreground mt-0.5">
                Our support team is available 24/7 to answer your inquiries and assist with setup.
              </p>
            </div>
            <a
              href="mailto:support@atlusindia.com"
              className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-purple-600 hover:bg-purple-700 active:scale-95 text-white text-sm font-semibold px-5 py-2.5 transition-all shadow-md shadow-purple-600/25"
            >
              <MessageCircleQuestion className="size-4" />
              <span>Ask Our Team</span>
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
