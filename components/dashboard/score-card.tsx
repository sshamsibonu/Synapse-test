import { Card, CardContent } from "@/components/ui/card";

export function ScoreCard({
  label,
  score,
  isStrength,
  isWeakness,
  strengthLabel,
  weaknessLabel,
}: {
  label: string;
  score: number;
  isStrength?: boolean;
  isWeakness?: boolean;
  strengthLabel: string;
  weaknessLabel: string;
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{label}</p>
          {isStrength && (
            <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2 py-0.5 text-xs font-medium text-emerald-400">
              {strengthLabel}
            </span>
          )}
          {isWeakness && (
            <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-2 py-0.5 text-xs font-medium text-amber-400">
              {weaknessLabel}
            </span>
          )}
        </div>
        <p className="mt-2 text-3xl font-semibold tabular-nums">{score}</p>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
            style={{ width: `${Math.max(4, Math.min(100, score))}%` }}
          />
        </div>
      </CardContent>
    </Card>
  );
}
