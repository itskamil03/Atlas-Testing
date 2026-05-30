'use client'

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

export default function ScrollRestoration() {
  const pathname = usePathname()

  useEffect(() => {
    if (typeof window === 'undefined') return

    const storageKey = `atlas-scroll-position:${pathname}`
    const savedPosition = window.sessionStorage.getItem(storageKey)
    let rafId = 0

    window.history.scrollRestoration = 'manual'

    if (savedPosition) {
      rafId = window.requestAnimationFrame(() => {
        window.scrollTo({ top: Number(savedPosition), left: 0, behavior: 'auto' })
      })
    }

    const savePosition = () => {
      window.sessionStorage.setItem(storageKey, String(window.scrollY))
    }

    window.addEventListener('scroll', savePosition, { passive: true })
    window.addEventListener('pagehide', savePosition)

    return () => {
      window.cancelAnimationFrame(rafId)
      window.removeEventListener('scroll', savePosition)
      window.removeEventListener('pagehide', savePosition)
      savePosition()
    }
  }, [pathname])

  return null
}