import type { Metadata } from 'next'
import Academy from '@/components/academy'

export const metadata: Metadata = {
  title: 'Academy',
  description: 'ATLAS Academy trading education, strategy, automation, and risk management.',
}

export default function AcademyPage() {
  return <Academy />
}
