import type { Metadata } from 'next'
import Services from '@/components/services'

export const metadata: Metadata = {
  title: 'Services',
  description: 'Explore ATLAS services including algo trading, AI signals, and custom development.',
}

export default function ServicesPage() {
  return <Services />
}
