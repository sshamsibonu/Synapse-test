"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect;

/**
 * Scroll reveal that fails visible.
 *
 * The server-rendered markup is fully opaque, so readers without JavaScript,
 * on a slow connection before hydration, or with reduced motion enabled all
 * get the content immediately. The hidden starting state is only applied on
 * the client, in a layout effect (before paint, so there is no flash), and
 * only when we know we can actually animate out of it.
 */
export function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [hidden, setHidden] = React.useState(false);

  useIsomorphicLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const prefersReduced = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    // If we can't animate reliably, leave the content visible as rendered.
    if (
      prefersReduced ||
      document.hidden ||
      typeof IntersectionObserver === "undefined"
    ) {
      return;
    }

    // Already in view on first paint — no reason to hide and re-show it.
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.92) return;

    setHidden(true);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHidden(false);
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -8% 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={cn("reveal", hidden && "reveal-hidden", className)}
      style={delay ? ({ "--reveal-delay": `${delay}s` } as React.CSSProperties) : undefined}
    >
      {children}
    </div>
  );
}
