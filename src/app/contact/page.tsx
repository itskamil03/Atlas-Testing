import type { Metadata } from 'next'
import ContactSection from '@/components/contact'

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Get in touch for support, business inquiries, and partnership opportunities.',
}

export default function ContactPage() {
  return <ContactSection />
}
