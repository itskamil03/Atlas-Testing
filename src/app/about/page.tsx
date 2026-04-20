import type { Metadata } from 'next'
import AboutUs from '@/components/about-us'

export const metadata: Metadata = {
  title: 'About',
  description: 'Learn more about ATLAS, our trading technology focus, and our approach to automation.',
}

export default function AboutPage() {
  return <AboutUs />
}
