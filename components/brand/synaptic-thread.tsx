"use client";

import * as React from "react";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";
import { useEnterAnimation } from "@/components/motion/use-enter-animation";

/**
 * The Synaptic Thread — Synapse's recurring brand signature.
 *
 * A thin, organic, slightly imperfect line that travels between sections,
 * branches, pauses at nodes, and reconnects. It reads as a hand-drawn
 * trace of a thought, deliberately *not* as a circuit board: no right
 * angles, no uniform spacing, no glow.
 *
 * It draws itself once when scrolled into view, then rests.
 */

export type ThreadVariant = "descend" | "branch" | "cross" | "arc";

/** Hand-tuned paths. Curves are uneven on purpose — a perfect curve reads
 *  as machine-made, which is exactly the feeling we're avoiding. */
const PATHS: Record<ThreadVariant, { d: string; viewBox: string; nodes: [number, number][] }> = {
  // A long vertical trace that drifts as it descends — used between sections.
  descend: {
    viewBox: "0 0 120 420",
    d: "M60 0 C 60 48, 44 70, 46 104 C 48 142, 74 158, 72 196 C 70 236, 44 250, 47 292 C 50 330, 66 344, 63 380 C 61 402, 60 410, 60 420",
    nodes: [
      [46, 104],
      [72, 196],
      [47, 292],
    ],
  },
  // Splits into two — one path continues, one tapers off. Question → two answers.
  branch: {
    viewBox: "0 0 260 160",
    d: "M0 92 C 44 92, 70 88, 96 74 C 118 62, 130 44, 152 38 C 176 31, 208 34, 260 30 M96 74 C 116 88, 132 108, 158 118 C 182 127, 212 128, 246 126",
    nodes: [
      [96, 74],
      [152, 38],
      [158, 118],
    ],
  },
  // Travels horizontally with a deliberate gap — the synaptic cleft itself.
  cross: {
    viewBox: "0 0 480 80",
    d: "M0 42 C 52 42, 88 36, 130 30 C 168 25, 194 22, 214 21 M266 21 C 292 22, 320 27, 356 33 C 400 40, 440 42, 480 40",
    nodes: [
      [214, 21],
      [266, 21],
    ],
  },
  // A wide shallow arc — used under headings and around imagery.
  arc: {
    viewBox: "0 0 400 120",
    d: "M0 104 C 62 96, 104 60, 158 40 C 214 19, 268 22, 316 38 C 352 50, 378 68, 400 84",
    nodes: [
      [158, 40],
      [316, 38],
    ],
  },
};

export function SynapticThread({
  variant = "descend",
  className,
  showNodes = true,
  delay = 0,
}: {
  variant?: ThreadVariant;
  className?: string;
  showNodes?: boolean;
  delay?: number;
}) {
  // Fails visible, like the rest of the motion system.
  const { ref, animate, entered } = useEnterAnimation<SVGSVGElement>();
  const active = !animate || entered;

  const { d, viewBox, nodes } = PATHS[variant];

  return (
    <svg
      ref={ref}
      viewBox={viewBox}
      fill="none"
      aria-hidden="true"
      preserveAspectRatio="xMidYMid meet"
      className={cn("pointer-events-none overflow-visible", className)}
    >
      <motion.path
        d={d}
        stroke="currentColor"
        strokeWidth={1}
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
        initial={animate ? { pathLength: 0 } : false}
        animate={{ pathLength: active ? 1 : 0 }}
        transition={{ duration: 2.1, delay, ease: [0.33, 0.9, 0.35, 1] }}
      />

      {showNodes &&
        nodes.map(([cx, cy], i) => (
          <motion.circle
            key={`${cx}-${cy}`}
            cx={cx}
            cy={cy}
            r={2.5}
            fill="currentColor"
            initial={animate ? { opacity: 0, scale: 0 } : false}
            animate={{ opacity: active ? 1 : 0, scale: active ? 1 : 0 }}
            transition={{
              duration: 0.5,
              // Nodes light up as the line reaches them.
              delay: delay + 0.5 + i * 0.55,
              ease: "easeOut",
            }}
          />
        ))}
    </svg>
  );
}
