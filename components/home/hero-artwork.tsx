"use client";

import * as React from "react";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";
import { useCanAnimate } from "@/components/motion/use-enter-animation";

/**
 * The full-bleed hero artwork: one large synaptic field.
 *
 * Two loose clusters of nodes with a deliberate gap between them — the
 * synaptic cleft — and signals crossing it. This consolidates what used to be
 * three competing hero visuals into a single commissioned-feeling piece that
 * can run edge to edge behind the masthead.
 *
 * Drawn in brand ink at low contrast rather than glowing neon, and it renders
 * complete when animation is unavailable.
 */

type Node = { x: number; y: number; r: number };

// Hand-placed rather than generated: the eye should read a composition.
const LEFT: Node[] = [
  { x: 168, y: 208, r: 3 },
  { x: 262, y: 118, r: 2.2 },
  { x: 300, y: 296, r: 3.6 },
  { x: 402, y: 196, r: 2.6 },
  { x: 438, y: 372, r: 2.4 },
  { x: 208, y: 430, r: 2.8 },
  { x: 520, y: 268, r: 4.2 },
  { x: 560, y: 452, r: 2.2 },
  { x: 352, y: 508, r: 2.6 },
  { x: 118, y: 328, r: 2 },
  { x: 596, y: 158, r: 2.4 },
];

const RIGHT: Node[] = [
  { x: 1010, y: 254, r: 3.4 },
  { x: 1078, y: 140, r: 2.4 },
  { x: 1136, y: 366, r: 2.8 },
  { x: 1244, y: 226, r: 4 },
  { x: 1290, y: 428, r: 2.4 },
  { x: 1382, y: 300, r: 2.6 },
  { x: 1178, y: 512, r: 2.2 },
  { x: 1440, y: 168, r: 2.2 },
  { x: 1470, y: 402, r: 2.8 },
  { x: 1042, y: 456, r: 2.4 },
];

const LEFT_EDGES: [number, number][] = [
  [0, 1], [0, 2], [1, 3], [2, 3], [2, 5], [3, 6], [4, 6], [2, 4],
  [5, 8], [4, 8], [6, 7], [7, 8], [0, 9], [9, 5], [1, 10], [10, 6],
];

const RIGHT_EDGES: [number, number][] = [
  [0, 1], [0, 2], [1, 3], [2, 3], [3, 5], [2, 4], [4, 5], [4, 6],
  [2, 6], [5, 7], [1, 7], [5, 8], [0, 9], [9, 6],
];

/** The cleft: signals leaving the left cluster and arriving at the right. */
const CROSSINGS: { from: Node; to: Node; duration: number; delay: number }[] = [
  { from: LEFT[6], to: RIGHT[0], duration: 3.2, delay: 0 },
  { from: LEFT[10], to: RIGHT[1], duration: 3.6, delay: 1.4 },
  { from: LEFT[7], to: RIGHT[9], duration: 3.4, delay: 2.6 },
];

function Cluster({
  nodes,
  edges,
  canAnimate,
  seed,
}: {
  nodes: Node[];
  edges: [number, number][];
  canAnimate: boolean;
  seed: number;
}) {
  return (
    <g>
      {edges.map(([a, b], i) => (
        <line
          key={i}
          x1={nodes[a].x}
          y1={nodes[a].y}
          x2={nodes[b].x}
          y2={nodes[b].y}
          className="stroke-primary/20"
          strokeWidth={1}
          vectorEffect="non-scaling-stroke"
        />
      ))}
      {nodes.map((n, i) => (
        <motion.circle
          key={i}
          cx={n.x}
          cy={n.y}
          r={n.r}
          className="fill-primary/70"
          initial={false}
          animate={canAnimate ? { opacity: [0.4, 0.85, 0.4] } : { opacity: 0.7 }}
          transition={
            canAnimate
              ? {
                  duration: 4 + ((i + seed) % 5) * 0.7,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: ((i * 7 + seed) % 11) * 0.31,
                }
              : undefined
          }
        />
      ))}
    </g>
  );
}

export function HeroArtwork({ className }: { className?: string }) {
  const canAnimate = useCanAnimate();

  return (
    <svg
      viewBox="0 0 1600 640"
      fill="none"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      className={cn("h-full w-full", className)}
    >
      <Cluster nodes={LEFT} edges={LEFT_EDGES} canAnimate={canAnimate} seed={0} />
      <Cluster nodes={RIGHT} edges={RIGHT_EDGES} canAnimate={canAnimate} seed={5} />

      {/* Terminals either side of the cleft */}
      <circle cx={648} cy={286} r={3} className="fill-accent/70" />
      <circle cx={952} cy={262} r={3} className="fill-accent/70" />

      {canAnimate &&
        CROSSINGS.map(({ from, to, duration, delay }, i) => (
          <motion.circle
            key={i}
            r={3}
            className="fill-accent"
            initial={{ cx: from.x, cy: from.y, opacity: 0 }}
            animate={{
              cx: [from.x, to.x],
              cy: [from.y, to.y],
              opacity: [0, 0.9, 0.9, 0],
            }}
            transition={{
              duration,
              delay,
              repeat: Infinity,
              repeatDelay: 2.2,
              ease: "easeInOut",
              opacity: {
                duration,
                delay,
                repeat: Infinity,
                repeatDelay: 2.2,
                times: [0, 0.12, 0.88, 1],
              },
            }}
          />
        ))}
    </svg>
  );
}
