"use client";

import * as React from "react";

import { useEnterAnimation } from "@/components/motion/use-enter-animation";

/**
 * A restrained count-up for research figures.
 *
 * Renders the *final* value by default, so the server HTML and any client
 * that can't animate always show the correct number — an unanimated counter
 * stuck on 0 would be worse than no animation, because it states something
 * untrue.
 */
export function CountUp({
  to,
  suffix = "",
  duration = 1400,
  className,
}: {
  to: number;
  suffix?: string;
  duration?: number;
  className?: string;
}) {
  const { ref, animate, entered } = useEnterAnimation<HTMLSpanElement>();
  const [value, setValue] = React.useState(to);

  // Only drop to zero once we know we can actually count back up.
  React.useEffect(() => {
    if (animate) setValue(0);
  }, [animate]);

  React.useEffect(() => {
    if (!animate || !entered) return;

    let frame = 0;
    const start = performance.now();

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
      setValue(Math.round(eased * to));
      if (t < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [animate, entered, to, duration]);

  return (
    <span ref={ref} className={className}>
      {value}
      {suffix}
    </span>
  );
}
