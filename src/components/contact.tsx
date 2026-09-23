"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, Headphones, Briefcase, ArrowUpRight, Check, Copy, Sparkles } from 'lucide-react'

export default function ContactSection() {
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null)

  const copyToClipboard = (email: string) => {
    navigator.clipboard.writeText(email)
    setCopiedEmail(email)
    setTimeout(() => setCopiedEmail(null), 2000)
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut' as const },
    },
  }

  return (
    <section id="contact" className="relative overflow-hidden py-16 md:py-24 bg-background border-t border-border/40">
      {/* Background Ambient Glows */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div 
          className="absolute -top-32 left-1/4 h-[350px] w-[350px] rounded-full bg-purple-600/10 blur-[100px] animate-pulse"
          style={{ animationDuration: '6s' }}
        />
        <div 
          className="absolute -bottom-32 right-1/4 h-[350px] w-[350px] rounded-full bg-indigo-600/10 blur-[100px] animate-pulse"
          style={{ animationDuration: '8s', animationDelay: '1s' }}
        />
      </div>

      <div className="mx-auto max-w-6xl px-6">
        {/* Section Heading */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={containerVariants}
          className="text-center"
        >
          <motion.div variants={itemVariants} className="inline-flex items-center gap-2 rounded-full border border-purple-500/20 bg-purple-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.25em] text-purple-400 mb-4">
            <Sparkles className="size-3.5 animate-spin text-purple-400" style={{ animationDuration: '8s' }} />
            <span>Direct Desk Access</span>
          </motion.div>

          <motion.h2 variants={itemVariants} className="text-3xl font-semibold sm:text-4xl lg:text-5xl text-foreground tracking-tight">
            Get in Touch with ATLAS
          </motion.h2>

          <motion.p variants={itemVariants} className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground">
            For technical support, business inquiries, institutional partnerships, and prop desk integrations, reach out directly to our team.
          </motion.p>
        </motion.div>

        {/* Contact Cards Grid */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={containerVariants}
          className="mt-12 grid gap-6 md:grid-cols-2"
        >
          {/* Card 1: Support Desk */}
          <motion.div
            variants={itemVariants}
            whileHover={{ y: -6, transition: { duration: 0.2 } }}
            className="group relative flex flex-col justify-between rounded-3xl border border-border/80 bg-card/70 p-8 shadow-lg shadow-black/20 backdrop-blur-md transition-all duration-300 hover:border-purple-500/50 hover:shadow-[0_0_35px_rgba(124,58,237,0.18)]"
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="flex size-12 items-center justify-center rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 shadow-inner group-hover:scale-110 transition-transform duration-300">
                  <Headphones className="size-6" />
                </div>
                <span className="text-xs font-medium text-purple-400/90 bg-purple-500/10 border border-purple-500/20 px-3 py-1 rounded-full">
                  Response within 2 hrs
                </span>
              </div>

              <h3 className="mt-6 text-xl font-semibold text-foreground">Trader & Technical Support</h3>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                For algorithm configuration, webhook setup, signal delivery troubleshooting, and account inquiries.
              </p>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a
                href="mailto:support@atlusindia.com"
                className="group/btn inline-flex items-center gap-2 rounded-xl bg-purple-600 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-purple-600/25 transition-all duration-200 hover:bg-purple-700 active:scale-95"
              >
                <Mail className="size-4" />
                <span>support@atlusindia.com</span>
                <ArrowUpRight className="size-4 transition-transform duration-200 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
              </a>

              <button
                type="button"
                onClick={() => copyToClipboard('support@atlusindia.com')}
                aria-label="Copy email address"
                className="inline-flex size-11 items-center justify-center rounded-xl border border-border/80 bg-muted/40 text-muted-foreground transition-all duration-200 hover:border-border hover:bg-muted/80 hover:text-foreground active:scale-95"
                title="Copy email to clipboard"
              >
                {copiedEmail === 'support@atlusindia.com' ? (
                  <Check className="size-4 text-emerald-400" />
                ) : (
                  <Copy className="size-4" />
                )}
              </button>
            </div>
          </motion.div>

          {/* Card 2: Business & Institutional Desk */}
          <motion.div
            variants={itemVariants}
            whileHover={{ y: -6, transition: { duration: 0.2 } }}
            className="group relative flex flex-col justify-between rounded-3xl border border-border/80 bg-card/70 p-8 shadow-lg shadow-black/20 backdrop-blur-md transition-all duration-300 hover:border-indigo-500/50 hover:shadow-[0_0_35px_rgba(99,102,241,0.18)]"
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="flex size-12 items-center justify-center rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 shadow-inner group-hover:scale-110 transition-transform duration-300">
                  <Briefcase className="size-6" />
                </div>
                <span className="text-xs font-medium text-indigo-400/90 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full">
                  Institutional / Desk
                </span>
              </div>

              <h3 className="mt-6 text-xl font-semibold text-foreground">Business & Partnerships</h3>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                For proprietary trading desk allocation, institutional licensing, custom algo development, and API access.
              </p>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a
                href="mailto:business@atlusindia.com"
                className="group/btn inline-flex items-center gap-2 rounded-xl bg-slate-800 border border-slate-700 px-5 py-3 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:bg-slate-700 active:scale-95"
              >
                <Mail className="size-4 text-indigo-400" />
                <span>business@atlusindia.com</span>
                <ArrowUpRight className="size-4 transition-transform duration-200 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
              </a>

              <button
                type="button"
                onClick={() => copyToClipboard('business@atlusindia.com')}
                aria-label="Copy business email address"
                className="inline-flex size-11 items-center justify-center rounded-xl border border-border/80 bg-muted/40 text-muted-foreground transition-all duration-200 hover:border-border hover:bg-muted/80 hover:text-foreground active:scale-95"
                title="Copy business email to clipboard"
              >
                {copiedEmail === 'business@atlusindia.com' ? (
                  <Check className="size-4 text-emerald-400" />
                ) : (
                  <Copy className="size-4" />
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}