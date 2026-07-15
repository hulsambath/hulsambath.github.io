"use client";

import * as React from "react";

import { wsBase } from "./apiBase";
import { needsRefetchForEvent, parseRealtimeMessage, patchMatchVersion, shouldProcessMatchEvent } from "./realtime";
import type { Match } from "./types";

type WsStatus = "live" | "connecting" | "offline";

export function usePredictorSocket({
  selectedDate,
  today,
  visibleMatchIds,
  selectedMatchId,
  matches,
  onPatch,
  onRefreshDay,
}: {
  selectedDate: string;
  today: string;
  visibleMatchIds: number[];
  selectedMatchId: number | null;
  matches: Match[] | null;
  onPatch: (next: Match[]) => void;
  onRefreshDay: () => void;
}): WsStatus {
  const [status, setStatus] = React.useState<WsStatus>("connecting");
  const refreshTimer = React.useRef<number | null>(null);

  const scheduleRefresh = React.useCallback(() => {
    if (refreshTimer.current != null) return;
    refreshTimer.current = window.setTimeout(() => {
      refreshTimer.current = null;
      onRefreshDay();
    }, 150);
  }, [onRefreshDay]);

  React.useEffect(() => {
    let active = true;
    let socket: WebSocket | null = null;
    let heartbeatTimer: number | null = null;
    let reconnectTimer: number | null = null;
    let attempt = 0;

    const subscribe = () => {
      const ids = new Set<number>(visibleMatchIds);
      if (selectedMatchId != null) ids.add(selectedMatchId);
      if (ids.size === 0 || !socket || socket.readyState !== WebSocket.OPEN) return;
      socket.send(JSON.stringify({ action: "subscribe", matches: [...ids] }));
    };

    const resetHeartbeat = () => {
      if (heartbeatTimer != null) window.clearTimeout(heartbeatTimer);
      heartbeatTimer = window.setTimeout(() => {
        socket?.close();
      }, 45_000);
    };

    const connect = () => {
      setStatus("connecting");
      socket = new WebSocket(`${wsBase()}/ws/matches`);
      socket.onopen = () => {
        attempt = 0;
        setStatus("live");
        subscribe();
        resetHeartbeat();
      };
      socket.onmessage = (event) => {
        resetHeartbeat();
        const message = parseRealtimeMessage(event.data);
        if (!message) return;
        if (message.type === "heartbeat") return;
        if (!matches || !shouldProcessMatchEvent(message)) return;
        if (selectedDate === today && needsRefetchForEvent(matches, message)) {
          scheduleRefresh();
          return;
        }
        onPatch(patchMatchVersion(matches, message));
      };
      socket.onerror = () => setStatus("offline");
      socket.onclose = () => {
        setStatus("offline");
        if (!active) return;
        attempt += 1;
        const backoff = Math.min(10_000, 500 * (2 ** attempt));
        const jitter = Math.round(Math.random() * 250);
        reconnectTimer = window.setTimeout(connect, backoff + jitter);
      };
    };

    connect();

    return () => {
      active = false;
      if (heartbeatTimer != null) window.clearTimeout(heartbeatTimer);
      if (reconnectTimer != null) window.clearTimeout(reconnectTimer);
      if (refreshTimer.current != null) {
        window.clearTimeout(refreshTimer.current);
        refreshTimer.current = null;
      }
      socket?.close();
    };
  }, [matches, onPatch, scheduleRefresh, selectedDate, selectedMatchId, today, visibleMatchIds]);

  return status;
}
