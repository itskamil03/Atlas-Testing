export default function StatsSection() {
    return (
        <section className="py-12 md:py-20">
            <div className="mx-auto max-w-5xl space-y-8 px-6 md:space-y-16">
                <div className="relative z-10 mx-auto max-w-xl space-y-6 text-center">
                    <h2 className="text-4xl font-semibold lg:text-5xl">Trusted by Traders Worldwide</h2>
                    <p>Our AI has been delivering high-accuracy trading signals to thousands of traders, helping them make smarter, faster decisions every day.</p>
                </div>

                <div className="grid gap-0.5 *:text-center md:grid-cols-4 dark:[--color-muted:var(--color-zinc-900)]">
                    <div className="bg-muted rounded-(--radius) space-y-4 py-12">
                        <div className="text-5xl font-bold">+8,500</div>
                        <p>Active Traders</p>
                    </div>
                    <div className="bg-muted rounded-(--radius) space-y-4 py-12">
                        <div className="text-5xl font-bold">78%</div>
                        <p>Signal Win Rate</p>
                    </div>
                    <div className="bg-muted rounded-(--radius) space-y-4 py-12">
                        <div className="text-5xl font-bold">2M+</div>
                        <p>Signals Delivered</p>
                    </div>
                    <div className="bg-muted rounded-(--radius) space-y-4 py-12">
                        <div className="text-5xl font-bold">24/7</div>
                        <p>Market Monitoring</p>
                    </div>
                </div>
            </div>
        </section>
    )
}
