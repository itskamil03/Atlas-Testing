// components/ProgressBar.tsx
"use client";

import { AppProgressBar } from 'next-nprogress-bar';

export default function ProgressBar() {
  return (
    <AppProgressBar 
      height="3px"
      color="#10b981"
      startPosition={0.2}
      stopDelay={180}
      delay={80}
      options={{ showSpinner: false }}
      shallowRouting
    />
  );
}