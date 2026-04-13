"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

interface PullToRefreshProps {
  onRefresh: () => void | Promise<void>;
  threshold?: number;
  children: ReactNode;
  className?: string;
}

/**
 * PullToRefresh — overscroll-at-top gesture for mobile web.
 *
 * TODO(per-page): wire this on concrete pages that need pull-to-refresh
 * (feed, messages list, notifications). Usage:
 *
 *   <PullToRefresh onRefresh={async () => { await refetch(); }}>
 *     <YourScrollableContent />
 *   </PullToRefresh>
 *
 * The wrapped container applies `overscroll-behavior-y: contain` so the
 * browser's native pull chrome doesn't fight our gesture.
 */
export function PullToRefresh({
  onRefresh,
  threshold = 70,
  children,
  className = "",
}: PullToRefreshProps) {
  const ref = useRef<HTMLDivElement>(null);
  const startY = useRef<number | null>(null);
  const [pull, setPull] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const onTouchStart = (e: TouchEvent) => {
      if (el.scrollTop <= 0 && !refreshing) {
        startY.current = e.touches[0].clientY;
      } else {
        startY.current = null;
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (startY.current == null) return;
      const dy = e.touches[0].clientY - startY.current;
      if (dy > 0 && el.scrollTop <= 0) {
        // Dampened pull distance
        setPull(Math.min(dy * 0.5, threshold * 1.5));
      }
    };

    const onTouchEnd = async () => {
      if (startY.current == null) return;
      const current = pull;
      startY.current = null;
      if (current >= threshold && !refreshing) {
        setRefreshing(true);
        setPull(threshold);
        try {
          await onRefresh();
        } finally {
          setRefreshing(false);
          setPull(0);
        }
      } else {
        setPull(0);
      }
    };

    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: true });
    el.addEventListener("touchend", onTouchEnd, { passive: true });
    el.addEventListener("touchcancel", onTouchEnd, { passive: true });

    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
      el.removeEventListener("touchcancel", onTouchEnd);
    };
  }, [onRefresh, pull, refreshing, threshold]);

  const progress = Math.min(pull / threshold, 1);

  return (
    <div
      ref={ref}
      className={`relative overflow-y-auto [overscroll-behavior-y:contain] ${className}`}
      style={{ WebkitOverflowScrolling: "touch" }}
    >
      <div
        aria-hidden={!refreshing && pull === 0}
        className="pointer-events-none absolute left-0 right-0 top-0 flex items-center justify-center"
        style={{
          height: `${pull}px`,
          transition: startY.current == null ? "height 200ms ease" : undefined,
        }}
      >
        {(refreshing || pull > 0) && (
          <div
            className={`h-6 w-6 rounded-full border-2 border-neutral-300 border-t-brand-600 ${
              refreshing ? "animate-spin" : ""
            }`}
            style={{
              opacity: progress,
              transform: `rotate(${progress * 360}deg)`,
            }}
            role="status"
            aria-label="Actualisation"
          />
        )}
      </div>
      <div
        style={{
          transform: `translateY(${pull}px)`,
          transition: startY.current == null ? "transform 200ms ease" : undefined,
        }}
      >
        {children}
      </div>
    </div>
  );
}
