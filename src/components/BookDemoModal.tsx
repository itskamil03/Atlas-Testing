"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Calendar,
  Sparkles,
  User,
  Mail,
  Phone,
  Clock,
  MessageSquare,
  CheckCircle2,
  ChevronRight,
  ChevronDown,
  Target,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { useBookDemoStore } from "@/store/useBookDemoStore";

interface BookDemoModalProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function BookDemoModal({ isOpen: propIsOpen, onClose: propOnClose }: BookDemoModalProps) {
  const storeIsOpen = useBookDemoStore((s) => s.isOpen);
  const storeClose = useBookDemoStore((s) => s.closeDemoModal);

  const isModalOpen = propIsOpen !== undefined ? propIsOpen : storeIsOpen;
  const handleClose = propOnClose !== undefined ? propOnClose : storeClose;

  const [mounted, setMounted] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    interest: "Algorithmic Trading & Automation",
    preferredDate: "",
    preferredTime: "Morning (10:00 AM - 01:00 PM)",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close modal on Escape key press and manage body scroll
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
      }
    };
    if (isModalOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isModalOpen, handleClose]);

  if (!mounted || !isModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!formData.fullName.trim()) {
      setErrorMessage("Please enter your full name.");
      return;
    }
    if (!formData.email.trim()) {
      setErrorMessage("Please enter your email address.");
      return;
    }
    if (!formData.phone.trim()) {
      setErrorMessage("Please enter your phone/WhatsApp number.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/book-demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to submit demo request.");
      }

      setSubmitted(true);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to submit request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSubmitted(false);
    setFormData({
      fullName: "",
      email: "",
      phone: "",
      interest: "Algorithmic Trading & Automation",
      preferredDate: "",
      preferredTime: "Morning (10:00 AM - 01:00 PM)",
      message: "",
    });
    setErrorMessage(null);
    handleClose();
  };

  const modalContent = (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center overflow-y-auto overflow-x-hidden p-4 sm:p-6 md:p-8">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity animate-in fade-in duration-200"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Modal Dialog Card */}
      <div
        className="relative w-full max-w-xl rounded-2xl border border-purple-500/30 bg-[#0B0E17]/95 p-6 shadow-[0_0_60px_rgba(124,58,237,0.35)] backdrop-blur-2xl transition-all sm:p-8 z-10 my-auto animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow ambient background inside modal */}
        <div className="pointer-events-none absolute -top-24 -left-24 size-48 rounded-full bg-purple-600/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -right-24 size-48 rounded-full bg-indigo-600/25 blur-3xl" />

        {/* Close Button */}
        <button
          type="button"
          onClick={handleClose}
          className="absolute right-4 top-4 rounded-full p-2 text-slate-400 hover:bg-purple-950/40 hover:text-white transition duration-150 active:scale-95 cursor-pointer z-20"
          aria-label="Close dialog"
        >
          <X className="size-5" />
        </button>

        {submitted ? (
          /* Success Screen */
          <div className="py-6 text-center">
            <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-[0_0_25px_rgba(16,185,129,0.3)] animate-in zoom-in-50 duration-300">
              <CheckCircle2 className="size-9" />
            </div>

            <h3 className="text-2xl font-bold text-white tracking-tight">
              Demo Request Scheduled!
            </h3>
            <p className="mt-2 text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
              Thank you, <span className="font-semibold text-purple-300">{formData.fullName}</span>. Our trading technology specialist has received your booking details and will connect with you shortly.
            </p>

            <div className="mt-6 rounded-xl border border-purple-900/40 bg-[#121624] p-4 text-left text-xs space-y-2 text-slate-300">
              <div className="flex justify-between border-b border-purple-900/20 pb-2">
                <span className="text-slate-400">Contact Email:</span>
                <span className="font-medium text-white">{formData.email}</span>
              </div>
              <div className="flex justify-between border-b border-purple-900/20 pb-2">
                <span className="text-slate-400">Topic:</span>
                <span className="font-medium text-purple-300">{formData.interest}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Preferred Slot:</span>
                <span className="font-medium text-white">
                  {formData.preferredDate || "Earliest available"} • {formData.preferredTime}
                </span>
              </div>
            </div>

            <div className="mt-8 flex justify-center">
              <button
                type="button"
                onClick={handleReset}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-600/30 hover:from-purple-500 hover:to-indigo-500 transition-all active:scale-95 cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          /* Form Content */
          <div>
            {/* Header */}
            <div className="mb-6">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-xs font-semibold text-purple-300 mb-3 shadow-[0_0_12px_rgba(124,58,237,0.15)]">
                <Sparkles className="size-3.5 text-purple-400" />
                <span>Live Interactive Session</span>
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-white">
                Book a Live Demo
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-slate-400">
                Experience institutional-grade algo trading automation, custom signals, and prop execution tailored for you.
              </p>
            </div>

            {errorMessage && (
              <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Full Name <span className="text-purple-400">*</span>
                  </label>
                  <div className="relative">
                    <User className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-500" />
                    <input
                      type="text"
                      required
                      placeholder="John Doe"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full rounded-xl border border-purple-900/30 bg-[#121624] py-2.5 pl-10 pr-3 text-sm text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-colors"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Work / Personal Email <span className="text-purple-400">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-500" />
                    <input
                      type="email"
                      required
                      placeholder="john@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full rounded-xl border border-purple-900/30 bg-[#121624] py-2.5 pl-10 pr-3 text-sm text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-colors"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* Phone / WhatsApp */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Phone / WhatsApp Number <span className="text-purple-400">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-500" />
                    <input
                      type="tel"
                      required
                      placeholder="+1 (555) 000-0000"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full rounded-xl border border-purple-900/30 bg-[#121624] py-2.5 pl-10 pr-3 text-sm text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-colors"
                    />
                  </div>
                </div>

                {/* Trading Interest */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Primary Interest
                  </label>
                  <div className="relative">
                    <Target className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-500 z-10" />
                    <select
                      value={formData.interest}
                      onChange={(e) => setFormData({ ...formData, interest: e.target.value })}
                      className="w-full rounded-xl border border-purple-900/30 bg-[#121624] py-2.5 pl-10 pr-9 text-sm text-white focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-colors appearance-none cursor-pointer [color-scheme:dark]"
                    >
                      <option className="bg-[#121624] text-white py-1" value="Algorithmic Trading & Automation">Algo Trading & Automation</option>
                      <option className="bg-[#121624] text-white py-1" value="ATLAS Academy">ATLAS Academy</option>
                      <option className="bg-[#121624] text-white py-1" value="Forex & Crypto Strategies">Forex & Crypto Strategies</option>
                      <option className="bg-[#121624] text-white py-1" value="Institutional / Prop Desk Access">Prop Desk & Institutional</option>
                      <option className="bg-[#121624] text-white py-1" value="Broker Integration & API">Broker Integration & API</option>
                      <option className="bg-[#121624] text-white py-1" value="Custom Bot Development">Custom Bot / Mentorship</option>
                      <option className="bg-[#121624] text-white py-1" value="Others">Others</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-500 z-10" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* Preferred Date */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Preferred Date
                  </label>
                  <div className="relative">
                    <Calendar className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-500 z-10" />
                    <input
                      type="date"
                      min={new Date().toISOString().split("T")[0]}
                      value={formData.preferredDate}
                      onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
                      className="w-full rounded-xl border border-purple-900/30 bg-[#121624] py-2.5 pl-10 pr-3 text-sm text-white focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-colors [color-scheme:dark]"
                    />
                  </div>
                </div>

                {/* Preferred Time Slot */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Preferred Time Slot
                  </label>
                  <div className="relative">
                    <Clock className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-500 z-10" />
                    <select
                      value={formData.preferredTime}
                      onChange={(e) => setFormData({ ...formData, preferredTime: e.target.value })}
                      className="w-full rounded-xl border border-purple-900/30 bg-[#121624] py-2.5 pl-10 pr-9 text-sm text-white focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-colors appearance-none cursor-pointer [color-scheme:dark]"
                    >
                      <option className="bg-[#121624] text-white py-1" value="Morning (10:00 AM - 01:00 PM)">Morning (10:00 AM - 01:00 PM)</option>
                      <option className="bg-[#121624] text-white py-1" value="Afternoon (01:00 PM - 05:00 PM)">Afternoon (01:00 PM - 05:00 PM)</option>
                      <option className="bg-[#121624] text-white py-1" value="Evening (05:00 PM - 08:00 PM)">Evening (05:00 PM - 08:00 PM)</option>
                      <option className="bg-[#121624] text-white py-1" value="Immediate / Earliest Available">Immediate / Earliest Available</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-500 z-10" />
                  </div>
                </div>
              </div>

              {/* Message / Notes */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Questions / Specific Requirements (Optional)
                </label>
                <div className="relative">
                  <MessageSquare className="pointer-events-none absolute left-3.5 top-3 size-4 text-slate-500" />
                  <textarea
                    rows={2}
                    placeholder="Tell us what you'd like to see (e.g., specific indicators, broker integration, backtests)..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full rounded-xl border border-purple-900/30 bg-[#121624] py-2.5 pl-10 pr-3 text-sm text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-colors resize-none"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-violet-600 py-3 text-sm font-semibold text-white shadow-[0_0_25px_rgba(124,58,237,0.4)] transition-all hover:shadow-[0_0_35px_rgba(124,58,237,0.6)] active:scale-[0.98] disabled:opacity-60 cursor-pointer"
              >
                {/* Shining Sheen Animation */}
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />

                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>Submitting Request...</span>
                  </div>
                ) : (
                  <>
                    <Zap className="size-4 text-amber-300 transition-transform group-hover:scale-110" />
                    <span>Confirm & Book Demo</span>
                    <ChevronRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-2 pt-1 text-[11px] text-slate-400">
                <ShieldCheck className="size-3.5 text-purple-400" />
                <span>Direct notification sent to the owner • 100% Free & No obligation</span>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
