"use client";

import React from "react";
import QueryProvider from "./QueryProvider";
import { WebsocketProvider } from "@/websocket/client";
import { ThemeProvider } from "next-themes";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <QueryProvider>
        <WebsocketProvider>{children}</WebsocketProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}