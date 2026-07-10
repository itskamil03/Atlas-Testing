"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { clearTokens } from "@/lib/auth";
import { Logo } from "@/components/logo";
import { ThemeToggleButton } from "@/components/ThemeToggleButton";

interface HeaderProps {
  displayName?: string;
}

const navLinks = [
  { name: "Dashboard", path: "/dashboard" },
  { name: "Strategies", path: "/dashboard/strategies" },
  { name: "Subscription", path: "/dashboard/subscription" },
  { name: "Academy", path: "/dashboard/academy" },
  { name: "Notification", path: "/dashboard/notifications" },
];

export default function Header({ displayName = "Trader" }: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const onLogout = () => {
    clearTokens();
    router.push("/login");
  };

  return (
    <header className="rounded-2xl border border-gray-200 dark:border-[#1B222B] bg-white dark:bg-[#06090E] px-16 py-4  shadow-sm dark:shadow-none">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Logo Section - Left */}
        <div className="flex items-center">
          <Link
            href="/dashboard"
            aria-label="Dashboard"
            className="flex items-center gap-2 transition-opacity hover:opacity-80"
          >
            <Logo className="h-16 w-auto" />
          </Link>
        </div>

        {/* Navigation Links - Center */}
        <nav className="flex items-center gap-5 text-sm">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              href={link.path}
              className={`transition-colors duration-200 ${
                pathname === link.path || pathname.startsWith(`${link.path}/`)
                  ? "font-semibold text-gray-900 dark:text-[#F7FAFD]"
                  : "text-gray-500 dark:text-[#8D98A5] hover:text-gray-700 dark:hover:text-[#DEE6EE]"
              }`}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Right Section - Theme Toggle & User Menu */}
        <div className="relative flex items-center gap-2">
          {/* Dark/Light Mode Toggle */}
          <ThemeToggleButton />

          {/* User Icon */}
          <button
            type="button"
            onClick={() => setShowProfileMenu((current) => !current)}
            className="rounded-full border border-gray-200 dark:border-[#26303A] p-2 text-gray-500 dark:text-[#AEB8C4] hover:bg-gray-100 dark:hover:bg-[#10151D] transition-all duration-200"
            aria-label="User menu"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="8" r="4" />
              <path d="M4 20c0-3.5 3.6-6 8-6s8 2.5 8 6" />
            </svg>
          </button>

          {/* Profile Dropdown Menu */}
          {showProfileMenu && (
            <>
              {/* Backdrop to close menu when clicking outside */}
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowProfileMenu(false)}
              />
              <div className="absolute right-0 top-12 z-20 w-56 rounded-xl border border-gray-200 dark:border-[#26303A] bg-white dark:bg-[#0B0F14] p-2 shadow-lg dark:shadow-[0_14px_40px_rgba(0,0,0,0.45)]">
                <div className="border-b border-gray-100 dark:border-[#1F2833] px-3 py-2">
                  <p className="text-sm font-semibold text-gray-900 dark:text-[#D5DEE8]">{displayName}</p>
                  <p className="text-xs text-gray-500 dark:text-[#8D98A5]">Trader</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowProfileMenu(false);
                    router.push("/dashboard/profile");
                  }}
                  className="mt-1 w-full rounded-lg px-3 py-2 text-left text-sm text-gray-700 dark:text-[#D5DEE8] hover:bg-gray-100 dark:hover:bg-[#111822] transition-colors duration-200"
                >
                  Profile Settings
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowProfileMenu(false);
                    router.push("/dashboard/notifications");
                  }}
                  className="w-full rounded-lg px-3 py-2 text-left text-sm text-gray-700 dark:text-[#D5DEE8] hover:bg-gray-100 dark:hover:bg-[#111822] transition-colors duration-200"
                >
                  Notifications
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowProfileMenu(false);
                    router.push("/dashboard/kyc");
                  }}
                  className="w-full rounded-lg px-3 py-2 text-left text-sm text-gray-700 dark:text-[#D5DEE8] hover:bg-gray-100 dark:hover:bg-[#111822] transition-colors duration-200"
                >
                  KYC Verification
                </button>
                <div className="my-1 border-t border-gray-100 dark:border-[#1F2833]" />
                <button
                  type="button"
                  onClick={onLogout}
                  className="w-full rounded-lg px-3 py-2 text-left text-sm text-red-500 dark:text-[#F87171] hover:bg-gray-100 dark:hover:bg-[#111822] transition-colors duration-200"
                >
                  Sign Out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
