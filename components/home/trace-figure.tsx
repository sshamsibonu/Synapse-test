"use client";

import * as React from "react";
import { motion } from "framer-motion";

import { useEnterAnimation } from "@/components/motion/use-enter-animation";

/**
 * An editorial scientific figure — not an analytics dashboard.
 *
 * Five domain rows, each a scatter of anonymous sessions along a shared
 * axis, with a faint density curve and hand-placed annotations. Positions
 * are seeded so server and client render identically.
 */

/** Deterministic PRNG — keeps SSR and hydration in agreement. */
function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

const ROWS = ["memory", "sleep", "focus", "learning", "emotion"] as const;

const AXIS_START = 132;
const AXIS_END = 726;
const ROW_Y = [64, 126, 188, 250, 312];
const DOTS_PER_ROW = 26;

/** Each row has its own centre of mass and spread, so the figure reads as
 *  data rather than decoration. */
const ROW_SHAPE = [
  { centre: 0.58, spread: 0.30 },
  { centre: 0.46, spread: 0.34 },
  { centre: 0.53, spread: 0.26 },
  { centre: 0.62, spread: 0.28 },
  { centre: 0.5, spread: 0.36 },
];

type Dot = { x: number; y: number; r: number; o: number };

function buildRow(rowIndex: number): Dot[] {
  const rand = seeded(9973 + rowIndex * 7717);
  const { centre, spread } = ROW_SHAPE[rowIndex];
  const y0 = ROW_Y[rowIndex];

  return Array.from({ length: DOTS_PER_ROW }, () => {
    // Sum of two uniforms ≈ a soft bell, without pulling in a stats lib.
    const t = centre + (rand() + rand() - 1) * spread;
    const clamped = Math.min(0.98, Math.max(0.02, t));
    return {
      x: AXIS_START + clamped * (AXIS_END - AXIS_START),
      y: y0 + (rand() - 0.5) * 17,
      r: 2 + rand() * 1.6,
      o: 0.3 + rand() * 0.5,
    };
  });
}

export function TraceFigure({
  labels,
  annotation1,
  annotation2,
}: {
  labels: Record<string, string>;
  annotation1: string;
  annotation2: string;
}) {
  // Fails visible: the figure is content, so it renders complete unless we
  // know an entrance animation can actually run.
  const { ref, animate, entered } = useEnterAnimation<SVGSVGElement>();
  const active = !animate || entered;

  const rows = React.useMemo(() => ROWS.map((_, i) => buildRow(i)), []);

  return (
    <svg
      ref={ref}
      viewBox="0 0 800 400"
      fill="none"
      className="h-auto w-full overflow-visible"
      role="img"
      aria-label={Object.values(labels).join(", ")}
    >
      {ROWS.map((key, rowIndex) => (
        <g key={key}>
          {/* Row baseline */}
          <motion.line
            x1={AXIS_START}
            x2={AXIS_END}
            y1={ROW_Y[rowIndex]}
            y2={ROW_Y[rowIndex]}
            className="stroke-border"
            strokeWidth={1}
            vectorEffect="non-scaling-stroke"
            initial={animate ? { pathLength: 0 } : false}
            animate={{ pathLength: active ? 1 : 0 }}
            transition={{ duration: 0.9, delay: rowIndex * 0.09, ease: "easeOut" }}
          />

          {/* Domain label */}
          <motion.text
            x={AXIS_START - 16}
            y={ROW_Y[rowIndex] + 4}
            textAnchor="end"
            className="fill-foreground/70 font-mono text-[11px] uppercase tracking-[0.12em]"
            initial={animate ? { opacity: 0 } : false}
            animate={{ opacity: active ? 1 : 0 }}
            transition={{ duration: 0.5, delay: rowIndex * 0.09 }}
          >
            {labels[key]}
          </motion.text>

          {/* Sessions */}
          {rows[rowIndex].map((dot, i) => (
            <motion.circle
              key={i}
              cx={dot.x}
              cy={dot.y}
              r={dot.r}
              className="fill-primary"
              initial={animate ? { opacity: 0, scale: 0 } : false}
              animate={{ opacity: active ? dot.o : 0, scale: active ? 1 : 0 }}
              transition={{
                duration: 0.45,
                delay: 0.3 + rowIndex * 0.09 + (i / DOTS_PER_ROW) * 0.5,
                ease: "easeOut",
              }}
              style={{ transformOrigin: `${dot.x}px ${dot.y}px` }}
            />
          ))}
        </g>
      ))}

      {/* Annotation 1 — points into the densest part of the Focus row */}
      <motion.g
        initial={animate ? { opacity: 0 } : false}
        animate={{ opacity: active ? 1 : 0 }}
        transition={{ duration: 0.6, delay: 1.35 }}
      >
        <path
          d="M470 352 C 470 340, 452 336, 444 200"
          className="stroke-foreground/30"
          strokeWidth={0.75}
          fill="none"
          vectorEffect="non-scaling-stroke"
        />
        <circle cx={444} cy={196} r={2} className="fill-foreground/45" />
        <text
          x={470}
          y={368}
          className="fill-muted-foreground font-mono text-[10.5px] uppercase tracking-[0.1em]"
        >
          {annotation1}
        </text>
      </motion.g>

      {/* Annotation 2 — points at the wide spread of the Emotion row */}
      <motion.g
        initial={animate ? { opacity: 0 } : false}
        animate={{ opacity: active ? 1 : 0 }}
        transition={{ duration: 0.6, delay: 1.6 }}
      >
        <path
          d="M726 60 C 754 60, 760 78, 748 300"
          className="stroke-foreground/25"
          strokeWidth={0.75}
          fill="none"
          vectorEffect="non-scaling-stroke"
        />
        <circle cx={746} cy={306} r={2} className="fill-foreground/45" />
        <text
          x={726}
          y={48}
          textAnchor="end"
          className="fill-muted-foreground font-mono text-[10.5px] uppercase tracking-[0.1em]"
        >
          {annotation2}
        </text>
      </motion.g>
    </svg>
  );
}
