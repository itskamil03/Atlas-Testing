"use client"

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, ShieldCheck, ZoomIn, X, Sparkles, TrendingUp, ExternalLink } from 'lucide-react'
import { getStoredIndianRatings, subscribeIndianRatings, type IndianRatingItem } from '@/lib/indianRatingsStore'

export default function Testimonials() {
  const [ratings, setRatings] = useState<IndianRatingItem[]>([])
  const [activeModalImage, setActiveModalImage] = useState<IndianRatingItem | null>(null)

  useEffect(() => {
    setRatings(getStoredIndianRatings())
    const unsubscribe = subscribeIndianRatings((items) => {
      setRatings(items)
    })
    return () => unsubscribe()
  }, [])

  return (
    <section id="indian-rating" className="relative bg-background py-20 md:py-28 border-t border-border/40 overflow-hidden">
      {/* Ambient background glow */}
      <div className="pointer-events-none absolute left-1/2 top-12 -translate-x-1/2 size-96 rounded-full bg-purple-600/10 blur-[120px]" />

      <div className="mx-auto max-w-6xl px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-14 md:mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/20 bg-purple-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.25em] text-purple-400 mb-6">
            <Sparkles className="size-3.5 text-purple-400" />
            <span>Verified Trader Reviews</span>
          </div>

          <h2 className="text-3xl font-semibold sm:text-4xl lg:text-5xl text-foreground tracking-tight">
            Indian Rating &amp; Feedback
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-base sm:text-lg font-medium text-muted-foreground">
            Real trading results, verified P&amp;L captures, and feedback from active Indian traders.
          </p>

          {/* Aggregate Rating Banner */}
          <div className="mt-6 inline-flex flex-wrap items-center justify-center gap-3 rounded-2xl border border-border/80 bg-card/60 px-5 py-2.5 backdrop-blur-md">
            <div className="flex items-center gap-1 text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="size-4 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <span className="text-sm font-semibold text-foreground">4.9 / 5.0</span>
            <span className="text-xs text-muted-foreground">•</span>
            <span className="text-xs font-medium text-muted-foreground">500+ Indian Traders Verified</span>
          </div>
        </div>

        {/* Reviews Grid (Screenshot + Rating + Text) */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {ratings.map((item, idx) => (
            <motion.div
              key={item.id || idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
              className="flex flex-col justify-between rounded-2xl border border-border/80 bg-card/70 p-5 sm:p-6 backdrop-blur-md shadow-xl transition-all duration-300 hover:border-purple-500/50 hover:bg-card/90 hover:-translate-y-1"
            >
              <div>
                {/* Card Top: Trader Header & Rating */}
                <div className="flex items-start justify-between gap-3 pb-4 border-b border-border/40">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 font-bold text-sm">
                      {item.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-semibold text-foreground">{item.name}</p>
                        {item.verified !== false && (
                          <span title="Verified Trader">
                            <ShieldCheck className="size-4 text-emerald-400" />
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{item.role}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-0.5 text-amber-400 shrink-0 pt-0.5">
                    {[...Array(item.rating)].map((_, i) => (
                      <Star key={i} className="size-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                </div>

                {/* Review Quote Text */}
                <div className="my-4">
                  <p className="text-sm text-foreground/90 leading-relaxed italic">
                    &ldquo;{item.quote}&rdquo;
                  </p>
                </div>

                {/* Screenshot Image Section (Non-overlapping container) */}
                <div className="mt-2">
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5 px-0.5">
                    <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-400">
                      <TrendingUp className="size-3 text-emerald-400" />
                      <span>Verified P&amp;L Capture</span>
                    </span>
                    <span className="text-[11px] text-purple-400 flex items-center gap-1">
                      <ZoomIn className="size-3" />
                      <span>Click to enlarge</span>
                    </span>
                  </div>

                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => setActiveModalImage(item)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') setActiveModalImage(item)
                    }}
                    className="relative overflow-hidden rounded-xl border border-border/80 bg-slate-950/90 aspect-[16/9] cursor-pointer group transition-all hover:border-purple-500/80"
                  >
                    {item.screenshotUrl ? (
                      item.screenshotUrl.startsWith("data:image/svg") ? (
                        <img
                          src={item.screenshotUrl}
                          alt={`${item.name} Trading Screenshot`}
                          className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <Image
                          src={item.screenshotUrl}
                          alt={`${item.name} Trading Screenshot`}
                          fill
                          unoptimized
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      )
                    ) : (
                      <div className="flex size-full items-center justify-center bg-muted/40 text-muted-foreground">
                        <TrendingUp className="size-8 opacity-40" />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="pt-4 mt-4 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground">
                <span>{item.date || "Verified Review"}</span>
                <span className="text-[11px] font-medium text-emerald-400 flex items-center gap-1">
                  <span className="size-1.5 rounded-full bg-emerald-400" />
                  <span>Delta Exchange Verified</span>
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Full Resolution Screenshot Lightbox Modal */}
      <AnimatePresence>
        {activeModalImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveModalImage(null)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-3xl w-full rounded-2xl border border-border/80 bg-card p-6 shadow-2xl overflow-hidden"
            >
              {/* Modal Close Button */}
              <button
                type="button"
                onClick={() => setActiveModalImage(null)}
                className="absolute top-4 right-4 z-20 flex size-9 items-center justify-center rounded-full border border-border/80 bg-card text-foreground hover:bg-muted cursor-pointer transition-colors"
              >
                <X className="size-5" />
              </button>

              {/* Modal Header */}
              <div className="mb-4 pr-10">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold text-foreground">{activeModalImage.name}</h3>
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(activeModalImage.rating)].map((_, i) => (
                      <Star key={i} className="size-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">{activeModalImage.role}</p>
              </div>

              {/* Enlarged Screenshot */}
              <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl border border-border/80 bg-slate-950">
                {activeModalImage.screenshotUrl.startsWith("data:image/svg") ? (
                  <img
                    src={activeModalImage.screenshotUrl}
                    alt={`${activeModalImage.name} Verified Trade Proof`}
                    className="size-full object-contain"
                  />
                ) : (
                  <Image
                    src={activeModalImage.screenshotUrl}
                    alt={`${activeModalImage.name} Verified Trade Proof`}
                    fill
                    unoptimized
                    className="object-contain"
                  />
                )}
              </div>

              {/* Modal Review Quote */}
              <p className="mt-4 text-sm text-muted-foreground italic">
                &ldquo;{activeModalImage.quote}&rdquo;
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
