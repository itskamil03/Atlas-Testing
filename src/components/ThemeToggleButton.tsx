"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import React from "react"

import { cn } from "@/lib/utils"

export function ThemeToggleButton() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const isDark = (mounted ? resolvedTheme : theme) === "dark"

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark")
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      aria-pressed={isDark}
      className={cn(
        "group relative inline-flex w-20  h-auto items-center rounded-full border py-4 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        isDark
          ? "border-slate-700 bg-slate-900 shadow-[inset_0_1px_8px_rgba(255,255,255,0.04)]"
          : "border-emerald-200 bg-emerald-50 shadow-[inset_0_1px_8px_rgba(16,185,129,0.08)]"
      )}
    >
      <span
        className={cn(
          "absolute left-0 top-1  w-8 rounded-full transition-transform duration-300",
          isDark
            ? "translate-x-10 bg-slate-100 shadow-[0_8px_20px_rgba(0,0,0,0.35)]"
            : "translate-x-0 bg-white shadow-[0_8px_20px_rgba(16,185,129,0.18)]"
        )}
      />

      <span className="pointer-events-none absolute inset-y-0 left-0 z-20 flex w-1/2 items-center justify-center transition-colors duration-300">
        <Sun
          className={cn(
            "h-4 w-4 transition-colors duration-300",
            isDark ? "text-slate-500" : "text-emerald-600"
          )}
        />
      </span>

      <span className="pointer-events-none absolute inset-y-0 right-0 z-20 flex w-1/2 items-center justify-center transition-colors duration-300">
        <Moon
          className={cn(
            "h-4 w-4 transition-colors duration-300",
            isDark ? "text-cyan-200" : "text-slate-400"
          )}
        />
      </span>

      <span className="sr-only">Toggle theme</span>
    </button>
  )
}
