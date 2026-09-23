'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home, Shield, Sparkles, Terminal, Activity, Layers } from 'lucide-react';

// Friendly segment label mapping
const SEGMENT_NAME_MAP: Record<string, string> = {
  dashboard: 'Dashboard',
  features: 'Features',
  academy: 'Academy',
  pricing: 'Pricing & Plans',
  about: 'About Us',
  contact: 'Contact Us',
  services: 'Services',
  engine: 'Engine AI',
  'engine-think': 'See the Engine Think',
  'privacy-policy': 'Privacy Policy',
  'terms-and-conditions': 'Terms & Conditions',
  login: 'Sign In',
  signup: 'Create Account',
  'forgot-password': 'Reset Password',
  strategies: 'Trading Strategies',
  'automated-strategies': 'Automated Strategies',
  broker: 'Broker Integration',
  subscription: 'Billing & Plan',
  notifications: 'Notifications',
  profile: 'My Profile',
  settings: 'Settings',
  kyc: 'KYC Verification',
  backtesting: 'Strategy Backtester',
  admin: 'Admin Console',
  logs: 'System Logs',
  signals: 'Live Signals',
  trades: 'Executed Trades',
  overview: 'Overview',
};

// Segment icon mapping
const SEGMENT_ICON_MAP: Record<string, React.ReactNode> = {
  engine: <Sparkles className="w-3.5 h-3.5 text-purple-400" />,
  'engine-think': <Sparkles className="w-3.5 h-3.5 text-purple-400" />,
  admin: <Shield className="w-3.5 h-3.5 text-amber-400" />,
  logs: <Terminal className="w-3.5 h-3.5 text-cyan-400" />,
  signals: <Activity className="w-3.5 h-3.5 text-emerald-400" />,
  strategies: <Layers className="w-3.5 h-3.5 text-purple-400" />,
};

function formatSegment(segment: string): string {
  const lower = segment.toLowerCase();
  if (SEGMENT_NAME_MAP[lower]) {
    return SEGMENT_NAME_MAP[lower];
  }

  // Handle IDs or special tags
  if (/^\d+$/.test(segment)) {
    return `#${segment}`;
  }

  // Hyphen/underscore to Title Case
  return segment
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export default function Breadcrumbs() {
  const pathname = usePathname();

  // Do not show breadcrumbs on the root landing page
  if (!pathname || pathname === '/') {
    return null;
  }

  // Split path into clean segments
  const segments = pathname.split('/').filter(Boolean);

  if (segments.length === 0) {
    return null;
  }

  const isDashboard = pathname.startsWith('/dashboard');

  // Build breadcrumb trails
  const items = segments.map((segment, index) => {
    const href = '/' + segments.slice(0, index + 1).join('/');
    const isLast = index === segments.length - 1;
    const label = formatSegment(segment);
    const icon = SEGMENT_ICON_MAP[segment.toLowerCase()];

    return {
      href,
      label,
      isLast,
      segment,
      icon,
    };
  });

  const SITE_URL = 'https://atlastrading.com';

  // Generate Structured Data (JSON-LD) for SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: SITE_URL,
      },
      ...items.map((item, idx) => ({
        '@type': 'ListItem',
        position: idx + 2,
        name: item.label,
        item: `${SITE_URL}${item.href}`,
      })),
    ],
  };

  return (
    <nav
      aria-label="Breadcrumb"
      className={`w-full z-20 transition-all ${
        isDashboard
          ? 'px-4 sm:px-6 lg:px-8 pt-4 pb-2'
          : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-2'
      }`}
    >
      {/* Schema.org Structured Data */}
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="flex items-center flex-wrap gap-2 text-xs sm:text-sm font-sans text-slate-400">
        {/* Home Item */}
        <Link
          href={isDashboard ? '/dashboard' : '/'}
          className="inline-flex items-center gap-1.5 text-slate-400 hover:text-purple-300 transition-colors duration-150 group"
          title={isDashboard ? 'Dashboard Home' : 'Home'}
        >
          <Home className="w-3.5 h-3.5 text-slate-500 group-hover:text-purple-400 transition-colors" />
          <span className="font-medium">{isDashboard ? 'Dashboard' : 'Home'}</span>
        </Link>

        {/* Dynamic Trail Items */}
        {items.map((item, index) => {
          // If we're on dashboard and the first item is 'dashboard', skip duplicating it since Home points to it
          if (isDashboard && index === 0 && item.segment === 'dashboard') {
            return null;
          }

          return (
            <React.Fragment key={item.href}>
              <ChevronRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />

              {item.isLast ? (
                <span
                  aria-current="page"
                  className="inline-flex items-center gap-1.5 text-white font-medium"
                >
                  {item.icon}
                  <span className="truncate max-w-[220px] sm:max-w-xs">{item.label}</span>
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="inline-flex items-center gap-1.5 text-slate-400 hover:text-purple-300 transition-colors duration-150"
                >
                  {item.icon}
                  <span className="truncate max-w-[160px]">{item.label}</span>
                </Link>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </nav>
  );
}
