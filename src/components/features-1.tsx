import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { BellRing, ShieldCheck, Sparkles, TrendingUp, Zap, BarChart2, FileText, Building2, Newspaper } from 'lucide-react'
import { ReactNode } from 'react'

export default function Features() {
    return (
        <section id="features" className="bg-white py-16 md:py-32 dark:bg-black">
            <div className="@container mx-auto max-w-5xl px-6">
                <div className="text-center">
                    <h2 className="text-black text-4xl font-semibold lg:text-5xl dark:text-emerald-300">Everything You Need to Trade Smarter</h2>
                    <p className="mt-4 text-zinc-600 dark:text-emerald-200">AI-powered signals, instant WhatsApp alerts, and real-time market analysis all in one bot.</p>
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

                            <h3 className="mt-6 font-medium">Instant WhatsApp Alerts</h3>
                        </CardHeader>

                        <CardContent>
                            <p className="text-sm">Receive buy/sell signals directly on WhatsApp the moment the market moves. No apps to install, no delays.</p>
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

                            <h3 className="mt-6 font-medium">AI Market Analysis</h3>
                        </CardHeader>

                        <CardContent>
                            <p className="mt-3 text-sm">Our AI scans thousands of charts and indicators in real time to identify high-probability trade setups across all major markets.</p>
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

                            <h3 className="mt-6 font-medium">Multi-Market Coverage</h3>
                        </CardHeader>

                        <CardContent>
                            <p className="mt-3 text-sm">Trade Forex, Crypto, Stocks, and Commodities - signals across all markets delivered to a single WhatsApp chat.</p>
                        </CardContent>
                    </Card>

                    <Card className="group shadow-zinc-950/5">
                        <CardHeader className="pb-3">
                            <CardDecorator>
                                <BellRing
                                    className="size-6"
                                    aria-hidden
                                />
                            </CardDecorator>

                            <h3 className="mt-6 font-medium">Real-Time Price Alerts</h3>
                        </CardHeader>

                        <CardContent>
                            <p className="mt-3 text-sm">Set custom price targets and get notified the instant an asset hits your level - entry, take-profit, and stop-loss included.</p>
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

                            <h3 className="mt-6 font-medium">Detailed Signal Reports</h3>
                        </CardHeader>

                        <CardContent>
                            <p className="mt-3 text-sm">Every signal includes entry price, take-profit levels, stop-loss, risk-reward ratio, and the AI reasoning behind the call.</p>
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

                            <h3 className="mt-6 font-medium">Risk Management Tools</h3>
                        </CardHeader>

                        <CardContent>
                            <p className="mt-3 text-sm">Built-in position sizing calculator and daily risk limits help you protect your capital and trade with discipline.</p>
                        </CardContent>
                    </Card>

                    <Card className="group shadow-zinc-950/5">
                        <CardHeader className="pb-3">
                            <CardDecorator>
                                <FileText
                                    className="size-6"
                                    aria-hidden
                                />
                            </CardDecorator>

                            <h3 className="mt-6 font-medium">Daily Market Summaries</h3>
                        </CardHeader>

                        <CardContent>
                            <p className="mt-3 text-sm">Get a concise AI-written overview of global markets every morning - key movers, macro trends, and what to watch for the day, straight to WhatsApp.</p>
                        </CardContent>
                    </Card>

                    <Card className="group shadow-zinc-950/5">
                        <CardHeader className="pb-3">
                            <CardDecorator>
                                <Building2
                                    className="size-6"
                                    aria-hidden
                                />
                            </CardDecorator>

                            <h3 className="mt-6 font-medium">Company Analysis Summaries</h3>
                        </CardHeader>

                        <CardContent>
                            <p className="mt-3 text-sm">Ask the bot about any stock and receive an instant AI summary covering fundamentals, valuation, recent performance, and analyst sentiment.</p>
                        </CardContent>
                    </Card>

                    <Card className="group shadow-zinc-950/5">
                        <CardHeader className="pb-3">
                            <CardDecorator>
                                <Newspaper
                                    className="size-6"
                                    aria-hidden
                                />
                            </CardDecorator>

                            <h3 className="mt-6 font-medium">Earnings & News Alerts</h3>
                        </CardHeader>

                        <CardContent>
                            <p className="mt-3 text-sm">Never miss an earnings release or market-moving headline. The bot summarizes key news for your watchlist companies and delivers it before the market reacts.</p>
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
