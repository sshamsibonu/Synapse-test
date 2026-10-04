"use client";

import { motion, useReducedMotion } from "framer-motion";

import { cn } from "@/lib/utils";

const NODES = [
  { x: 40, y: 60 }, { x: 140, y: 30 }, { x: 230, y: 90 }, { x: 330, y: 40 },
  { x: 420, y: 100 }, { x: 520, y: 50 }, { x: 610, y: 110 }, { x: 700, y: 45 },
  { x: 790, y: 95 }, { x: 880, y: 35 }, { x: 970, y: 100 }, { x: 1060, y: 55 },
  { x: 1150, y: 90 }, { x: 90, y: 160 }, { x: 260, y: 190 }, { x: 470, y: 175 },
  { x: 650, y: 195 }, { x: 830, y: 170 }, { x: 1010, y: 190 }, { x: 1120, y: 160 },
];

const EDGES: [number, number][] = [
  [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 8], [8, 9], [9, 10], [10, 11], [11, 12],
  [0, 13], [2, 14], [4, 15], [6, 16], [8, 17], [10, 18], [12, 19],
  [13, 14], [14, 15], [15, 16], [16, 17], [17, 18], [18, 19],
];

export function NeuronField({ className }: { className?: string }) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <svg
      viewBox="0 0 1200 240"
      preserveAspectRatio="xMidYMid slice"
      className={cn("h-full w-full", className)}
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="neuron-field-edge" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.35" />
          <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.35" />
        </linearGradient>
      </defs>
      {EDGES.map(([a, b], i) => (
        <motion.line
          key={`edge-${i}`}
          x1={NODES[a].x}
          y1={NODES[a].y}
          x2={NODES[b].x}
          y2={NODES[b].y}
          stroke="url(#neuron-field-edge)"
          strokeWidth={1}
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.4, delay: i * 0.03, ease: "easeOut" }}
        />
      ))}
      {NODES.map((node, i) => (
        <motion.circle
          key={`node-${i}`}
          cx={node.x}
          cy={node.y}
          r={3}
          className="fill-primary"
          initial={{ scale: 0, opacity: 0 }}
          animate={
            shouldReduceMotion
              ? { scale: 1, opacity: 0.5 }
              : { scale: [0, 1.2, 1], opacity: [0, 0.6, 0.35, 0.6, 0.35] }
          }
          transition={
            shouldReduceMotion
              ? { duration: 0.4, delay: i * 0.04 }
              : {
                  duration: 3.5,
                  delay: i * 0.1,
                  repeat: Infinity,
                  repeatType: "reverse",
                  ease: "easeInOut",
                }
          }
        />
      ))}
    </svg>
  );
}
