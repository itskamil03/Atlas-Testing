// components/LayoutWrapper.tsx
"use client"; // This is required to read the URL

import Header from '@/app/Header';
import { usePathname } from 'next/navigation';
import { HeroHeader } from './header';

// 1. Define the interface for your props
interface LayoutWrapperProps {
  children: React.ReactNode;
}

// 2. Apply the type to your component arguments
export default function LayoutWrapper({ children }: LayoutWrapperProps) {
  const pathname = usePathname();
  
  // Check if the current URL contains "/dashboard"
  const isDashboard = pathname?.startsWith('/dashboard');

  return (
    <div className="flex flex-col min-h-screen">
      {/* Conditionally render the Header */}
      {isDashboard ? <Header /> : <HeroHeader />}
      
      {/* The actual page content */}
      <main className={`flex-grow ${isDashboard ? '' : 'pt-24 sm:pt-28 md:pt-32 lg:pt-36'}`}>
        {children}
      </main>

      {/* Conditionally render the Footer */}
      {/* {isDashboard ? <DashboardFooter /> : <LandingFooter />} */}
    </div>
  );
}