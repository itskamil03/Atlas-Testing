'use client'

import { useEffect, useState } from 'react'
import { Activity, Zap, Target, CheckCircle2 } from 'lucide-react'

export default function LiveStatsBar() {
    const [activeSignals, setActiveSignals] = useState(3)
    const [todaySignals, setTodaySignals] = useState(7)

    // Simulate real-time updates
    useEffect(() => {
        const interval = setInterval(() => {
            setActiveSignals(prev => Math.floor(Math.random() * 2) + 2)
            setTodaySignals(prev => prev < 12 ? prev + 1 : 7)
        }, 8000)

        return () => clearInterval(interval)
    }, [])

    const stats = [
        {
            icon: Activity,
            label: 'Markets Monitored',
            value: '2,847',
            sublabel: 'assets',
            color: 'text-blue-600',
            bgColor: 'bg-blue-500/10'
        },
        {
            icon: Zap,
            label: 'Active Signals',
            value: activeSignals.toString(),
            sublabel: 'right now',
            color: 'text-green-600',
            bgColor: 'bg-green-500/10',
            pulse: true
        },
        {
            icon: Target,
            label: 'Today\'s Signals',
            value: todaySignals.toString(),
            sublabel: 'sent',
            color: 'text-purple-600',
            bgColor: 'bg-purple-500/10'
        },
        {
            icon: CheckCircle2,
            label: 'Win Streak',
            value: '8',
            sublabel: 'in a row',
            color: 'text-emerald-600',
            bgColor: 'bg-emerald-500/10'
        },
    ]

    return (
        <section className="bg-muted/20 py-8">
            <div className="mx-auto max-w-6xl px-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {stats.map((stat, index) => (
                        <div
                            key={index}
                            className={`${stat.bgColor} border rounded-xl p-4 text-center hover:scale-105 transition-all duration-300 cursor-pointer group`}
                        >
                            <div className="flex items-center justify-center mb-2">
                                <stat.icon className={`size-5 ${stat.color} group-hover:scale-110 transition-transform ${
                                    stat.pulse ? 'animate-pulse' : ''
                                }`} />
                            </div>
                            <p className={`text-2xl font-bold ${stat.color} group-hover:scale-110 transition-transform`}>
                                {stat.value}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
                            <p className="text-[10px] text-muted-foreground">{stat.sublabel}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
