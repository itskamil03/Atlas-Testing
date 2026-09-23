"use client"

export interface IndianRatingItem {
  id: string
  name: string
  role: string
  quote: string
  rating: number // 1 to 5
  screenshotUrl: string
  date: string
  verified: boolean
  isFeatured?: boolean
}

const STORAGE_KEY = "atlas_indian_ratings_v1"
const RATINGS_UPDATED_EVENT = "atlas_indian_ratings_updated"

// High-tech trading PnL screenshot templates for default reviews
const DEFAULT_SCREENSHOT_1 = "data:image/svg+xml;utf8," + encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="600" height="340" viewBox="0 0 600 340" fill="none">
  <rect width="600" height="340" rx="16" fill="#09111e"/>
  <rect x="1" y="1" width="598" height="338" rx="15" stroke="#1e293b" stroke-width="1.5"/>
  
  <!-- Terminal Top Bar -->
  <circle cx="28" cy="26" r="5" fill="#ef4444"/>
  <circle cx="44" cy="26" r="5" fill="#eab308"/>
  <circle cx="60" cy="26" r="5" fill="#22c55e"/>
  <rect x="85" y="16" width="180" height="20" rx="6" fill="#131e30"/>
  <text x="95" y="30" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="10" font-weight="600">DELTA EXCHANGE • LIVE</text>
  <text x="572" y="30" fill="#22c55e" font-family="system-ui, sans-serif" font-size="11" text-anchor="end" font-weight="600">● EXECUTION ACTIVE</text>
  
  <!-- Stats Header Box -->
  <rect x="20" y="52" width="560" height="84" rx="10" fill="#0e1a2b" stroke="#1e3a5f" stroke-width="1"/>
  <text x="38" y="78" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="11" font-weight="600">NET REALIZED PROFIT</text>
  <text x="38" y="118" fill="#22c55e" font-family="system-ui, sans-serif" font-size="28" font-weight="800">+₹1,48,250.00</text>
  
  <text x="560" y="80" fill="#22c55e" font-family="system-ui, sans-serif" font-size="13" font-weight="700" text-anchor="end">ROI: +38.4%</text>
  <text x="560" y="104" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="11" text-anchor="end">Win Rate: 76.5%</text>
  <text x="560" y="122" fill="#64748b" font-family="system-ui, sans-serif" font-size="10" text-anchor="end">Trades: 34 (26 Won)</text>
  
  <!-- Chart Area -->
  <path d="M 30 260 C 100 240, 160 250, 240 210 C 320 170, 420 190, 570 155" fill="none" stroke="#22c55e" stroke-width="3" stroke-linecap="round"/>
  <path d="M 30 260 C 100 240, 160 250, 240 210 C 320 170, 420 190, 570 155 L 570 300 L 30 300 Z" fill="url(#pnlGrad1)" opacity="0.2"/>
  
  <defs>
    <linearGradient id="pnlGrad1" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#22c55e"/>
      <stop offset="100%" stop-color="#09111e"/>
    </linearGradient>
  </defs>
  
  <text x="30" y="315" fill="#64748b" font-family="system-ui, sans-serif" font-size="10">Strategy: ATLAS RSI Momentum • Delta Exchange India</text>
</svg>
`)

const DEFAULT_SCREENSHOT_2 = "data:image/svg+xml;utf8," + encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="600" height="340" viewBox="0 0 600 340" fill="none">
  <rect width="600" height="340" rx="16" fill="#0e0f1d"/>
  <rect x="1" y="1" width="598" height="338" rx="15" stroke="#1e2038" stroke-width="1.5"/>
  
  <circle cx="28" cy="26" r="5" fill="#ef4444"/>
  <circle cx="44" cy="26" r="5" fill="#eab308"/>
  <circle cx="60" cy="26" r="5" fill="#22c55e"/>
  <rect x="85" y="16" width="180" height="20" rx="6" fill="#18152c"/>
  <text x="95" y="30" fill="#a855f7" font-family="system-ui, sans-serif" font-size="10" font-weight="600">CRYPTO AI SIGNALS</text>
  <text x="572" y="30" fill="#a855f7" font-family="system-ui, sans-serif" font-size="11" text-anchor="end" font-weight="600">● LIVE FEED</text>
  
  <rect x="20" y="52" width="560" height="84" rx="10" fill="#151329" stroke="#3b1f66" stroke-width="1"/>
  <text x="38" y="78" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="11" font-weight="600">TOTAL NET GAINS</text>
  <text x="38" y="118" fill="#a855f7" font-family="system-ui, sans-serif" font-size="28" font-weight="800">+₹94,800.00</text>
  
  <text x="560" y="80" fill="#a855f7" font-family="system-ui, sans-serif" font-size="13" font-weight="700" text-anchor="end">Accuracy: 85.7%</text>
  <text x="560" y="104" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="11" text-anchor="end">Avg RR: 1 : 2.8</text>
  <text x="560" y="122" fill="#64748b" font-family="system-ui, sans-serif" font-size="10" text-anchor="end">Pairs: BTC/USDT, ETH/USDT</text>
  
  <path d="M 30 270 C 120 250, 200 230, 300 190 C 400 150, 480 170, 570 145" fill="none" stroke="#a855f7" stroke-width="3" stroke-linecap="round"/>
  <path d="M 30 270 C 120 250, 200 230, 300 190 C 400 150, 480 170, 570 145 L 570 300 L 30 300 Z" fill="url(#pnlGrad2)" opacity="0.2"/>
  
  <defs>
    <linearGradient id="pnlGrad2" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#a855f7"/>
      <stop offset="100%" stop-color="#0e0f1d"/>
    </linearGradient>
  </defs>
  
  <text x="30" y="315" fill="#64748b" font-family="system-ui, sans-serif" font-size="10">Automated Signal Execution • Instant Webhook Delivery</text>
</svg>
`)

