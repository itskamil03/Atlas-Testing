"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Activity, Cpu, Globe2, GraduationCap, Settings2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

const services = [
  {
    title: 'Forex Algo Trading',
    description:
      'Automated FX strategies built for precision entry, dynamic risk controls, and consistent execution in major and exotic currency pairs.',
    icon: Activity,
  },
  {
    title: 'Crypto Algo Trading',
    description:
      'High-frequency and trend-driven crypto algorithms designed for fast markets, with smart order routing and performance monitoring.',
    icon: Globe2,
  },
  {
    title: 'AI Signals Suite',
    description:
      'Receive AI-powered buy/sell signals with entry, take-profit, stop-loss, and market context for every alert.',
    icon: Cpu,
  },
  {
    title: 'Custom Algo Development',
    description:
      'Design bespoke trading systems tailored to your strategy, risk profile, and asset class requirements.',
    icon: Settings2,
  },
  {
    title: 'ATLAS Academy',
    description:
      'A structured Master Trading Program for Forex, Crypto, and algorithmic traders, covering strategy, automation, and trading psychology.',
    icon: GraduationCap,
  },
  {
    title: 'Institutional / Prop Desk',
    description:
      'Advanced backtesting tools with historical data, Monte Carlo simulations, and strategy optimization for professional traders and institutions.',
    icon: Activity,
  },
]

function useInView() {
  const ref = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          observer.disconnect()
        }
      },
      { threshold: 0.05, rootMargin: '0px 0px -10% 0px' }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return { ref, inView }
}

export default function Services() {
  const header = useInView()

  return (
    <section id="services" className="bg-muted/10 py-16 md:py-10">
      <div className="mx-auto max-w-6xl px-6">
        <div
          ref={header.ref}
          className={`text-center transition-all duration-500 ease-out ${
            header.inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <h2 className="text-4xl font-semibold lg:text-5xl">Services</h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            ATLAS provides a full suite of algo trading solutions, AI signal delivery, and custom development for active traders.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {services.map((service, index) => {
            const Icon = service.icon
            return <ServiceCard key={service.title} service={service} index={index} Icon={Icon} />
          })}
        </div>
      </div>
    </section>
  )
}

function ServiceCard({
  service,
  index,
  Icon,
}: {
  service: (typeof services)[number]
  index: number
  Icon: typeof Activity
}) {
  const { ref, inView } = useInView()
  const delay = Math.min(index * 40, 120)

  return (
    <Card
      ref={ref}
      className={`border transition-all ease-out ${
        inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
      style={{ transitionDuration: '450ms', transitionDelay: inView ? `${delay}ms` : '0ms' }}
    >
      <CardHeader>
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-background text-primary shadow-sm">
          <Icon className="size-6" />
        </div>
        <CardTitle className="mt-6 text-xl">{service.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mt-2 text-sm text-muted-foreground">{service.description}</p>
      </CardContent>
    </Card>
  )
}