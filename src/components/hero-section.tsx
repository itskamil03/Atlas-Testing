import React from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TextEffect } from '@/components/ui/text-effect'
import { AnimatedGroup } from '@/components/ui/animated-group'
import LivePriceTicker from '@/components/live-price-ticker'
import LineWaves from './LineWaves'

const navPages = [
    {
        title: 'Features',
        href: '/features',
        description: 'Explore the trading engine, analytics, risk controls, and backtesting suite.',
    },
    {
        title: 'Services',
        href: '/services',
        description: 'See our algo trading, AI signals, custom builds, and academy offerings.',
    },
    {
        title: 'Academy',
        href: '/academy',
        description: 'Learn structured trading, automation workflows, and risk management.',
    },
    {
        title: 'About',
        href: '/about',
        description: 'Understand who ATLAS is and how we approach trading technology.',
    },
    {
        title: 'Contact',
        href: '/contact',
        description: 'Reach support and business teams for help or partnerships.',
    },
    {
        title: 'Pricing',
        href: '/pricing',
        description: 'Review the current and upcoming plans for your trading workflow.',
    },
]

const transitionVariants = {
    item: {
        hidden: {
            opacity: 0,
            filter: 'blur(12px)',
            y: 12,
        },
        visible: {
            opacity: 1,
            filter: 'blur(0px)',
            y: 0,
            transition: {
                type: 'spring',
                bounce: 0.3,
                duration: 1.5,
            },
        },
    },
}

export default function HeroSection() {
    return (
        <>
           <div className="pt-4 ">
                <LivePriceTicker />
                 </div>
            <section className="relative overflow-hidden bg-black">
                <section className="h-auto min-h-0">
                    <div className="relative isolate pt-8 md:pt-16">
                        <div
                            aria-hidden
                            className="absolute inset-0 -z-10 size-full [background:radial-gradient(125%_125%_at_50%_100%,transparent_0%,#000000_75%)]"
                        />

                        <LineWaves
                            speed={0.28}
                            innerLineCount={12}
                            outerLineCount={14}
                            warpIntensity={1}
                            rotation={-45}
                            edgeFadeWidth={0.2}
                            colorCycleSpeed={1}
                            brightness={0.56}
                            color1="#FFD60A"
                            color2="#FFC300"
                            color3="#1A1A1A"
                            enableMouseInteraction
                            mouseInfluence={2}
                            className="opacity-90"
                        />

                        <div className="relative z-10 mx-auto max-w-7xl px-6">
                            <div className="text-center sm:mx-auto lg:mr-auto lg:mt-0">
                                <div className="scale-95 md:scale-90 origin-top">
                                    <AnimatedGroup variants={transitionVariants}>
                                        <Link
                                            href="#link"
                                            className="hover:bg-black group mx-auto flex w-fit items-center gap-4 rounded-full border border-yellow-400/30 bg-black p-1 pl-4 shadow-md shadow-yellow-400/10 transition-colors duration-300">
                                            <span className="text-yellow-400 text-xs">🚀 Now Live: AI-Powered Algo Trading for Forex & Crypto</span>
                                            <span className="block h-4 w-0.5 border-l border-yellow-400/40"></span>

                                            <div className="bg-black group-hover:bg-yellow-400/10 size-6 overflow-hidden rounded-full duration-500">
                                                <div className="flex w-12 -translate-x-1/2 duration-500 ease-in-out group-hover:translate-x-0">
                                                    <span className="flex size-6">
                                                        <ArrowRight className="m-auto size-3 text-yellow-400" />
                                                    </span>
                                                    <span className="flex size-6">
                                                        <ArrowRight className="m-auto size-3 text-yellow-400" />
                                                    </span>
                                                </div>
                                            </div>
                                        </Link>
                                    </AnimatedGroup>

                                    <TextEffect
                                        preset="fade-in-blur"
                                        speedSegment={0.3}
                                        as="h1"
                                        className="mx-auto mt-8 max-w-4xl text-balance text-4xl max-md:font-semibold md:text-6xl lg:mt-16 xl:text-[4.25rem] text-white">
                                        Institutional-Style Market Research For Modern Traders
                                    </TextEffect>
                                    <TextEffect
                                        per="line"
                                        preset="fade-in-blur"
                                        speedSegment={0.3}
                                        delay={0.5}
                                        as="p"
                                        className="mx-auto mt-8 max-w-2xl text-balance text-base text-yellow-100/80">
                                       "Gold, Forex, Macro & Market Intelligence by ATLAS Research Desk"
                                    </TextEffect>

                                    <AnimatedGroup
                                        variants={{
                                            container: {
                                                visible: {
                                                    transition: {
                                                        staggerChildren: 0.05,
                                                        delayChildren: 0.75,
                                                    },
                                                },
                                            },
                                            ...transitionVariants,
                                        }}
                                        className="mt-12 flex flex-col items-center justify-center gap-2 md:flex-row">
                                        <div
                                            key={1}
                                            className="bg-yellow-400/10 rounded-[calc(var(--radius-xl)+0.125rem)] border border-yellow-400/30 p-0.5">
                                            <Button
                                                asChild
                                                size="lg"
                                                className="rounded-xl px-5 text-sm bg-yellow-400 text-black hover:bg-yellow-300">
                                                    <Link href="/pricing">
                                                    <span className="text-nowrap">Start Trading Now</span>
                                                </Link>
                                            </Button>
                                        </div>
                                    </AnimatedGroup>
                                </div>

                                <div className="mx-auto mt-20 md:mt-24 max-w-6xl">
                                    <div className="mb-6 text-center">
                                        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-yellow-400">Pages</p>
                                        <h2 className="mt-3 text-xl font-semibold md:text-2xl text-white">Open any page directly</h2>
                                        <p className="mx-auto mt-3 max-w-2xl text-sm text-gray-400 md:text-base">
                                            Each card takes you to a dedicated page for that section of the site.
                                        </p>
                                    </div>

                                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mt-8">
                                        {navPages.map((item) => (
                                            <Link
                                                key={item.title}
                                                href={item.href}
                                                className="group rounded-3xl border border-yellow-400/15 bg-black/80 p-5 text-left shadow-sm shadow-yellow-400/5 transition duration-300 hover:-translate-y-1 hover:border-yellow-400/50 hover:shadow-lg hover:shadow-yellow-400/10">
                                                <div className="flex items-center justify-between gap-4">
                                                    <h3 className="text-base font-semibold text-white">{item.title}</h3>
                                                    <ArrowRight className="size-4 text-gray-500 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-yellow-400" />
                                                </div>
                                                <p className="mt-3 text-sm leading-6 text-gray-400">{item.description}</p>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </section>
        </>
    )
}