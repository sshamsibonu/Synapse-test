"use client";

import * as React from "react";
import { motion } from "framer-motion";

import { useEnterAnimation } from "@/components/motion/use-enter-animation";

/**
 * A network that slowly wires itself together — the visual argument for
 * "learning is coming": isolated points gradually finding each other.
 *
 * Scientifically inspired rather than literal: no glow, no particles, no
 * circuit-board right angles. Just points, uneven curves, and patience.
 */

type Node = { x: number; y: number; r: number };

const NODES: Node[] = [
  { x: 96, y: 128, r: 3.2 },
  { x: 186, y: 66, r: 2.4 },
  { x: 214, y: 178, r: 4 },
  { x: 300, y: 112, r: 2.8 },
  { x: 322, y: 226, r: 2.2 },
  { x: 402, y: 62, r: 3 },
  { x: 428, y: 162, r: 3.6 },
  { x: 508, y: 118, r: 2.6 },
  { x: 486, y: 232, r: 2.4 },
  { x: 590, y: 176, r: 3.2 },
  { x: 148, y: 244, r: 2.6 },
  { x: 606, y: 74, r: 2.2 },
];

/** Hand-picked edges with uneven curvature — a machine would draw them straight. */
const EDGES: { from: number; to: number; bow: number }[] = [
  { from: 0, to: 1, bow: -18 },
  { from: 0, to: 2, bow: 12 },
  { from: 1, to: 3, bow: -10 },
  { from: 2, to: 3, bow: 16 },
  { from: 2, to: 4, bow: -14 },
  { from: 3, to: 5, bow: -20 },
  { from: 3, to: 6, bow: 10 },
  { from: 4, to: 6, bow: 18 },
  { from: 5, to: 7, bow: -12 },
  { from: 6, to: 7, bow: 14 },
  { from: 6, to: 8, bow: -16 },
  { from: 7, to: 9, bow: 12 },
  { from: 8, to: 9, bow: -10 },
  { from: 0, to: 10, bow: -12 },
  { from: 10, to: 2, bow: 14 },
  { from: 5, to: 11, bow: 10 },
];

function curve(a: Node, b: Node, bow: number) {
  const mx = (a.x + b.x) / 2;
  const my = (a.y + b.y) / 2;
  // Offset the control point perpendicular to the chord.
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy) || 1;
  const cx = mx + (-dy / len) * bow;
  const cy = my + (dx / len) * bow;
  return `M${a.x} ${a.y} Q ${cx} ${cy} ${b.x} ${b.y}`;
}

export function FormingNetwork({ className }: { className?: string }) {
  const { ref, animate, entered } = useEnterAnimation<SVGSVGElement>();
  const active = !animate || entered;

  return (
    <svg
      ref={ref}
      viewBox="0 0 700 300"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      {EDGES.map((edge, i) => (
        <motion.path
          key={i}
          d={curve(NODES[edge.from], NODES[edge.to], edge.bow)}
          className="stroke-primary/30"
          strokeWidth={1}
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          initial={animate ? { pathLength: 0, opacity: 0 } : false}
          animate={{
            pathLength: active ? 1 : 0,
            opacity: active ? 1 : 0,
          }}
          transition={{
            duration: 1.6,
            // Connections form gradually, not all at once.
            delay: 0.6 + i * 0.28,
            ease: [0.33, 0.9, 0.35, 1],
          }}
        />
      ))}

      {NODES.map((node, i) => (
        <motion.circle
          key={i}
          cx={node.x}
          cy={node.y}
          r={node.r}
          className="fill-primary"
          initial={animate ? { opacity: 0, scale: 0.4 } : false}
          animate={{
            opacity: active ? 0.85 : 0,
            scale: active ? 1 : 0.4,
          }}
          transition={{ duration: 0.7, delay: i * 0.07, ease: "easeOut" }}
          style={{ transformOrigin: `${node.x}px ${node.y}px` }}
        />
      ))}
    </svg>
  );
}
