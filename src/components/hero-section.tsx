import React from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TextEffect } from '@/components/ui/text-effect'
import { AnimatedGroup } from '@/components/ui/animated-group'
import LivePriceTicker from '@/components/live-price-ticker'

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
            <div className="pt-4 md:pt-6">
                <LivePriceTicker />
            </div>
            <main className="overflow-hidden">
                <div
                    aria-hidden
                    className="absolute inset-0 isolate hidden opacity-65 contain-strict lg:block">
                    <div className="w-140 h-320 -translate-y-87.5 absolute left-0 top-0 -rotate-45 rounded-full bg-[radial-gradient(68.54%_68.72%_at_55.02%_31.46%,hsla(0,0%,85%,.08)_0,hsla(0,0%,55%,.02)_50%,hsla(0,0%,45%,0)_80%)]" />
                    <div className="h-320 absolute left-0 top-0 w-60 -rotate-45 rounded-full bg-[radial-gradient(50%_50%_at_50%_50%,hsla(0,0%,85%,.06)_0,hsla(0,0%,45%,.02)_80%,transparent_100%)] [translate:5%_-50%]" />
                    <div className="h-320 -translate-y-87.5 absolute left-0 top-0 w-60 -rotate-45 bg-[radial-gradient(50%_50%_at_50%_50%,hsla(0,0%,85%,.04)_0,hsla(0,0%,45%,.02)_80%,transparent_100%)]" />
                </div>
                <section>
                    <div className="relative pt-2 md:pt-4">
                        <div
                            aria-hidden
                            className="absolute inset-0 -z-10 size-full [background:radial-gradient(125%_125%_at_50%_100%,transparent_0%,var(--color-background)_75%)]"
                        />

                        <div className="mx-auto max-w-7xl px-6">
                            <div className="text-center sm:mx-auto lg:mr-auto lg:mt-0">
                                <AnimatedGroup variants={transitionVariants}>
                                    <Link
                                        href="#link"
                                        className="hover:bg-background dark:hover:border-t-border bg-muted group mx-auto flex w-fit items-center gap-4 rounded-full border p-1 pl-4 shadow-md shadow-zinc-950/5 transition-colors duration-300 dark:border-t-white/5 dark:shadow-zinc-950">
                                        <span className="text-foreground text-sm">🚀 Now Live: AI-Powered Algo Trading for Forex & Crypto</span>
                                        <span className="dark:border-background block h-4 w-0.5 border-l bg-white dark:bg-zinc-700"></span>

                                        <div className="bg-background group-hover:bg-muted size-6 overflow-hidden rounded-full duration-500">
                                            <div className="flex w-12 -translate-x-1/2 duration-500 ease-in-out group-hover:translate-x-0">
                                                <span className="flex size-6">
                                                    <ArrowRight className="m-auto size-3" />
                                                </span>
                                                <span className="flex size-6">
                                                    <ArrowRight className="m-auto size-3" />
                                                </span>
                                            </div>
                                        </div>
                                    </Link>
                                </AnimatedGroup>

                                <TextEffect
                                    preset="fade-in-blur"
                                    speedSegment={0.3}
                                    as="h1"
                                    className="mx-auto mt-8 max-w-4xl text-balance text-5xl max-md:font-semibold md:text-7xl lg:mt-16 xl:text-[5.25rem]">
                                    AI-Powered Algo Trading for Forex & Crypto Precision, Speed & Consistency
                                </TextEffect>
                                <TextEffect
                                    per="line"
                                    preset="fade-in-blur"
                                    speedSegment={0.3}
                                    delay={0.5}
                                    as="p"
                                    className="mx-auto mt-8 max-w-2xl text-balance text-lg">
                                    ATLAS delivers institutional-grade automation, prop desk precision, predictive analytics, and execution algorithms designed for traders who demand accuracy and consistent performance in global markets.
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
                                        className="bg-foreground/10 rounded-[calc(var(--radius-xl)+0.125rem)] border p-0.5">
                                        <Button
                                            asChild
                                            size="lg"
                                            className="rounded-xl px-5 text-base">
                                                <Link href="/pricing">
                                                <span className="text-nowrap">Start Trading Now</span>
                                            </Link>
                                        </Button>
                                    </div>
                                </AnimatedGroup>

                                    <div className="mx-auto mt-14 max-w-6xl">
                                        <div className="mb-6 text-center">
                                            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">Pages</p>
                                            <h2 className="mt-3 text-2xl font-semibold md:text-3xl">Open any page directly</h2>
                                            <p className="mx-auto mt-3 max-w-2xl text-sm text-muted-foreground md:text-base">
                                                Each card takes you to a dedicated page for that section of the site.
                                            </p>
                                        </div>

                                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                            {navPages.map((item) => (
                                                <Link
                                                    key={item.title}
                                                    href={item.href}
                                                    className="group rounded-3xl border bg-background/80 p-5 text-left shadow-sm shadow-zinc-950/5 transition duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg dark:bg-slate-950/70">
                                                    <div className="flex items-center justify-between gap-4">
                                                        <h3 className="text-lg font-semibold text-foreground">{item.title}</h3>
                                                        <ArrowRight className="size-4 text-muted-foreground transition-transform duration-300 group-hover:translate-x-1 group-hover:text-primary" />
                                                    </div>
                                                    <p className="mt-3 text-sm leading-6 text-muted-foreground">{item.description}</p>
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </>
    )
}
