import type { DomainScores } from "@/types/database";

function clamp(value: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, value));
}

/** Maps a mean reaction time in ms to a 0-100 score. ~250ms -> ~98, ~450ms -> ~65, ~700ms -> ~23. */
export function reactionTimeToScore(meanMs: number): number {
  return Math.round(clamp(100 - (meanMs - 200) / 6));
}

export function scoreSimpleReactionTime(trialMs: number[]): DomainScores {
  const valid = trialMs.filter((t) => t > 0);
  const mean = valid.reduce((a, b) => a + b, 0) / (valid.length || 1);
  return { reaction_time: reactionTimeToScore(mean) };
}

export function scoreStroop(trials: { correct: boolean; ms: number }[]): DomainScores {
  const accuracy = trials.filter((t) => t.correct).length / (trials.length || 1);
  const correctTrials = trials.filter((t) => t.correct);
  const meanMs =
    correctTrials.reduce((a, b) => a + b.ms, 0) / (correctTrials.length || 1);
  const speedScore = reactionTimeToScore(meanMs);
  const attention = Math.round(clamp(accuracy * 70 + speedScore * 0.3));
  const executive_function = Math.round(clamp(accuracy * 100));
  return { attention, executive_function };
}

export function scoreNBack(trials: { isTarget: boolean; responded: boolean }[]): DomainScores {
  const hits = trials.filter((t) => t.isTarget && t.responded).length;
  const falseAlarms = trials.filter((t) => !t.isTarget && t.responded).length;
  const correctRejections = trials.filter((t) => !t.isTarget && !t.responded).length;
  const total = trials.length || 1;
  const accuracy = (hits + correctRejections) / total;
  const penalty = falseAlarms * 4;
  const working_memory = Math.round(clamp(accuracy * 100 - penalty));
  return { working_memory };
}

export function scoreDigitSpan(maxCorrectSpan: number): DomainScores {
  const processing_speed = Math.round(clamp(((maxCorrectSpan - 2) / 7) * 100));
  return { processing_speed };
}