const DEFAULT_SCREENSHOT_3 = "data:image/svg+xml;utf8," + encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="600" height="340" viewBox="0 0 600 340" fill="none">
  <rect width="600" height="340" rx="16" fill="#081422"/>
  <rect x="1" y="1" width="598" height="338" rx="15" stroke="#16293d" stroke-width="1.5"/>
  
  <circle cx="28" cy="26" r="5" fill="#ef4444"/>
  <circle cx="44" cy="26" r="5" fill="#eab308"/>
  <circle cx="60" cy="26" r="5" fill="#22c55e"/>
  <rect x="85" y="16" width="180" height="20" rx="6" fill="#0e2338"/>
  <text x="95" y="30" fill="#38bdf8" font-family="system-ui, sans-serif" font-size="10" font-weight="600">LONDON BREAKOUT</text>
  <text x="572" y="30" fill="#38bdf8" font-family="system-ui, sans-serif" font-size="11" text-anchor="end" font-weight="600">● 100% AUTOMATED</text>
  
  <rect x="20" y="52" width="560" height="84" rx="10" fill="#0b1e33" stroke="#0284c7" stroke-width="1"/>
  <text x="38" y="78" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="11" font-weight="600">WEEKLY PnL CAPTURE</text>
  <text x="38" y="118" fill="#38bdf8" font-family="system-ui, sans-serif" font-size="28" font-weight="800">+₹62,400.00</text>
  
  <text x="560" y="80" fill="#38bdf8" font-family="system-ui, sans-serif" font-size="13" font-weight="700" text-anchor="end">Accuracy: 81.2%</text>
  <text x="560" y="104" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="11" text-anchor="end">Max DD: 2.1%</text>
  <text x="560" y="122" fill="#64748b" font-family="system-ui, sans-serif" font-size="10" text-anchor="end">Risk Limit: 1.5% per trade</text>
  
  <path d="M 30 260 C 110 240, 200 220, 310 180 C 410 140, 490 160, 570 135" fill="none" stroke="#38bdf8" stroke-width="3" stroke-linecap="round"/>
  <path d="M 30 260 C 110 240, 200 220, 310 180 C 410 140, 490 160, 570 135 L 570 300 L 30 300 Z" fill="url(#pnlGrad3)" opacity="0.2"/>
  
  <defs>
    <linearGradient id="pnlGrad3" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#38bdf8"/>
      <stop offset="100%" stop-color="#081422"/>
    </linearGradient>
  </defs>
  
  <text x="30" y="315" fill="#64748b" font-family="system-ui, sans-serif" font-size="10">Forex Majors & Crypto • Telegram Alerts & Fast Execution</text>
</svg>
`)

export const INITIAL_INDIAN_RATINGS: IndianRatingItem[] = [
  {
    id: "rating-1",
    name: "Rajesh Sharma",
    role: "Delta Exchange Trader • Mumbai",
    quote: "The signals and automated risk execution are incredibly accurate. Generated +₹1,48,250 PnL this month with disciplined stops and zero emotional interference.",
    rating: 5,
    screenshotUrl: DEFAULT_SCREENSHOT_1,
    date: "14 Feb 2026",
    verified: true,
    isFeatured: true,
  },
  {
    id: "rating-2",
    name: "Priya Patel",
    role: "Crypto & Algo Trader • Bangalore",
    quote: "Finally a high-speed trading terminal built for Indian traders! The daily AI intelligence and automated strategies saved me dozens of hours of manual charting.",
    rating: 5,
    screenshotUrl: DEFAULT_SCREENSHOT_2,
    date: "28 Jan 2026",
    verified: true,
    isFeatured: true,
  },
  {
    id: "rating-3",
    name: "Amit Kumar",
    role: "Day Trader • New Delhi",
    quote: "The AI analysis is next level. It spotted the breakout on Bitcoin and London sessions before the surge. Easily the highest ROI investment for my setup.",
    rating: 5,
    screenshotUrl: DEFAULT_SCREENSHOT_3,
    date: "09 Feb 2026",
    verified: true,
    isFeatured: true,
  },
]

export function getStoredIndianRatings(): IndianRatingItem[] {
  if (typeof window === "undefined") return INITIAL_INDIAN_RATINGS
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_INDIAN_RATINGS))
      return INITIAL_INDIAN_RATINGS
    }
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed
    }
    return INITIAL_INDIAN_RATINGS
  } catch {
    return INITIAL_INDIAN_RATINGS
  }
}

export function saveStoredIndianRatings(items: IndianRatingItem[]): void {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    window.dispatchEvent(new CustomEvent(RATINGS_UPDATED_EVENT, { detail: items }))
  } catch (error) {
    console.error("Failed to save indian ratings to storage", error)
  }
}

export function subscribeIndianRatings(callback: (items: IndianRatingItem[]) => void): () => void {
  if (typeof window === "undefined") return () => {}

  const handler = () => {
    callback(getStoredIndianRatings())
  }

  window.addEventListener(RATINGS_UPDATED_EVENT, handler)
  window.addEventListener("storage", handler)

  return () => {
    window.removeEventListener(RATINGS_UPDATED_EVENT, handler)
    window.removeEventListener("storage", handler)
  }
}
