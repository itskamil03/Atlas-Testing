"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { clearTokens, getAccessToken } from "@/lib/auth";
import { Logo } from "@/components/logo";
import { ThemeToggleButton } from "@/components/ThemeToggleButton";
import { api } from "@/lib/api";
import { getAdminRoute, setAdminViewMode } from "@/lib/adminRoutes";
import type { UserProfile } from "@/lib/types";

interface HeaderProps {
  displayName?: string;
}

const navLinks = [
  { name: "Dashboard", path: "/dashboard" },
  { name: "Strategies", path: "/dashboard/strategies" },
  { name: "Broker", path: "/dashboard/broker" },
  { name: "Subscription", path: "/dashboard/subscription" },
  { name: "Academy", path: "/dashboard/academy" },
  { name: "Notification", path: "/dashboard/notifications" },
];

export default function Header({ displayName = "Trader" }: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [viewMode, setViewMode] = useState<string | null>(null);

  useEffect(() => {
    if (getAccessToken()) {
      api.get<UserProfile>("/auth/me")
        .then((res) => {
          if (res.data.role === "admin") {
            setIsAdmin(true);
            setViewMode(sessionStorage.getItem("viewMode") ?? "admin");
          }
        })
        .catch(() => {});
    }
  }, [pathname]);

  const onLogout = () => {
    clearTokens();
    router.push("/login");
  };

  const getNavLinkPath = (name: string, defaultPath: string) => {
    if (isAdmin && viewMode === "admin") {
      if (name === "Dashboard") return getAdminRoute("overview");
      if (name === "Strategies") return getAdminRoute("strategies");
      if (name === "Academy") return getAdminRoute("academy");
      if (name === "Notification") return getAdminRoute("notifications");
    }
    return defaultPath;
  };

  const isLinkActive = (name: string, defaultPath: string) => {
    if (isAdmin && viewMode === "admin") {
      if (pathname !== "/dashboard/admin") return false;
      const searchParams = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
      const activeTab = searchParams.get("tab") ?? "overview";
      if (name === "Dashboard") return activeTab === "overview";
      if (name === "Strategies") return activeTab === "strategies";
      if (name === "Academy") return activeTab === "academy";
      if (name === "Notification") return activeTab === "notifications";
      return false;
    }
    return pathname === defaultPath || pathname.startsWith(`${defaultPath}/`);
  };

  return (
    <header className="w-full border-b border-gray-200 dark:border-[#1B222B] bg-white dark:bg-[#06090E] px-6 py-3 shadow-sm dark:shadow-none">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
        {/* Logo Section - Left */}
        <div className="flex items-center">
          <Link
            href="/dashboard"
            aria-label="Dashboard"
            className="flex items-center gap-2 transition-opacity hover:opacity-80"
          >
            <Logo className="h-9 w-auto" />
          </Link>
        </div>

        {/* Navigation Links - Center (Hidden on Mobile) */}
        <nav className="hidden md:flex items-center gap-5 text-sm">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              href={getNavLinkPath(link.name, link.path)}
              className={`transition-colors duration-200 ${
                isLinkActive(link.name, link.path)
                  ? "font-semibold text-gray-900 dark:text-[#F7FAFD]"
                  : "text-gray-500 dark:text-[#8D98A5] hover:text-gray-700 dark:hover:text-[#DEE6EE]"
              }`}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Right Section - Theme Toggle, User Menu, Mobile Toggle */}
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

          {/* Mobile Menu Toggle Button (Visible only on Mobile) */}
          <button
            type="button"
            onClick={() => setShowMobileMenu((current) => !current)}
            className="flex md:hidden rounded-lg border border-gray-200 dark:border-[#26303A] p-2 text-gray-500 dark:text-[#AEB8C4] hover:bg-gray-100 dark:hover:bg-[#10151D] transition-all duration-200 active:scale-95"
            aria-label="Toggle navigation menu"
          >
            {showMobileMenu ? (
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
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
                  <p className="text-xs text-gray-500 dark:text-[#8D98A5]">{isAdmin ? "Admin" : "Trader"}</p>
                </div>
                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowProfileMenu(false);
                      if (typeof window !== "undefined") {
                        sessionStorage.setItem("viewMode", "admin");
                      }
                      router.push("/dashboard/admin");
                    }}
                    className="mt-1 w-full rounded-lg px-3 py-2 text-left text-sm font-bold text-[#9BFF00] hover:bg-gray-100 dark:hover:bg-[#111822] transition-colors duration-200"
                  >
                    Admin Panel
                  </button>
                )}
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

      {/* Mobile Navigation Dropdown Menu */}
      {showMobileMenu && (
        <nav className="flex md:hidden flex-col gap-2 border-t border-gray-100 dark:border-[#1B222B] mt-3 pt-3 bg-white dark:bg-[#06090E]">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              href={getNavLinkPath(link.name, link.path)}
              onClick={() => setShowMobileMenu(false)}
              className={`transition-colors duration-200 py-2 px-3 rounded-lg text-sm ${
                isLinkActive(link.name, link.path)
                  ? "font-semibold bg-emerald-600/10 text-emerald-400"
                  : "text-gray-500 dark:text-[#8D98A5] hover:bg-gray-100 dark:hover:bg-[#111822] hover:text-gray-700 dark:hover:text-[#DEE6EE]"
              }`}
            >
              {link.name}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}