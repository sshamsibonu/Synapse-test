"use client";

import * as React from "react";

/**
 * A hairline reading indicator across the top of an article.
 *
 * Deliberately thin and unlabelled — it answers "how much is left" at a
 * glance without behaving like a dashboard. Hidden from assistive tech and
 * from anyone who prefers reduced motion.
 */
export function ReadingProgress() {
  const [progress, setProgress] = React.useState(0);
  const [enabled, setEnabled] = React.useState(false);

  React.useEffect(() => {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    setEnabled(true);

    let frame = 0;
    const update = () => {
      frame = 0;
      const doc = document.documentElement;
      const scrollable = doc.scrollHeight - doc.clientHeight;
      setProgress(scrollable > 0 ? Math.min(1, doc.scrollTop / scrollable) : 0);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  if (!enabled) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-16 z-40 h-px bg-transparent"
    >
      <div
        className="h-px origin-left bg-primary/60 transition-transform duration-150 ease-out"
        style={{ transform: `scaleX(${progress})` }}
      />
    </div>
  );
}
