'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Link2,
  Cpu,
  Zap,
  ArrowRight,
  Shield,
  Activity,
  CheckCircle2,
  Layers,
  BarChart3,
  Terminal,
  Server,
  Sparkles,
  TrendingUp,
  RefreshCw,
  Sliders
} from 'lucide-react';

const steps = [
  {
    number: '01',
    phase: 'CONNECT',
    title: 'Connect',
    tagline: 'Stream & Synthesize',
    description: 'Connect your market data and trading environment.',
    details: [
      'Multi-asset WebSocket & FIX protocol feeds',
      'Direct liquidity pool and broker API integration',
      'Ultra-low latency data packet synchronization'
    ],
    accentColor: '#8b5cf6',
    accentGradient: 'from-violet-500/20 via-purple-500/10 to-transparent',
    icon: Link2,
    stats: { label: 'Ingestion Latency', value: '3.8ms', status: 'Optimal' }
  },
  {
    number: '02',
    phase: 'ANALYZE',
    title: 'Analyze',
    tagline: 'Neural Quant Computation',
    description: 'ATLAS processes market data using AI, technical analysis and quantitative insights.',
    details: [
      'Multi-timeframe tensor trend extraction',
      'Order-flow sweep and institutional iceberg detection',
      'Continuous Monte Carlo probability modeling'
    ],
    accentColor: '#d946ef',
    accentGradient: 'from-fuchsia-500/20 via-pink-500/10 to-transparent',
    icon: Cpu,
    stats: { label: 'Model Conviction', value: '96.4%', status: 'High' }
  },
  {
    number: '03',
    phase: 'EXECUTE',
    title: 'Execute',
    tagline: 'Precision Action & Protection',
    description: 'Use the insights to plan, manage and execute your trades.',
    details: [
      'Sub-millisecond smart order routing',
      'Dynamic take-profit & trailing stop-loss brackets',
      'Automated drawdown guardrails & capital protection'
    ],
    accentColor: '#34d399',
    accentGradient: 'from-emerald-500/20 via-teal-500/10 to-transparent',
    icon: Zap,
    stats: { label: 'Routing Speed', value: '5.2ms', status: 'Guaranteed' }
  }
];

