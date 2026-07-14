import React from "react";
import QueryProvider from "./QueryProvider";
import { WebsocketProvider } from "@/websocket/client";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <WebsocketProvider>{children}</WebsocketProvider>
    </QueryProvider>
  );
}