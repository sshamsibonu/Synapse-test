import { cn } from "@/lib/utils";
import { NeuronField } from "@/components/brand/neuron-field";

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  className?: string;
}

export function PageHeader({ eyebrow, title, description, className }: PageHeaderProps) {
  return (
    <div className={cn("relative overflow-hidden border-b border-border/60 bg-grid", className)}>
      <div className="pointer-events-none absolute inset-0">
        <NeuronField className="opacity-70" />
      </div>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-background/40 via-background/70 to-background" />
      <div className="relative mx-auto max-w-4xl px-4 py-20 text-center sm:px-6">
        {eyebrow && (
          <p className="text-sm font-medium uppercase tracking-wider text-primary">
            {eyebrow}
          </p>
        )}
        <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">{title}</h1>
        {description && (
          <p className="mx-auto mt-4 max-w-2xl text-balance text-lg text-muted-foreground">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}