export default function AboutUs() {
  const [activeStep, setActiveStep] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);
  const [livePackets, setLivePackets] = useState(14280);
  const [confidenceRate, setConfidenceRate] = useState(96.4);

  // Live ticking simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setLivePackets((prev) => prev + Math.floor(Math.random() * 8 + 2));
      setConfidenceRate((prev) => {
        const delta = (Math.random() - 0.5) * 0.4;
        return Number(Math.max(94.5, Math.min(99.2, prev + delta)).toFixed(1));
      });
    }, 2400);
    return () => clearInterval(interval);
  }, []);

  // Auto progression across steps if user is not actively clicking
  useEffect(() => {
    if (!autoPlay) return;
    const timer = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [autoPlay]);

  return (
    <section
      id="about"
      className="relative overflow-hidden bg-[#07030f] pt-8 pb-20 text-white md:pt-12 md:pb-28"
      onMouseEnter={() => setAutoPlay(false)}
      onMouseLeave={() => setAutoPlay(true)}
    >
      {/* Ambient background aura & grid */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 h-[500px] w-[800px] rounded-full bg-gradient-to-tr from-purple-900/20 via-fuchsia-900/15 to-transparent blur-[140px]" />
        <div className="absolute -left-40 top-1/2 h-[400px] w-[400px] rounded-full bg-indigo-900/15 blur-[120px]" />
        <div className="absolute -right-40 bottom-10 h-[400px] w-[400px] rounded-full bg-emerald-900/10 blur-[120px]" />
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '48px 48px'
          }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-purple-300 backdrop-blur-md"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            How ATLAS Works
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mt-6 text-3xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl font-['Bodoni_Moda',serif]"
          >
            <span className="text-white">Analyze. </span>
            <span className="bg-gradient-to-r from-purple-400 via-fuchsia-300 to-indigo-300 bg-clip-text text-transparent">
              Understand.
            </span>
            <span className="text-white"> Execute.</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-5 text-base leading-relaxed text-slate-300 sm:text-lg lg:text-xl font-['Inter',sans-serif]"
          >
            ATLAS turns complex market data into clear, actionable insights—helping
            traders make faster, more informed decisions.
          </motion.p>
        </div>

        {/* Step Selector Navigation Tabs */}
        <div className="mt-12 flex justify-center">
          <div className="inline-flex rounded-2xl border border-purple-500/20 bg-[#120a28]/80 p-1.5 backdrop-blur-xl">
            {steps.map((step, idx) => {
              const IconComponent = step.icon;
              const isActive = activeStep === idx;
              return (
                <button
                  key={step.number}
                  onClick={() => {
                    setActiveStep(idx);
                    setAutoPlay(false);
                  }}
                  className={`relative flex items-center gap-2.5 rounded-xl px-4 py-2.5 text-xs font-semibold transition-all duration-300 sm:px-6 sm:text-sm ${
                    isActive
                      ? 'text-white shadow-lg'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeStepIndicator"
                      className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-600 shadow-lg shadow-purple-600/30"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-2">
                    <IconComponent className="h-4 w-4" />
                    <span>{step.number} — {step.title}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3-Stage Interactive Process Grid */}
        <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
          {steps.map((step, idx) => {
            const IconComponent = step.icon;
            const isCurrent = activeStep === idx;

            return (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.15 }}
                onClick={() => {
                  setActiveStep(idx);
                  setAutoPlay(false);
                }}
                className={`group relative flex flex-col justify-between overflow-hidden rounded-3xl border transition-all duration-300 cursor-pointer ${
                  isCurrent
                    ? 'border-purple-500/60 bg-gradient-to-b from-[#190e38] to-[#0d0720] shadow-2xl shadow-purple-950/60 ring-1 ring-purple-500/40'
                    : 'border-purple-900/30 bg-[#120a26]/60 hover:border-purple-500/40 hover:bg-[#160d30]/80'
                }`}
              >
                {/* Accent top glowing bar */}
                <div
                  className={`h-1.5 w-full transition-opacity duration-300 ${
                    isCurrent ? 'opacity-100' : 'opacity-20 group-hover:opacity-60'
                  }`}
                  style={{
                    background: `linear-gradient(90deg, ${step.accentColor}, transparent)`
                  }}
                />

                <div className="p-6 sm:p-8">
                  {/* Step Header & Badge */}
                  <div className="flex items-center justify-between">
                    <span
                      className="font-mono text-2xl font-bold tracking-tight sm:text-3xl"
                      style={{ color: step.accentColor }}
                    >
                      {step.number}
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-slate-300">
                      <IconComponent className="h-3.5 w-3.5" style={{ color: step.accentColor }} />
                      {step.phase}
                    </span>
                  </div>

                  {/* Title & Tagline */}
                  <h3 className="mt-5 text-2xl font-bold tracking-tight text-white sm:text-3xl">
                    {step.title}
                  </h3>
                  <p
                    className="mt-1 text-xs font-semibold uppercase tracking-wider"
                    style={{ color: step.accentColor }}
                  >
                    {step.tagline}
                  </p>

                  {/* Core Description (User Requested Exact Text) */}
                  <p className="mt-4 text-sm leading-relaxed text-slate-300 sm:text-base">
                    {step.description}
                  </p>

                  {/* Interactive Dynamic Visual Preview Card */}
                  <div className="mt-6 rounded-2xl border border-white/10 bg-black/40 p-4 font-mono text-xs shadow-inner">
                    {idx === 0 && (
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between text-slate-400 border-b border-white/5 pb-2">
                          <span className="flex items-center gap-1.5">
                            <Activity className="h-3.5 w-3.5 text-violet-400 animate-pulse" />
                            Feed Ingested
                          </span>
                          <span className="text-violet-300 font-semibold">{livePackets.toLocaleString()} msg/s</span>
                        </div>
                        <div className="flex items-center justify-between text-slate-400">
                          <span>ECN Gateway</span>
                          <span className="text-emerald-400 font-medium">FIX 4.4 Connected</span>
                        </div>
                        <div className="flex items-center justify-between text-slate-400">
                          <span>Feed Latency</span>
                          <span className="text-emerald-400 font-medium">3.8ms</span>
                        </div>
                      </div>
                    )}

                    {idx === 1 && (
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between text-slate-400 border-b border-white/5 pb-2">
                          <span className="flex items-center gap-1.5">
                            <Sparkles className="h-3.5 w-3.5 text-fuchsia-400 animate-pulse" />
                            Tensor Inference
                          </span>
                          <span className="text-fuchsia-300 font-semibold">{confidenceRate}% Conviction</span>
                        </div>
                        <div className="flex items-center justify-between text-slate-400">
                          <span>Pattern State</span>
                          <span className="text-cyan-300 font-medium">Bullish Accumulation</span>
                        </div>
                        <div className="flex items-center justify-between text-slate-400">
                          <span>Risk Assessment</span>
                          <span className="text-emerald-400 font-medium">Optimal 1:3.2 R:R</span>
                        </div>
                      </div>
                    )}

                    {idx === 2 && (
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between text-slate-400 border-b border-white/5 pb-2">
                          <span className="flex items-center gap-1.5">
                            <Zap className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
                            Smart Dispatch
                          </span>
                          <span className="text-emerald-300 font-semibold">Sub-10ms Route</span>
                        </div>
                        <div className="flex items-center justify-between text-slate-400">
                          <span>Bracket Trigger</span>
                          <span className="text-emerald-400 font-medium">TP + SL Active</span>
                        </div>
                        <div className="flex items-center justify-between text-slate-400">
                          <span>Drawdown Shield</span>
                          <span className="text-emerald-400 font-medium">Locked 1.5% Max</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Bullet details */}
                  <ul className="mt-6 space-y-2.5">
                    {step.details.map((detail, dIdx) => (
                      <li key={dIdx} className="flex items-start gap-2.5 text-xs text-slate-300 sm:text-sm">
                        <CheckCircle2
                          className="mt-0.5 h-4 w-4 shrink-0"
                          style={{ color: step.accentColor }}
                        />
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Footer Metric Strip */}
                <div className="border-t border-white/10 bg-black/25 px-6 py-3.5 sm:px-8">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-medium">{step.stats.label}</span>
                    <span className="font-mono font-bold" style={{ color: step.accentColor }}>
                      {step.stats.value}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Live System Architecture Banner */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-14 overflow-hidden rounded-3xl border border-purple-500/30 bg-gradient-to-r from-[#170c36] via-[#12082b] to-[#180d38] p-6 sm:p-10 shadow-2xl backdrop-blur-xl"
        >
          <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-purple-400">
                <Terminal className="h-4 w-4" />
                <span>Synchronized Algorithmic Pipeline</span>
              </div>
              <h3 className="mt-3 text-2xl font-bold text-white sm:text-3xl font-['Bodoni_Moda',serif]">
                Built for institutional-grade speed, transparency &amp; reliability
              </h3>
              <p className="mt-3 text-sm text-slate-300 sm:text-base leading-relaxed">
                From raw tick data ingestion to quantitative model analysis and automated risk-managed execution,
                ATLAS gives traders the decisive edge in high-volatility global markets.
              </p>

              {/* Quick telemetry pills */}
              <div className="mt-6 flex flex-wrap gap-3">
                <div className="inline-flex items-center gap-2 rounded-xl border border-purple-500/20 bg-purple-500/10 px-3.5 py-1.5 text-xs text-purple-200">
                  <Server className="h-3.5 w-3.5 text-purple-400" />
                  <span>2.4M+ Daily Signals</span>
                </div>
                <div className="inline-flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3.5 py-1.5 text-xs text-emerald-200">
                  <Shield className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Integrated Risk Armor</span>
                </div>
                <div className="inline-flex items-center gap-2 rounded-xl border border-fuchsia-500/20 bg-fuchsia-500/10 px-3.5 py-1.5 text-xs text-fuchsia-200">
                  <TrendingUp className="h-3.5 w-3.5 text-fuchsia-400" />
                  <span>Forex • Crypto • Equities</span>
                </div>
              </div>
            </div>

            {/* CTA action buttons */}
            <div className="flex flex-col gap-3.5 sm:flex-row lg:col-span-4 lg:flex-col lg:justify-center">
              <Link
                href="/engine"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 via-fuchsia-600 to-indigo-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-purple-600/30 transition-all duration-200 hover:opacity-95 active:scale-[0.98]"
              >
                <span>See The Engine Think</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/pricing"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-purple-500/30 bg-white/5 px-6 py-3.5 text-sm font-semibold text-slate-200 backdrop-blur transition-all duration-200 hover:bg-white/10 hover:text-white"
              >
                <span>Start Trading Now</span>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}