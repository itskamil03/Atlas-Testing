import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { ShieldCheck, Sparkles, TrendingUp, Zap, BarChart2, Database } from 'lucide-react'
import { ReactNode } from 'react'

export default function Features() {
    return (
        <section id="features" className="bg-white py-16 md:py-32 dark:bg-black">
            <div className="@container mx-auto max-w-5xl px-6">
                <div className="text-center">
                    <h2 className="text-black text-4xl font-semibold lg:text-5xl dark:text-emerald-300">What ATLAS Does</h2>
                    <p className="mt-4 text-zinc-600 dark:text-emerald-200">
                        A next-generation algorithmic trading platform for Forex, Crypto, and Indices. We combine quantitative models, AI-driven signals, and automated execution.
                    </p>
                </div>
                <div className="@min-4xl:max-w-full @min-4xl:grid-cols-3 mx-auto mt-8 grid max-w-sm gap-6 *:text-center md:mt-16">
                    <Card className="group shadow-zinc-950/5">
                        <CardHeader className="pb-3">
                            <CardDecorator>
                                <Zap
                                    className="size-6"
                                    aria-hidden
                                />
                            </CardDecorator>

                            <h3 className="mt-6 font-medium">Algorithmic Trading Engine</h3>
                        </CardHeader>

                        <CardContent>
                            <p className="text-sm">Automated execution algorithms designed to identify and act on high-probability opportunities across global markets.</p>
                        </CardContent>
                    </Card>

                    <Card className="group shadow-zinc-950/5">
                        <CardHeader className="pb-3">
                            <CardDecorator>
                                <Sparkles
                                    className="size-6"
                                    aria-hidden
                                />
                            </CardDecorator>

                            <h3 className="mt-6 font-medium">Forex Intelligence Suite</h3>
                        </CardHeader>

                        <CardContent>
                            <p className="mt-3 text-sm">AI-driven currency market signals, macro analysis, and volatility-aware strategies built for FX traders.</p>
                        </CardContent>
                    </Card>

                    <Card className="group shadow-zinc-950/5">
                        <CardHeader className="pb-3">
                            <CardDecorator>
                                <TrendingUp
                                    className="size-6"
                                    aria-hidden
                                />
                            </CardDecorator>

                            <h3 className="mt-6 font-medium">Crypto Quant Engine</h3>
                        </CardHeader>

                        <CardContent>
                            <p className="mt-3 text-sm">Quantitative crypto strategies with momentum, mean-reversion, and risk-managed execution for digital asset markets.</p>
                        </CardContent>
                    </Card>

                    <Card className="group shadow-zinc-950/5">
                        <CardHeader className="pb-3">
                            <CardDecorator>
                                <ShieldCheck
                                    className="size-6"
                                    aria-hidden
                                />
                            </CardDecorator>

                            <h3 className="mt-6 font-medium">Risk Management Engine</h3>
                        </CardHeader>

                        <CardContent>
                            <p className="mt-3 text-sm">Integrated risk controls, position sizing, and drawdown management to protect capital while trading aggressively.</p>
                        </CardContent>
                    </Card>

                    <Card className="group shadow-zinc-950/5">
                        <CardHeader className="pb-3">
                            <CardDecorator>
                                <BarChart2
                                    className="size-6"
                                    aria-hidden
                                />
                            </CardDecorator>

                            <h3 className="mt-6 font-medium">Portfolio & Performance Dashboard</h3>
                        </CardHeader>

                        <CardContent>
                            <p className="mt-3 text-sm">Track trading performance, risk metrics, and portfolio allocations with intuitive analytics designed for professional traders.</p>
                        </CardContent>
                    </Card>

                    <Card className="group shadow-zinc-950/5">
                        <CardHeader className="pb-3">
                            <CardDecorator>
                                <Database
                                    className="size-6"
                                    aria-hidden
                                />
                            </CardDecorator>

                            <h3 className="mt-6 font-medium">Advanced Backtesting Suite</h3>
                        </CardHeader>

                        <CardContent>
                            <p className="mt-3 text-sm">Historical data analysis, Monte Carlo simulations, and strategy optimization for professional traders and institutions.</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </section>
    )
}

const CardDecorator = ({ children }: { children: ReactNode }) => (
    <div className="mask-radial-from-40% mask-radial-to-60% relative mx-auto size-36 duration-200 [--color-border:color-mix(in_oklab,var(--color-zinc-950)10%,transparent)] group-hover:[--color-border:color-mix(in_oklab,var(--color-zinc-950)20%,transparent)] dark:[--color-border:color-mix(in_oklab,var(--color-white)15%,transparent)] dark:group-hover:[--color-border:color-mix(in_oklab,var(--color-white)20%,transparent)]">
        <div
            aria-hidden
            className="absolute inset-0 bg-[linear-gradient(to_right,var(--color-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-border)_1px,transparent_1px)] bg-size-[24px_24px] dark:opacity-50"
        />

        <div className="bg-background absolute inset-0 m-auto flex size-12 items-center justify-center border-l border-t">{children}</div>
    </div>
)
