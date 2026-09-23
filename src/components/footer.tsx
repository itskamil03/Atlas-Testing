import { Logo } from '@/components/logo'
import Link from 'next/link'

const links = [
    {
        title: 'Features',
        href: '/features',
    },
    {
        title: 'How It Works',
        href: '/about',
    },
    {
        title: 'Pricing',
        href: '/pricing',
    },
    {
        title: 'FAQ',
        href: '/contact',
    },
    {
        title: 'Support',
        href: '/contact',
    },
    {
        title: 'Terms & Conditions',
        href: '/terms-and-conditions',
    },
    {
        title: 'Privacy Policy',
        href: '/privacy-policy',
    },
]

export default function FooterSection() {
    return (
        <footer className="relative bg-[#07030f] border-t border-purple-900/20 py-16 md:py-28 overflow-hidden">
            {/* Ambient Background Glow */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[250px] bg-purple-900/15 rounded-full blur-[140px]" />
            </div>

            <div className="relative z-10 mx-auto max-w-5xl px-6">
                {/* Logo Section with seamless dark blending */}
                <div className="flex justify-center mb-8">
                    <Link
                        href="/"
                        aria-label="go home"
                        className="group inline-flex items-center justify-center p-3 sm:p-4 rounded-2xl bg-black/90 border border-purple-500/15 shadow-[0_0_35px_rgba(0,0,0,0.9)] transition-all duration-300 hover:border-purple-500/40 hover:shadow-[0_0_40px_rgba(139,92,246,0.25)]">
                        <Logo className="h-24 sm:h-28 md:h-32 lg:h-36 w-auto object-contain mix-blend-screen transition-transform duration-300 group-hover:scale-105" />
                    </Link>
                </div>

                <div className="my-8 flex flex-wrap justify-center gap-6 text-sm">
                    {links.map((link, index) => (
                        <Link
                            key={index}
                            href={link.href}
                            className="text-muted-foreground hover:text-primary block duration-150">
                            <span>{link.title}</span>
                        </Link>
                    ))}
                </div>
                <div className="my-8 flex flex-wrap justify-center gap-6 text-sm">
                    <Link
                        href="#"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="X/Twitter"
                        className="text-muted-foreground hover:text-primary block">
                        <svg
                            className="size-6"
                            xmlns="http://www.w3.org/2000/svg"
                            width="1em"
                            height="1em"
                            viewBox="0 0 24 24">
                            <path
                                fill="currentColor"
                                d="M10.488 14.651L15.25 21h7l-7.858-10.478L20.93 3h-2.65l-5.117 5.886L8.75 3h-7l7.51 10.015L2.32 21h2.65zM16.25 19L5.75 5h2l10.5 14z"></path>
                        </svg>
                    </Link>
                    <Link
                        href="#"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="LinkedIn"
                        className="text-muted-foreground hover:text-primary block">
                        <svg
                            className="size-6"
                            xmlns="http://www.w3.org/2000/svg"
                            width="1em"
                            height="1em"
                            viewBox="0 0 24 24">
                            <path
                                fill="currentColor"
                                d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zm-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93zM6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37z"></path>
                        </svg>
                    </Link>
                    <Link
                        href="#"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Facebook"
                        className="text-muted-foreground hover:text-primary block">
                        <svg
                            className="size-6"
                            xmlns="http://www.w3.org/2000/svg"
                            width="1em"
                            height="1em"
                            viewBox="0 0 24 24">
                            <path
                                fill="currentColor"
                                d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95"></path>
                        </svg>
                    </Link>
                    <Link
                        href="#"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Instagram"
                        className="text-muted-foreground hover:text-primary block">
                        <svg
                            className="size-6"
                            xmlns="http://www.w3.org/2000/svg"
                            width="1em"
                            height="1em"
                            viewBox="0 0 24 24">
                            <path
                                fill="currentColor"
                                d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4zm9.65 1.5a1.25 1.25 0 0 1 1.25 1.25A1.25 1.25 0 0 1 17.25 8A1.25 1.25 0 0 1 16 6.75a1.25 1.25 0 0 1 1.25-1.25M12 7a5 5 0 0 1 5 5a5 5 0 0 1-5 5a5 5 0 0 1-5-5a5 5 0 0 1 5-5m0 2a3 3 0 0 0-3 3a3 3 0 0 0 3 3a3 3 0 0 0 3-3a3 3 0 0 0-3-3"></path>
                        </svg>
                    </Link>
                </div>

                <div className="bg-muted/50 border-t border-b my-8 py-6 px-4 rounded-lg">
                    <h3 className="text-sm font-semibold mb-3 text-center">Trading Risk Disclaimer</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                        <strong>Trading involves substantial risk and is not suitable for everyone.</strong> Past performance is not indicative of future results.
                        The high degree of leverage in trading can work against you as well as for you. Before deciding to trade, you should carefully consider your investment
                        objectives, level of experience, and risk appetite. The possibility exists that you could sustain a loss of some or all of your initial investment.
                        You should not invest money that you cannot afford to lose. All trading signals provided by Atlas Fintech are for informational and educational purposes only
                        and should not be considered financial advice. We do not guarantee the accuracy, completeness, or timeliness of any information or signals.
                        You are solely responsible for your trading decisions and any resulting losses. Always conduct your own research and consult with a licensed financial advisor
                        before making any investment decisions. Atlas Fintech and its affiliates are not registered investment advisors or broker-dealers.
                    </p>
                </div>

                <span className="text-muted-foreground block text-center text-sm">© 2026 Atlas Fintech Trading Bot, All rights reserved</span>
            </div>
        </footer>
    )
}
