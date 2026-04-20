import type { Metadata } from 'next'
import Features from '@/components/features-1'

export const metadata: Metadata = {
  title: 'Features',
  description: 'Explore the ATLAS trading engine, signals, dashboard, and backtesting features.',
}

export default function FeaturesPage() {
  return <Features />
}
