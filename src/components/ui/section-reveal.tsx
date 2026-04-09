'use client'

import { motion, Variants } from 'framer-motion'
import { ReactNode } from 'react'

type AnimationType = 'fade' | 'slide-up' | 'slide-left' | 'slide-right' | 'zoom' | 'flip'

type SectionRevealProps = {
  children: ReactNode
  className?: string
  animation?: AnimationType
}

const sectionVariants: Record<AnimationType, Variants> = {
  fade: {
    hidden: { opacity: 0, y: 60, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1 },
  },
  'slide-up': {
    hidden: { opacity: 0, y: 90, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1 },
  },
  'slide-left': {
    hidden: { opacity: 0, x: 90, scale: 0.96 },
    visible: { opacity: 1, x: 0, scale: 1 },
  },
  'slide-right': {
    hidden: { opacity: 0, x: -90, scale: 0.96 },
    visible: { opacity: 1, x: 0, scale: 1 },
  },
  zoom: {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { type: 'spring', stiffness: 220, damping: 18 },
    },
  },
  flip: {
    hidden: { opacity: 0, rotateY: -80, scale: 0.88 },
    visible: {
      opacity: 1,
      rotateY: 0,
      scale: 1,
      transition: { type: 'spring', stiffness: 160, damping: 18 },
    },
  },
}

export default function SectionReveal({
  children,
  className,
  animation = 'fade',
}: SectionRevealProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.15, margin: '-140px 0px -140px 0px' }}
      variants={sectionVariants[animation]}
      transition={{ duration: 1.15, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
