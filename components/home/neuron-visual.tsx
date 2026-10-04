"use client";

import { motion, useReducedMotion } from "framer-motion";

const NODES = [
  { x: 60, y: 80 }, { x: 180, y: 40 }, { x: 300, y: 100 }, { x: 420, y: 50 },
  { x: 520, y: 130 }, { x: 100, y: 200 }, { x: 240, y: 220 }, { x: 380, y: 190 },
  { x: 480, y: 260 }, { x: 160, y: 320 }, { x: 320, y: 340 }, { x: 440, y: 300 },
];

const EDGES: [number, number][] = [
  [0, 1], [1, 2], [2, 3], [3, 4], [1, 5], [2, 6], [3, 7], [4, 8],
  [5, 6], [6, 7], [7, 8], [5, 9], [6, 10], [7, 11], [9, 10], [10, 11],
];

export function NeuronVisual() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <svg
      viewBox="0 0 580 400"
      className="h-full w-full"
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="synapse-edge" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.5" />
          <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.5" />
        </linearGradient>
      </defs>
      {EDGES.map(([a, b], i) => (
        <motion.line
          key={`edge-${i}`}
          x1={NODES[a].x}
          y1={NODES[a].y}
          x2={NODES[b].x}
          y2={NODES[b].y}
          stroke="url(#synapse-edge)"
          strokeWidth={1}
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.2, delay: i * 0.04, ease: "easeOut" }}
        />
      ))}
      {NODES.map((node, i) => (
        <motion.circle
          key={`node-${i}`}
          cx={node.x}
          cy={node.y}
          r={5}
          className="fill-primary"
          initial={{ scale: 0, opacity: 0 }}
          animate={
            shouldReduceMotion
              ? { scale: 1, opacity: 0.9 }
              : { scale: [0, 1.3, 1], opacity: [0, 1, 0.85, 1, 0.85] }
          }
          transition={
            shouldReduceMotion
              ? { duration: 0.4, delay: i * 0.06 }
              : {
                  duration: 3,
                  delay: i * 0.15,
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
