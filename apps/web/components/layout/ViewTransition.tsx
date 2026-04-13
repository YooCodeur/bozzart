"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, type ReactNode } from "react";

/**
 * ViewTransition — progressive-enhancement route transition wrapper.
 *
 * Uses the View Transitions API when available (Chromium 111+).
 * Falls back to a simple CSS fade on path change otherwise.
 */
export function ViewTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const prev = useRef(pathname);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (prev.current === pathname) return;
    prev.current = pathname;

    const el = ref.current;
    if (!el) return;

    const doc = document as Document & {
      startViewTransition?: (cb: () => void) => { finished: Promise<void> };
    };

    if (typeof doc.startViewTransition === "function") {
      // The page already transitioned (Next did the swap); we just trigger
      // a light re-render animation for progressive enhancement.
      doc.startViewTransition(() => {
        el.style.opacity = "1";
      });
      return;
    }

    // Fallback: manual fade
    el.style.opacity = "0";
    const raf = requestAnimationFrame(() => {
      el.style.transition = "opacity 200ms ease";
      el.style.opacity = "1";
    });
    return () => cancelAnimationFrame(raf);
  }, [pathname]);

  return (
    <div ref={ref} style={{ opacity: 1 }}>
      {children}
    </div>
  );
}
