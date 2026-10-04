"use client";

import * as React from "react";

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect;

/**
 * Decides whether an entrance animation should run at all, and reports when
 * the element has entered the viewport.
 *
 * The contract is deliberately "fails visible": `animate` starts false, so
 * server-rendered markup and any client that can't animate (reduced motion,
 * background tab, no IntersectionObserver) show the *final* state. Only when
 * we are confident we can animate — and the element is still off-screen, so
 * hiding it causes no flash — does `animate` flip to true.
 */
export function useEnterAnimation<T extends Element>() {
  const ref = React.useRef<T>(null);
  const [animate, setAnimate] = React.useState(false);
  const [entered, setEntered] = React.useState(false);

  useIsomorphicLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const prefersReduced = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (
      prefersReduced ||
      document.hidden ||
      typeof IntersectionObserver === "undefined"
    ) {
      return; // stay at final state
    }

    // Already visible on first paint — don't hide it just to re-show it.
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.92) return;

    setAnimate(true);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setEntered(true);
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -8% 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, animate, entered };
}

/**
 * Whether an entrance animation can run at all in this environment.
 * Components that are always on-screen (a hero figure) use this instead of
 * the viewport-gated hook, so they never sit stuck at a hidden start state.
 */
export function useCanAnimate() {
  const [canAnimate, setCanAnimate] = React.useState(false);

  useIsomorphicLayoutEffect(() => {
    const prefersReduced = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReduced || document.hidden) return;
    setCanAnimate(true);
  }, []);

  return canAnimate;
}
