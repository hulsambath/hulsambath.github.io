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
  const socketRef = React.useRef<WebSocket | null>(null);
  const refreshTimer = React.useRef<number | null>(null);
 
  // Keep mutable refs for values the WS callbacks read but that should NOT
  // cause the effect to reconnect when they change.
  const matchesRef = React.useRef(matches);
  matchesRef.current = matches;
  const onPatchRef = React.useRef(onPatch);
  onPatchRef.current = onPatch;
  const onRefreshDayRef = React.useRef(onRefreshDay);
  onRefreshDayRef.current = onRefreshDay;
  const selectedDateRef = React.useRef(selectedDate);
  selectedDateRef.current = selectedDate;
  const todayRef = React.useRef(today);
  todayRef.current = today;
 
  const scheduleRefresh = React.useCallback(() => {
    if (refreshTimer.current != null) return;
    refreshTimer.current = window.setTimeout(() => {
      refreshTimer.current = null;
      onRefreshDayRef.current();
    }, 150);
  }, []);
 
  // Subscription helper
  const sendSubscribe = React.useCallback(() => {
    const socket = socketRef.current;
    if (!socket || socket.readyState !== WebSocket.OPEN) return;
    const ids = new Set<number>(visibleMatchIds.filter((n) => !isNaN(n) && n > 0));
    if (selectedMatchId != null) ids.add(selectedMatchId);
    if (ids.size === 0) return;
    console.log("[WS] Sending subscribe message for matches:", [...ids]);
    socket.send(JSON.stringify({ action: "subscribe", matches: [...ids] }));
  }, [visibleMatchIds, selectedMatchId]);

  const sendSubscribeRef = React.useRef(sendSubscribe);
  sendSubscribeRef.current = sendSubscribe;
 
  // WebSocket Connection Lifecycle (Connects once on mount)
  React.useEffect(() => {
    let active = true;
    let heartbeatTimer: number | null = null;
    let reconnectTimer: number | null = null;
    let attempt = 0;
 
    const resetHeartbeat = () => {
      if (heartbeatTimer != null) window.clearTimeout(heartbeatTimer);
      heartbeatTimer = window.setTimeout(() => {
        console.warn("[WS] Heartbeat timeout, closing connection");
        socketRef.current?.close();
      }, 45_000);
    };
 
    const connect = () => {
      console.log("[WS] Connecting to WebSocket...");
      setStatus("connecting");
      const socket = new WebSocket(`${wsBase()}/ws/matches`);
      socketRef.current = socket;
 
      socket.onopen = () => {
        console.log("[WS] Connected successfully!");
        attempt = 0;
        setStatus("live");
        resetHeartbeat();
        sendSubscribeRef.current();
      };
      socket.onmessage = (event) => {
        resetHeartbeat();
        const message = parseRealtimeMessage(event.data);
        if (!message) return;
        if (message.type === "heartbeat") return;
        console.log("[WS] Received message:", message);
        const currentMatches = matchesRef.current;
        if (!currentMatches || !shouldProcessMatchEvent(message)) return;
        if (selectedDateRef.current === todayRef.current && needsRefetchForEvent(currentMatches, message)) {
          console.log("[WS] Version mismatch, scheduling full refresh:", { message, matchesCount: currentMatches.length });
          scheduleRefresh();
          return;
        }
        console.log("[WS] Patching match version:", message.match_id, "to", message.version);
        onPatchRef.current(patchMatchVersion(currentMatches, message));
      };
      socket.onerror = (err) => {
        console.error("[WS] WebSocket error:", err);
        setStatus("offline");
      };
      socket.onclose = (evt) => {
        console.warn("[WS] WebSocket closed:", { code: evt.code, reason: evt.reason, wasClean: evt.wasClean });
        setStatus("offline");
        socketRef.current = null;
        if (!active) return;
        attempt += 1;
        const backoff = Math.min(10_000, 500 * (2 ** attempt));
        const jitter = Math.round(Math.random() * 250);
        console.log(`[WS] Reconnecting in ${backoff + jitter}ms...`);
        reconnectTimer = window.setTimeout(connect, backoff + jitter);
      };
    };
 
    connect();
 
    return () => {
      console.log("[WS] Tearing down connection...");
      active = false;
      if (heartbeatTimer != null) window.clearTimeout(heartbeatTimer);
      if (reconnectTimer != null) window.clearTimeout(reconnectTimer);
      if (refreshTimer.current != null) {
        window.clearTimeout(refreshTimer.current);
        refreshTimer.current = null;
      }
      socketRef.current?.close();
    };
  }, [scheduleRefresh]);
 
  // Dynamic Subscription Effect (Updates subscriptions without reconnecting the socket)
  React.useEffect(() => {
    sendSubscribe();
  }, [sendSubscribe]);
 
  return status;
}
