"use client";

import { useEffect, useRef } from "react";

type Props = {
  children: React.ReactNode;
};

function shouldEnableAutoScroll(): boolean {
  if (typeof window === "undefined") return false;
  const params = new URLSearchParams(window.location.search);
  return (
    params.get("autoscroll") === "1" ||
    params.get("autoscroll") === "true" ||
    params.get("demo") === "scroll"
  );
}

export function AutoScrollDemo({ children }: Props) {
  const rafIdRef = useRef<number | null>(null);
  const activeRef = useRef(false);

  useEffect(() => {
    if (!shouldEnableAutoScroll()) return;

    activeRef.current = true;

    const params = new URLSearchParams(window.location.search);
    const speedPxPerSec = Number(params.get("speed") ?? "280"); // px/s
    const loop = (params.get("loop") ?? "1") !== "0";
    const pauseMsAtEnds = Number(params.get("pause") ?? "800");

    let lastTs = performance.now();
    let pausedUntil: number | null = null;
    let direction: 1 | -1 = 1;

    const stop = () => {
      activeRef.current = false;
      if (rafIdRef.current != null) cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    };

    const stopEvents: Array<keyof WindowEventMap> = [
      "wheel",
      "touchstart",
      "keydown",
      "mousedown",
    ];
    const onUserIntent = () => stop();
    stopEvents.forEach((evt) =>
      window.addEventListener(evt, onUserIntent, { passive: true })
    );

    const tick = (ts: number) => {
      if (!activeRef.current) return;

      if (pausedUntil != null) {
        if (ts < pausedUntil) {
          rafIdRef.current = requestAnimationFrame(tick);
          return;
        }
        pausedUntil = null;
        lastTs = ts;
      }

      const dtSec = Math.max(0, (ts - lastTs) / 1000);
      lastTs = ts;

      const maxScroll =
        document.documentElement.scrollHeight - window.innerHeight;
      const y = window.scrollY;

      const nextY = y + direction * speedPxPerSec * dtSec;

      if (direction === 1 && nextY >= maxScroll) {
        window.scrollTo({ top: maxScroll, behavior: "smooth" });
        if (!loop) return stop();
        direction = -1;
        pausedUntil = ts + pauseMsAtEnds;
      } else if (direction === -1 && nextY <= 0) {
        window.scrollTo({ top: 0, behavior: "smooth" });
        direction = 1;
        pausedUntil = ts + pauseMsAtEnds;
      } else {
        window.scrollTo({ top: nextY, behavior: "auto" });
      }

      rafIdRef.current = requestAnimationFrame(tick);
    };

    rafIdRef.current = requestAnimationFrame(tick);

    return () => {
      stop();
      stopEvents.forEach((evt) => window.removeEventListener(evt, onUserIntent));
    };
  }, []);

  return <>{children}</>;
}
