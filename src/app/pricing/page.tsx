import type { Metadata } from 'next'
import Pricing from '@/components/pricing'

export const metadata: Metadata = {
  title: 'Pricing',
  description: 'Review ATLAS pricing plans and compare trading solution tiers.',
}

export default function PricingPage() {
  return <Pricing />
}
