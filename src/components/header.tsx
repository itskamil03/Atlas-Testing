'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { useBookDemoStore } from '@/store/useBookDemoStore';

const navItems = [
  { name: 'Home', href: '/' },
  { name: 'Engine AI', href: '/engine' },
  { name: 'Features', href: '/features' },
  { name: 'Academy', href: '/academy' },
  { name: 'Pricing', href: '/pricing' },
  { name: 'About', href: '/about' },
  { name: 'Contact', href: '/contact' },
];

export const HeroHeader = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const pathname = usePathname();
  const openDemoModal = useBookDemoStore((s) => s.openDemoModal);

  const linksContainerRef = useRef<HTMLDivElement>(null);
  const indicatorRef = useRef<HTMLSpanElement>(null);

  const isActiveLink = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const moveIndicatorTo = (el: HTMLElement) => {
    if (!linksContainerRef.current || !indicatorRef.current) return;
    const containerRect = linksContainerRef.current.getBoundingClientRect();
    const targetRect = el.getBoundingClientRect();
    indicatorRef.current.style.left = `${targetRect.left - containerRect.left}px`;
    indicatorRef.current.style.width = `${targetRect.width}px`;
    indicatorRef.current.style.opacity = '1';
  };

  const resetIndicatorToActive = () => {
    if (!linksContainerRef.current || !indicatorRef.current) return;
    const activeEl = linksContainerRef.current.querySelector<HTMLElement>('[data-active="true"]');
    if (activeEl) {
      moveIndicatorTo(activeEl);
    } else {
      indicatorRef.current.style.opacity = '0';
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(totalHeight > 0 ? (currentScrollY / totalHeight) * 100 : 0);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    resetIndicatorToActive();
    setMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  return (
    <header className="atlas-header-wrapper">
      <style jsx global>{`
        :root {
          --atlas-bg-void: #07030f;
          --atlas-bg-panel: #120a28;
          --atlas-bg-panel-2: #170e33;
          --atlas-line: rgba(155, 120, 255, 0.16);
          --atlas-line-strong: rgba(170, 130, 255, 0.32);
          --atlas-violet: #8b5cf6;
          --atlas-magenta: #d946ef;
          --atlas-gold: #f2b544;
          --atlas-up: #34d399;
          --atlas-down: #f87171;
          --atlas-text-hi: #f4f1ff;
          --atlas-text-mid: #b6afd6;
          --atlas-text-lo: #7c7599;
          --atlas-grad-brand: linear-gradient(133deg, #7c3aed 0%, #c026d3 100%);
        }

        .atlas-header-wrapper {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          width: 100%;
          z-index: 50;
        }

        .atlas-nav {
          position: relative;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: calc(4px + 0.15in) clamp(20px, 4.5vw, 64px);
          background: rgba(7, 3, 15, 0.92);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-bottom: 1px solid var(--atlas-line);
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          box-shadow: 0 4px 24px rgba(0, 0, 0, 0.45);
        }

        .atlas-brand {
          display: flex;
          align-items: center;
          gap: 12px;
          font-weight: 500;
          font-size: 22px;
          letter-spacing: 0.05em;
          color: var(--atlas-text-hi);
          font-family: 'Bodoni Moda', 'Times New Roman', serif;
          cursor: pointer;
          user-select: none;
        }

        .atlas-navlinks {
          display: flex;
          gap: 30px;
          font-size: 15.5px;
          color: var(--atlas-text-mid);
          position: relative;
          font-family: 'Inter', sans-serif;
        }

        .atlas-navlinks a {
          position: relative;
          padding-bottom: 4px;
          transition: color 0.2s;
          color: var(--atlas-text-mid);
          text-decoration: none;
        }

        .atlas-navlinks a:hover,
        .atlas-navlinks a[data-active="true"] {
          color: var(--atlas-text-hi);
        }

        .atlas-nav-indicator {
          position: absolute;
          bottom: -1px;
          height: 2px;
          border-radius: 2px;
          background: var(--atlas-grad-brand);
          box-shadow: 0 0 10px rgba(190, 90, 240, 0.8);
          transition: left 0.28s cubic-bezier(0.2, 0.7, 0.2, 1),
            width 0.28s cubic-bezier(0.2, 0.7, 0.2, 1), opacity 0.2s;
          opacity: 0;
          pointer-events: none;
        }

        .atlas-navcta {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .atlas-btn {
          font-family: 'Inter', sans-serif;
          font-size: 14.5px;
          font-weight: 600;
          padding: 8px 18px;
          border-radius: 10px;
          border: 1px solid var(--atlas-line-strong);
          cursor: pointer;
          transition: border-color 0.2s, transform 0.2s, box-shadow 0.2s, background 0.2s;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          line-height: 1.4;
        }

        .atlas-btn-ghost {
          color: var(--atlas-text-hi);
          background: transparent;
        }

        .atlas-btn-ghost:hover {
          border-color: var(--atlas-violet);
          background: rgba(139, 92, 246, 0.12);
        }

        .atlas-btn-brand {
          background: var(--atlas-grad-brand);
          color: #fff;
          border: none;
          box-shadow: 0 4px 18px rgba(168, 60, 220, 0.35);
        }

        .atlas-btn-brand:hover {
          box-shadow: 0 8px 26px rgba(168, 60, 220, 0.55);
          transform: translateY(-1px);
        }

        .atlas-btn-demo {
          color: #fce7f3;
          background: rgba(217, 70, 239, 0.14);
          border: 1px solid rgba(217, 70, 239, 0.4);
        }

        .atlas-btn-demo:hover {
          background: rgba(217, 70, 239, 0.25);
          border-color: rgba(217, 70, 239, 0.7);
          box-shadow: 0 0 14px rgba(217, 70, 239, 0.4);
        }

        @media (max-width: 1024px) {
          .atlas-navlinks {
            display: none;
          }
          .atlas-nav {
            padding: 12px 20px;
          }
        }

        @media (max-width: 640px) {
          .atlas-nav {
            padding: 10px 14px;
          }
        }
      `}</style>

      {/* Top Scroll Progress bar */}
      <div className="fixed top-0 left-0 z-50 h-[3px] w-full bg-transparent pointer-events-none">
        <div
          className="h-full bg-gradient-to-r from-purple-500 via-fuchsia-500 to-amber-400 transition-all duration-100 ease-out shadow-[0_0_8px_rgba(217,70,239,0.8)]"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Main Navbar */}
      <nav className="atlas-nav">
        {/* Brand */}
        <Link href="/" className="flex items-center cursor-pointer py-0 overflow-visible shrink-0" onClick={() => setMobileMenuOpen(false)}>
          <Image
            src="/LOGO.png?v=4"
            alt="ATLAS"
            width={280}
            height={80}
            className="h-10 sm:h-12 md:h-16 w-auto object-contain max-w-[140px] sm:max-w-[200px] md:max-w-none transition-transform duration-200 hover:scale-105"
            priority
            unoptimized
          />
        </Link>

        {/* Desktop Navlinks with interactive indicator */}
        <div
          className="atlas-navlinks"
          ref={linksContainerRef}
          onMouseLeave={resetIndicatorToActive}
        >
          {navItems.map((item) => {
            const active = isActiveLink(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                data-nav
                data-active={active ? 'true' : 'false'}
                onMouseEnter={(e) => moveIndicatorTo(e.currentTarget)}
              >
                {item.name}
              </Link>
            );
          })}
          <span className="atlas-nav-indicator" ref={indicatorRef} />
        </div>

        {/* Desktop CTAs */}
        <div className="hidden lg:flex atlas-navcta">
          <Link href="/login" className="atlas-btn atlas-btn-ghost">
            Login
          </Link>
          <Link href="/signup" className="atlas-btn atlas-btn-brand">
            Get Started
          </Link>
          <button
            type="button"
            onClick={openDemoModal}
            className="atlas-btn atlas-btn-demo"
          >
            Book A Demo
          </button>
        </div>

        {/* Mobile Action Controls */}
        <div className="flex items-center gap-2 lg:hidden shrink-0">
          <button
            type="button"
            onClick={openDemoModal}
            className="atlas-btn atlas-btn-demo !text-xs !py-1.5 !px-2.5 sm:!px-3 font-semibold shrink-0"
          >
            Book Demo
          </button>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-[#b6afd6] hover:text-[#f4f1ff] transition rounded-lg border border-[rgba(155,120,255,0.2)] bg-[rgba(18,10,40,0.7)] active:scale-95 shrink-0"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>

        {/* Mobile Backdrop & Drawer Menu */}
        {mobileMenuOpen && (
          <>
            <div
              className="lg:hidden fixed inset-0 top-0 bg-black/60 backdrop-blur-sm z-30 transition-opacity"
              onClick={() => setMobileMenuOpen(false)}
              aria-hidden="true"
            />
            <div className="lg:hidden absolute inset-x-0 top-full z-40 bg-[#0c061d]/98 backdrop-blur-2xl border-b border-[rgba(155,120,255,0.25)] px-6 py-6 shadow-[0_20px_50px_rgba(0,0,0,0.8)] max-h-[calc(100vh-76px)] overflow-y-auto animate-in slide-in-from-top-2 duration-200">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5 pb-4 border-b border-[rgba(155,120,255,0.16)]">
                  {navItems.map((item) => {
                    const active = isActiveLink(item.href);
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`py-2.5 px-3.5 rounded-xl text-base font-medium transition duration-150 flex items-center justify-between ${
                          active
                            ? 'bg-purple-600/20 text-[#f4f1ff] font-semibold border-l-2 border-fuchsia-400 shadow-sm'
                            : 'text-[#b6afd6] hover:text-[#f4f1ff] hover:bg-white/5'
                        }`}
                      >
                        <span>{item.name}</span>
                        {active && <span className="w-1.5 h-1.5 rounded-full bg-fuchsia-400 shadow-[0_0_8px_#e879f9]" />}
                      </Link>
                    );
                  })}
                </div>
                <div className="flex flex-col gap-2.5 pt-1">
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="atlas-btn atlas-btn-ghost w-full justify-center !py-2.5 !text-sm"
                  >
                    Login
                  </Link>
                  <Link
                    href="/signup"
                    onClick={() => setMobileMenuOpen(false)}
                    className="atlas-btn atlas-btn-brand w-full justify-center !py-2.5 !text-sm"
                  >
                    Get Started
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      openDemoModal();
                    }}
                    className="atlas-btn atlas-btn-demo w-full justify-center !py-2.5 !text-sm"
                  >
                    Book A Demo
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </nav>
    </header>
  );
};