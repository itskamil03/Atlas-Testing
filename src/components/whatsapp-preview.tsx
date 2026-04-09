'use client'

import { useState } from 'react'
import { Check, CheckCheck } from 'lucide-react'

export default function WhatsAppPreview() {
    const [hoveredMessage, setHoveredMessage] = useState<number | null>(null)

    return (
        <div className="relative mx-auto max-w-sm">
            {/* Phone Frame */}
            <div className="bg-background border-8 border-zinc-800 dark:border-zinc-700 rounded-[3rem] shadow-2xl overflow-hidden hover:shadow-3xl transition-all duration-300 hover:scale-[1.02]">
                {/* WhatsApp Header */}
                <div className="bg-[#008069] text-white px-4 py-3 flex items-center gap-3">
                    <div className="size-10 rounded-full bg-white/20 flex items-center justify-center font-semibold">
                        AT
                    </div>
                    <div>
                        <p className="font-semibold text-sm">Atlas Trading Bot</p>
                        <p className="text-xs opacity-80">online</p>
                    </div>
                </div>

                {/* Chat Background */}
                <div className="bg-[#efeae2] dark:bg-[#0b141a] p-4 space-y-3" style={{ minHeight: '400px' }}>
                    {/* Bot Message 1 - Market Summary */}
                    <div className="flex justify-start">
                        <div
                            onMouseEnter={() => setHoveredMessage(1)}
                            onMouseLeave={() => setHoveredMessage(null)}
                            className={`bg-white dark:bg-[#1f2c33] rounded-lg rounded-tl-none shadow-sm p-3 max-w-[85%] transition-all duration-200 cursor-pointer ${
                                hoveredMessage === 1 ? 'scale-105 shadow-lg' : ''
                            }`}
                        >
                            <p className="text-xs font-semibold text-primary mb-1">Market Summary - Mar 24</p>
                            <p className="text-sm">
                                Good morning! USD showing strength after Fed comments. EUR/USD testing key support at 1.0840. Gold consolidating near $2,180.
                            </p>
                            <div className="flex items-center justify-end gap-1 mt-1">
                                <span className="text-[10px] text-muted-foreground">09:15</span>
                                <CheckCheck className="size-3 text-blue-500" />
                            </div>
                        </div>
                    </div>

                    {/* Bot Message 2 - Trading Signal */}
                    <div className="flex justify-start">
                        <div
                            onMouseEnter={() => setHoveredMessage(2)}
                            onMouseLeave={() => setHoveredMessage(null)}
                            className={`bg-white dark:bg-[#1f2c33] rounded-lg rounded-tl-none shadow-sm p-3 max-w-[85%] transition-all duration-200 cursor-pointer ${
                                hoveredMessage === 2 ? 'scale-105 shadow-lg ring-2 ring-green-500/50' : ''
                            }`}
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <div className="bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded animate-pulse">
                                    BUY SIGNAL
                                </div>
                                <span className="text-xs font-semibold">EUR/USD</span>
                            </div>
                            <div className="space-y-1 text-xs font-mono">
                                <p><span className="text-muted-foreground">Entry:</span> <strong>1.0845</strong></p>
                                <p><span className="text-muted-foreground">TP1:</span> 1.0885 <span className="text-green-600">(+40 pips)</span></p>
                                <p><span className="text-muted-foreground">TP2:</span> 1.0920 <span className="text-green-600">(+75 pips)</span></p>
                                <p><span className="text-muted-foreground">SL:</span> 1.0815 <span className="text-red-600">(-30 pips)</span></p>
                                <p className="pt-1"><span className="text-muted-foreground">R/R:</span> <strong className="text-green-600">1:2.5</strong></p>
                            </div>
                            <div className="mt-2 pt-2 border-t text-xs text-muted-foreground">
                                <strong>Analysis:</strong> Bullish divergence on 4H + RSI oversold bounce. Strong support at 1.0820.
                            </div>
                            <div className="flex items-center justify-end gap-1 mt-1">
                                <span className="text-[10px] text-muted-foreground">10:32</span>
                                <CheckCheck className="size-3 text-blue-500" />
                            </div>
                        </div>
                    </div>

                    {/* Bot Message 3 - Follow-up */}
                    <div className="flex justify-start">
                        <div
                            onMouseEnter={() => setHoveredMessage(3)}
                            onMouseLeave={() => setHoveredMessage(null)}
                            className={`bg-white dark:bg-[#1f2c33] rounded-lg rounded-tl-none shadow-sm p-3 max-w-[85%] transition-all duration-200 cursor-pointer ${
                                hoveredMessage === 3 ? 'scale-105 shadow-lg' : ''
                            }`}
                        >
                            <p className="text-sm">
                                <span className="text-green-600 font-semibold">✓ TP1 Hit!</span> EUR/USD reached 1.0885. Consider moving SL to breakeven.
                            </p>
                            <div className="flex items-center justify-end gap-1 mt-1">
                                <span className="text-[10px] text-muted-foreground">14:18</span>
                                <CheckCheck className="size-3 text-blue-500" />
                            </div>
                        </div>
                    </div>

                    {/* User Response */}
                    <div className="flex justify-end">
                        <div
                            onMouseEnter={() => setHoveredMessage(4)}
                            onMouseLeave={() => setHoveredMessage(null)}
                            className={`bg-[#d9fdd3] dark:bg-[#005c4b] rounded-lg rounded-tr-none shadow-sm p-3 max-w-[85%] transition-all duration-200 cursor-pointer ${
                                hoveredMessage === 4 ? 'scale-105 shadow-lg' : ''
                            }`}
                        >
                            <p className="text-sm">Perfect timing! Thanks! 🎯</p>
                            <div className="flex items-center justify-end gap-1 mt-1">
                                <span className="text-[10px] text-muted-foreground">14:20</span>
                                <CheckCheck className="size-3 text-blue-500" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Floating indicator */}
            <div className="absolute -top-4 -right-4 bg-green-500 text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg animate-pulse">
                Live Signals
            </div>
        </div>
    )
}
