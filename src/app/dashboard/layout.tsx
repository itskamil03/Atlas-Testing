"use client";

import React from "react";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div style={{ zoom: 0.90 }}>
      {children}
    </div>
  );
}
