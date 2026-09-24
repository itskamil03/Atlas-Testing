// components/LayoutWrapper.tsx
"use client"; // This is required to read the URL

import Header from '@/app/Header';
import { usePathname } from 'next/navigation';
import { HeroHeader } from './header';
import Breadcrumbs from './Breadcrumbs';

// 1. Define the interface for your props
interface LayoutWrapperProps {
  children: React.ReactNode;
}

// 2. Apply the type to your component arguments
export default function LayoutWrapper({ children }: LayoutWrapperProps) {
  const pathname = usePathname();
  
  // Check if the current URL contains "/dashboard"
  const isDashboard = pathname?.startsWith('/dashboard');
  // Hide navbar on admin page
  const isAdminPage = pathname?.startsWith('/dashboard/admin');

  return (
    <div className="flex flex-col min-h-0 lg:min-h-screen">
      {/* Conditionally render the Header - hidden on admin page */}
      {isDashboard && !isAdminPage ? <Header /> : isAdminPage ? null : <HeroHeader />}
      
      {/* The actual page content */}
      <main className={`grow ${isDashboard ? '' : 'pt-[76px] sm:pt-[86px] md:pt-[102px]'}`}>
        <Breadcrumbs />
        {children}
      </main>

      {/* Conditionally render the Footer */}
      {/* {isDashboard ? <DashboardFooter /> : <LandingFooter />} */}
    </div>
  );
}