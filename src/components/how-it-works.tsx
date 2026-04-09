import { MessageSquare, Sparkles, Bell, TrendingUp } from 'lucide-react'
import WhatsAppPreview from './whatsapp-preview'
import CandlestickChart from './candlestick-chart'

export default function HowItWorks() {
    return (
        <section id="how-it-works" className="bg-muted/20 py-16 md:py-32">
            <div className="mx-auto max-w-5xl px-6">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-semibold lg:text-5xl mb-4">How It Works</h2>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                        Start receiving AI-powered trading signals in minutes. No complex setup required.
                    </p>
                </div>

                <div className="grid gap-8 md:gap-12">
                    {/* Step 1 */}
                    <div className="flex flex-col md:flex-row items-start gap-6 md:gap-8">
                        <div className="flex-shrink-0">
                            <div className="bg-primary text-primary-foreground size-16 rounded-2xl flex items-center justify-center text-2xl font-bold shadow-lg">
                                1
                            </div>
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                                <MessageSquare className="size-6 text-primary" />
                                <h3 className="text-2xl font-semibold">Sign Up & Connect WhatsApp</h3>
                            </div>
                            <p className="text-muted-foreground">
                                Create your account and connect your WhatsApp number. We'll send you a verification code to link your account - it takes less than 2 minutes.
                            </p>
                        </div>
                    </div>

                    {/* Step 2 */}
                    <div className="flex flex-col md:flex-row items-start gap-6 md:gap-8">
                        <div className="flex-shrink-0">
                            <div className="bg-primary text-primary-foreground size-16 rounded-2xl flex items-center justify-center text-2xl font-bold shadow-lg">
                                2
                            </div>
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                                <Sparkles className="size-6 text-primary" />
                                <h3 className="text-2xl font-semibold">AI Analyzes Markets 24/7</h3>
                            </div>
                            <p className="text-muted-foreground">
                                Our AI continuously monitors thousands of assets across Forex, Crypto, Stocks, and Commodities. It analyzes technical indicators, price patterns, volume trends, and market sentiment to identify high-probability trading opportunities.
                            </p>
                        </div>
                    </div>

                    {/* Step 3 */}
                    <div className="flex flex-col md:flex-row items-start gap-6 md:gap-8">
                        <div className="flex-shrink-0">
                            <div className="bg-primary text-primary-foreground size-16 rounded-2xl flex items-center justify-center text-2xl font-bold shadow-lg">
                                3
                            </div>
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                                <Bell className="size-6 text-primary" />
                                <h3 className="text-2xl font-semibold">Receive Instant Signals</h3>
                            </div>
                            <p className="text-muted-foreground">
                                When a high-quality setup is detected, you get an instant WhatsApp notification with the trade signal. Each alert includes entry price, take-profit targets, stop-loss levels, and the AI's reasoning.
                            </p>
                        </div>
                    </div>

                    {/* Step 4 */}
                    <div className="flex flex-col md:flex-row items-start gap-6 md:gap-8">
                        <div className="flex-shrink-0">
                            <div className="bg-primary text-primary-foreground size-16 rounded-2xl flex items-center justify-center text-2xl font-bold shadow-lg">
                                4
                            </div>
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                                <TrendingUp className="size-6 text-primary" />
                                <h3 className="text-2xl font-semibold">Trade with Confidence</h3>
                            </div>
                            <p className="text-muted-foreground">
                                Execute the trade in your brokerage account or exchange. Track performance, manage risk, and receive follow-up alerts for take-profit and stop-loss levels. Our AI keeps monitoring the position and updates you as conditions change.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Visual Demonstration Grid */}
                <div className="mt-16 grid lg:grid-cols-2 gap-8 items-start">
                    {/* WhatsApp Preview */}
                    <div>
                        <div className="text-center mb-8">
                            <h3 className="text-2xl font-semibold mb-2">Live on Your Phone</h3>
                            <p className="text-muted-foreground">See exactly how signals appear in WhatsApp</p>
                        </div>
                        <WhatsAppPreview />
                    </div>

                    {/* Candlestick Chart */}
                    <div>
                        <div className="text-center mb-8">
                            <h3 className="text-2xl font-semibold mb-2">AI Market Analysis</h3>
                            <p className="text-muted-foreground">Real-time technical analysis and signal detection</p>
                        </div>
                        <CandlestickChart />
                    </div>
                </div>
            </div>
        </section>
    )
}
