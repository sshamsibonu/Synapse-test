"use client";

import Image from "next/image";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";
import { useEnterAnimation } from "@/components/motion/use-enter-animation";

/**
 * The single image treatment for the whole site.
 *
 * Images arrive at wildly different sizes and aspect ratios, so nothing is
 * ever stretched: the frame owns the ratio, the photograph fills it via
 * object-fit, and `focal` decides what survives the crop. The reveal is a
 * slow settle rather than a slide — it should read as a page being printed,
 * not as a UI transition.
 */
export function EditorialImage({
  src,
  alt,
  /** CSS aspect-ratio for the frame, e.g. "3 / 2". The image crops into it. */
  ratio = "3 / 2",
  /** object-position — what stays in frame when the crop bites. */
  focal = "50% 50%",
  /** Rendered width hints for srcset. */
  sizes = "(min-width: 1024px) 45vw, 100vw",
  caption,
  className,
  frameClassName,
  priority = false,
}: {
  src: string;
  alt: string;
  ratio?: string;
  focal?: string;
  sizes?: string;
  caption?: string;
  className?: string;
  frameClassName?: string;
  priority?: boolean;
}) {
  const { ref, animate, entered } = useEnterAnimation<HTMLDivElement>();
  const active = !animate || entered;

  return (
    <figure ref={ref} className={cn("group", className)}>
      <div
        className={cn(
          "relative overflow-hidden bg-secondary",
          frameClassName
        )}
        style={{ aspectRatio: ratio }}
      >
        <motion.div
          className="absolute inset-0"
          initial={animate ? { scale: 1.06, opacity: 0 } : false}
          animate={{ scale: active ? 1 : 1.06, opacity: active ? 1 : 0 }}
          transition={{ duration: 1.1, ease: [0.22, 0.85, 0.3, 1] }}
        >
          <Image
            src={src}
            alt={alt}
            fill
            sizes={sizes}
            priority={priority}
            className="object-cover"
            style={{ objectPosition: focal }}
          />
        </motion.div>
      </div>

      {caption && (
        <figcaption className="annotation mt-3 normal-case tracking-normal text-muted-foreground">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
