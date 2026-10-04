import { EditorialImage } from "@/components/media/editorial-image";
import { SynapticThread } from "@/components/brand/synaptic-thread";
import { cn } from "@/lib/utils";

/**
 * An article cover that works with or without photography.
 *
 * Until covers are supplied, every article falls back to the same typographic
 * treatment — a ruled field carrying the category and title. The rule is that
 * the fallback is applied consistently, so the catalogue never looks like some
 * articles were finished and others abandoned.
 */
export function ArticleCover({
  src,
  alt,
  category,
  categoryKey,
  ratio = "3 / 2",
  focal = "50% 50%",
  sizes,
  priority = false,
  className,
}: {
  src: string | null;
  alt: string;
  category: string;
  categoryKey?: string;
  ratio?: string;
  focal?: string;
  sizes?: string;
  priority?: boolean;
  className?: string;
}) {
  if (src) {
    return (
      <EditorialImage
        src={src}
        alt={alt}
        ratio={ratio}
        focal={focal}
        sizes={sizes}
        priority={priority}
        className={className}
        frameClassName="transition-[filter] duration-700 group-hover:brightness-[1.04]"
      />
    );
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden border border-border bg-secondary/40",
        className
      )}
      style={{ aspectRatio: ratio }}
    >
      {/* Ruled paper, so the empty cover still reads as a printed object */}
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.5]"
        style={{
          backgroundImage:
            "linear-gradient(to bottom, color-mix(in oklch, var(--border) 70%, transparent) 1px, transparent 1px)",
          backgroundSize: "100% 2.25rem",
        }}
      />
      {/* The title always appears next to the cover, so the placeholder
          carries the category and the brand thread instead of repeating it. */}
      <div className="relative flex h-full flex-col justify-between p-6 sm:p-8">
        <span className={cn("annotation", categoryKey && `cat-${categoryKey}`)}>
          {category}
        </span>
        <SynapticThread
          variant="branch"
          className="h-12 w-full max-w-[14rem] text-primary/25"
          showNodes={false}
        />
      </div>
    </div>
  );
}
