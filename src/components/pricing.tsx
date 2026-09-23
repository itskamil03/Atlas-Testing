"use client"

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Check, X, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react'

export default function Pricing() {
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

    const proFeatures = [
        { text: "ATLAS trading software access", included: true },
        { text: "1 trading strategy at a time", included: true },
        { text: "Crypto + Forex market support", included: true },
        { text: "AI-powered market analysis", included: true },
        { text: "Advanced technical & market insights", included: true },
        { text: "Backtesting & strategy analysis", included: true },
        { text: "Monthly Zoom session", included: true },
        { text: "Member community access", included: true },
        { text: "ATLAS Academy access", included: false },
    ]

    const eliteFeatures = [
        { text: "Full ATLAS software access", included: true },
        { text: "All trading strategies", included: true },
        { text: "Crypto + Forex support", included: true },
        { text: "AI-powered market intelligence", included: true },
        { text: "Advanced backtesting & analysis", included: true },
        { text: "ATLAS Academy access", included: true },
        { text: "Beginner → Advanced → Pro trading education", included: true },
        { text: "Learn to build your own trading strategy", included: true },
        { text: "Weekly live Zoom sessions", included: true },
        { text: "Private ATLAS community access", included: true },
        { text: "Session updates & announcements through community", included: true },
    ]

    return (
        <section id="pricing" className="relative overflow-hidden py-16 md:py-24">
            {/* Background Ambient Glows */}
            <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
                <div 
                    className="absolute -top-32 left-1/3 h-[400px] w-[400px] rounded-full bg-purple-600/10 blur-[120px] animate-pulse"
                    style={{ animationDuration: '7s' }}
                />
                <div 
                    className="absolute -bottom-32 right-1/3 h-[400px] w-[400px] rounded-full bg-indigo-600/10 blur-[120px] animate-pulse"
                    style={{ animationDuration: '9s', animationDelay: '1.5s' }}
                />
            </div>

            <div className="mx-auto max-w-6xl px-6">
                {/* Header with animation */}
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.3 }}
                    variants={containerVariants}
                    className="mx-auto max-w-4xl space-y-4 text-center -mt-[0.4in]"
                >
                    <motion.div variants={itemVariants} className="inline-flex items-center gap-2 rounded-full border border-purple-500/20 bg-purple-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.25em] text-purple-400">
                        <Sparkles className="size-3.5 text-purple-400 animate-pulse" />
                        <span>Simple Pricing, Powerful Signals</span>
                    </motion.div>

                    <motion.h1 
                        variants={itemVariants}
                        className="text-center text-2xl font-semibold sm:text-3xl md:text-4xl lg:text-5xl whitespace-nowrap tracking-tight text-foreground"
                    >
                        Simple Pricing, Powerful Signals
                    </motion.h1>
                    
                    <motion.p variants={itemVariants} className="text-sm sm:text-base text-muted-foreground">
                        Transparent monthly plans designed to scale with your trading journey.
                    </motion.p>
                </motion.div>

                {/* Pricing Grid */}
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.15 }}
                    variants={containerVariants}
                    className="mt-10 mx-auto max-w-3xl grid gap-5 md:mt-12 md:grid-cols-2 items-stretch"
                >
                    {/* Card 1: ATLAS PRO */}
                    <motion.div
                        variants={itemVariants}
                        whileHover={{ y: -6, transition: { duration: 0.2 } }}
                        className="h-full"
                    >
                        <Card className="relative flex h-full flex-col justify-between rounded-2xl border-2 border-purple-500/60 bg-card/85 shadow-[0_0_25px_rgba(124,58,237,0.14)] backdrop-blur-md transition-all duration-300 hover:border-purple-500 hover:shadow-[0_0_35px_rgba(124,58,237,0.24)]">
                            <span className="bg-gradient-to-r from-purple-600 to-indigo-600 absolute inset-x-0 -top-3 mx-auto flex h-6 w-fit items-center gap-1.5 rounded-full px-3 py-0.5 text-xs font-semibold text-white shadow-md shadow-purple-900/40 ring-1 ring-inset ring-purple-400/40">
                                <Sparkles className="size-3" />
                                For Active Traders
                            </span>

                            <div>
                                <CardHeader className="pt-6 pb-2 px-5">
                                    <CardTitle className="font-semibold text-lg text-foreground">ATLAS PRO</CardTitle>
                                    <div className="my-1 flex items-baseline gap-1.5">
                                        <span className="text-2xl font-bold tracking-tight text-foreground">₹6,999</span>
                                        <span className="text-sm font-normal text-muted-foreground">/ month</span>
                                    </div>
                                    <CardDescription className="text-sm text-muted-foreground leading-snug">
                                        Trade with ATLAS&apos;s core trading tools and strategy engine.
                                    </CardDescription>
                                </CardHeader>

                                <CardContent className="space-y-2 pt-0 px-5">
                                    <hr className="border-dashed border-border/60 my-1" />
                                    <ul className="space-y-1.5 text-sm">
                                        {proFeatures.map((item, index) => (
                                            <motion.li 
                                                key={index}
                                                whileHover={{ x: 3 }}
                                                transition={{ duration: 0.15 }}
                                                className={`flex items-center gap-2 cursor-default ${
                                                    item.included ? 'text-slate-300' : 'text-slate-500'
                                                }`}
                                            >
                                                {item.included ? (
                                                    <div className="flex size-4.5 items-center justify-center rounded-full bg-purple-500/20 text-purple-400 shrink-0">
                                                        <Check className="size-3" />
                                                    </div>
                                                ) : (
                                                    <div className="flex size-4.5 items-center justify-center rounded-full bg-rose-500/10 text-rose-400/80 shrink-0">
                                                        <X className="size-3" />
                                                    </div>
                                                )}
                                                <span className={item.included ? '' : 'line-through opacity-70'}>{item.text}</span>
                                            </motion.li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </div>

                            <CardFooter className="pt-3 pb-5 px-5">
                                <Button
                                    asChild
                                    className="group w-full h-10 rounded-xl bg-purple-600 hover:bg-purple-700 active:scale-95 text-white font-semibold transition-all duration-200 border-none shadow-md shadow-purple-600/30">
                                    <Link href="/signup" className="flex items-center justify-center gap-2">
                                        <span>Get Pro</span>
                                        <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-1" />
                                    </Link>
                                </Button>
                            </CardFooter>
                        </Card>
                    </motion.div>

                    {/* Card 2: ATLAS ELITE */}
                    <motion.div
                        variants={itemVariants}
                        whileHover={{ y: -6, transition: { duration: 0.2 } }}
                        className="h-full"
                    >
                        <Card className="relative flex h-full flex-col justify-between rounded-2xl border border-border/80 bg-card/60 backdrop-blur-md transition-all duration-300 hover:border-slate-600 hover:shadow-xl hover:shadow-purple-950/20">
                            <span className="bg-slate-800 border border-slate-700 absolute inset-x-0 -top-3 mx-auto flex h-6 w-fit items-center gap-1.5 rounded-full px-3 py-0.5 text-xs font-semibold text-slate-200 shadow-md">
                                <ShieldCheck className="size-3 text-emerald-400" />
                                For Serious &amp; Advanced Traders
                            </span>

                            <div>
                                <CardHeader className="pt-6 pb-2 px-5">
                                    <CardTitle className="font-semibold text-lg text-foreground">ATLAS ELITE</CardTitle>
                                    <div className="my-1 flex items-baseline gap-1.5">
                                        <span className="text-2xl font-bold tracking-tight text-foreground">₹9,999</span>
                                        <span className="text-sm font-normal text-muted-foreground">/ month</span>
                                    </div>
                                    <CardDescription className="text-sm text-muted-foreground leading-snug">
                                        Unlock the complete ATLAS ecosystem and learn how to build your own trading edge.
                                    </CardDescription>
                                </CardHeader>

                                <CardContent className="space-y-2 pt-0 px-5">
                                    <hr className="border-dashed border-border/60 my-1" />
                                    <ul className="space-y-1.5 text-sm">
                                        {eliteFeatures.map((item, index) => (
                                            <motion.li 
                                                key={index}
                                                whileHover={{ x: 3 }}
                                                transition={{ duration: 0.15 }}
                                                className="flex items-center gap-2 text-slate-300 cursor-default"
                                            >
                                                <div className="flex size-4.5 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 shrink-0">
                                                    <Check className="size-3" />
                                                </div>
                                                <span>{item.text}</span>
                                            </motion.li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </div>

                            <CardFooter className="pt-3 pb-5 px-5">
                                <Button
                                    asChild
                                    className="group w-full h-10 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-white font-semibold transition-all duration-200 border border-slate-700 shadow-md">
                                    <Link href="/signup" className="flex items-center justify-center gap-2">
                                        <span>Get Elite</span>
                                        <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-1" />
                                    </Link>
                                </Button>
                            </CardFooter>
                        </Card>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    )
}