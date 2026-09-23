"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { useBookDemoStore } from "@/store/useBookDemoStore";

interface BookDemoButtonProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  onOpenCallback?: () => void;
}

export function BookDemoButton({
  className,
  size = "sm",
  fullWidth = false,
  onOpenCallback,
}: BookDemoButtonProps) {
  const openDemoModal = useBookDemoStore((s) => s.openDemoModal);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    openDemoModal();
    if (onOpenCallback) {
      onOpenCallback();
    }
  };

  const sizeClasses = {
    sm: "px-3.5 py-1.5 text-xs sm:text-sm h-9",
    md: "px-5 py-2 text-sm h-10",
    lg: "px-6 py-2.5 text-base h-11",
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        "relative group inline-flex items-center justify-center gap-2 overflow-hidden rounded-full font-semibold transition-all duration-300 cursor-pointer select-none",
        // Unique gradient background + subtle neon glow
        "bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 text-white shadow-[0_0_18px_rgba(124,58,237,0.4)]",
        "hover:shadow-[0_0_28px_rgba(139,92,246,0.7)] hover:scale-[1.02] active:scale-[0.97]",
        // Glowing border outline
        "border border-purple-300/40 hover:border-purple-200/80",
        sizeClasses[size],
        fullWidth ? "w-full" : "w-auto",
        className
      )}
      aria-label="Book a Demo"
    >
      {/* Animated continuous sheen effect */}
      <span
        className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-1000 ease-in-out group-hover:translate-x-full"
        aria-hidden="true"
      />

      {/* Pulsing subtle live indicator */}
      <span className="relative flex size-2 shrink-0">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
        <span className="relative inline-flex size-2 rounded-full bg-amber-300" />
      </span>

      {/* Label */}
      <span className="relative z-10 tracking-wide bg-gradient-to-r from-white via-slate-100 to-purple-100 bg-clip-text text-transparent font-bold">
        Book a Demo
      </span>
    </button>
  );
}
