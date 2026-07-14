"use client";

import { useEffect, useRef } from "react";
import { useWebsocket } from "@/websocket/client";

type UseWebsocketEventOptions = {
  includeSystemEvents?: boolean;
};

const SYSTEM_EVENT_TYPES = new Set(["connected", "subscribed", "unsubscribed", "heartbeat"]);

export default function useWebsocketEvent<T = any>(
  event: string,
  handler: (payload: T) => void,
  options: UseWebsocketEventOptions = {},
) {
  const ws = useWebsocket();
  const handlerRef = useRef(handler);
  const includeSystemEvents = options.includeSystemEvents ?? false;

  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  useEffect(() => {
    const unsub = ws.subscribe(event, ((payload: T) => {
      if (!includeSystemEvents && payload && typeof payload === "object") {
        const record = payload as Record<string, unknown>;
        const type = typeof record.type === "string" ? record.type.toLowerCase() : "";
        const hasData = typeof record.data !== "undefined";
        if (SYSTEM_EVENT_TYPES.has(type) && !hasData) {
          return;
        }
      }
      handlerRef.current(payload);
    }) as any);
    return () => unsub();
  }, [ws, event, includeSystemEvents]);
}
