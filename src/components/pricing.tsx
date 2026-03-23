import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Check } from 'lucide-react'

export default function Pricing() {
    return (
        <section id="pricing" className="py-16 md:py-32">
            <div className="mx-auto max-w-6xl px-6">
                <div className="mx-auto max-w-2xl space-y-6 text-center">
                    <h1 className="text-center text-4xl font-semibold lg:text-5xl">Simple Pricing, Powerful Signals</h1>
                    <p>Choose the plan that fits your trading style. Upgrade or cancel anytime - no lock-in contracts.</p>
                </div>

                <div className="mt-8 grid gap-6 md:mt-20 md:grid-cols-3">
                    <Card className="flex flex-col">
                        <CardHeader>
                            <CardTitle className="font-medium">Starter</CardTitle>
                            <span className="my-3 block text-2xl font-semibold">₹399 / mo</span>
                            <CardDescription className="text-sm">For beginner traders</CardDescription>
                        </CardHeader>

                        <CardContent className="space-y-4">
                            <hr className="border-dashed" />

                            <ul className="list-outside space-y-3 text-sm">
                                {[
                                    'Up to 5 signals/day',
                                    'Forex & Crypto markets',
                                    'Entry, TP & SL included',
                                    'WhatsApp delivery',
                                    'Daily market summary',
                                    'Basic risk calculator',
                                ].map((item, index) => (
                                    <li
                                        key={index}
                                        className="flex items-center gap-2">
                                        <Check className="size-3" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </CardContent>

                        <CardFooter className="mt-auto">
                            <Button
                                asChild
                                variant="outline"
                                className="w-full">
                                <Link href="#">Get Started</Link>
                            </Button>
                        </CardFooter>
                    </Card>

                    <Card className="relative">
                        <span className="bg-linear-to-br/increasing absolute inset-x-0 -top-3 mx-auto flex h-6 w-fit items-center rounded-full from-purple-400 to-amber-300 px-3 py-1 text-xs font-medium text-amber-950 ring-1 ring-inset ring-white/20 ring-offset-1 ring-offset-gray-950/5">Most Popular</span>

                        <div className="flex flex-col">
                            <CardHeader>
                                <CardTitle className="font-medium">Pro Trader</CardTitle>
                                <span className="my-3 block text-2xl font-semibold">₹699 / mo</span>
                                <CardDescription className="text-sm">For serious traders</CardDescription>
                            </CardHeader>

                            <CardContent className="space-y-4">
                                <hr className="border-dashed" />
                                <ul className="list-outside space-y-3 text-sm">
                                    {[
                                        'Unlimited signals/day',
                                        'Forex, Crypto, Stocks & Commodities',
                                        'Entry, TP & SL included',
                                        'WhatsApp delivery',
                                        'Daily & weekly market summaries',
                                        'Company analysis summaries (on-demand)',
                                        'Earnings & news alerts',
                                        'AI market analysis reports',
                                        'Advanced risk management tools',
                                        'Real-time price alerts',
                                        'Signal performance tracking',
                                        'Priority support',
                                        'TradingView & Binance integration',
                                    ].map((item, index) => (
                                        <li
                                            key={index}
                                            className="flex items-center gap-2">
                                            <Check className="size-3" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>

                            <CardFooter>
                                <Button
                                    asChild
                                    className="w-full">
                                    <Link href="#">Get Started</Link>
                                </Button>
                            </CardFooter>
                        </div>
                    </Card>

                    <Card className="flex flex-col">
                        <CardHeader>
                            <CardTitle className="font-medium">Elite</CardTitle>
                            <span className="my-3 block text-2xl font-semibold">₹999 / mo</span>
                            <CardDescription className="text-sm">For professional & fund traders</CardDescription>
                        </CardHeader>

                        <CardContent className="space-y-4">
                            <hr className="border-dashed" />

                            <ul className="list-outside space-y-3 text-sm">
                                {[
                                    'Everything in Pro Trader',
                                    'Custom market & sector summaries',
                                    'Unlimited company deep-dives',
                                    'Pre-market & post-market reports',
                                    'Custom signal strategy configuration',
                                    'Dedicated account manager',
                                    'Private WhatsApp group access',
                                    'Weekly live trading sessions',
                                    'API access for auto-execution',
                                ].map((item, index) => (
                                    <li
                                        key={index}
                                        className="flex items-center gap-2">
                                        <Check className="size-3" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </CardContent>

                        <CardFooter className="mt-auto">
                            <Button
                                asChild
                                variant="outline"
                                className="w-full">
                                <Link href="#">Get Started</Link>
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </section>
    )
}
