"use client";

import { useEffect } from "react";

type ToastProps = {
  message: string;
  onClose: () => void;
  durationMs?: number;
  variant?: "success" | "error";
};

export function Toast({ message, onClose, durationMs = 4000, variant = "success" }: ToastProps) {
  useEffect(() => {
    const timer = window.setTimeout(onClose, durationMs);
    return () => window.clearTimeout(timer);
  }, [durationMs, onClose]);

  const styles =
    variant === "error"
      ? "border-[#5A2A2A] bg-[#2A1414] text-[#FFB4B4]"
      : "border-[#31503A] bg-[#142419] text-[#AEE7B8]";

  return (
    <div
      className={`fixed right-4 top-20 z-[100] max-w-sm rounded-2xl border px-4 py-3 text-sm shadow-[0_18px_40px_rgba(0,0,0,0.35)] ${styles}`}
    >
      {message}
    </div>
  );
}
