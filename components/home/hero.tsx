import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { ArrowRight } from "lucide-react";

import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { HeroArtwork } from "@/components/home/hero-artwork";
import { resolvePublicImage } from "@/lib/images";

/**
 * Publication-style opening: a full-bleed visual band running edge to edge
 * under the masthead, a credit line, then the story itself — category,
 * headline, deck. The picture arrives before the words, the way it does on
 * the front of a science magazine.
 *
 * The band takes a photograph if one exists at the expected path, and
 * otherwise runs the synaptic-field artwork.
 */
export async function Hero() {
  const t = await getTranslations("home.hero");
  const banner = resolvePublicImage("images/homepage_img/00_hero_background.jpg");

  const terms = ["memory", "attention", "sleep", "learning", "emotion"] as const;

  return (
    // Pulled up by the height of the bar so the picture runs behind it; the
    // band grows by the same amount to keep the visible area unchanged.
    <section className="relative -mt-16 border-b border-border">
      {/* Full-bleed band */}
      <div className="relative h-[calc(46vh+4rem)] min-h-[364px] w-full overflow-hidden bg-secondary/40 lg:h-[calc(56vh+4rem)]">
        {banner ? (
          <>
            {/* Pulled most of the way to greyscale first, so the duotone has
                clean luminance to work with rather than fighting the
                original hue. */}
            <Image
              src={banner}
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-cover object-center saturate-[0.18] brightness-[0.92] contrast-[1.06]"
            />
            {/* Duotone: take hue and saturation from the brand indigo and
                luminance from the photograph, so the band belongs to the
                palette instead of sitting on top of it. */}
            <div className="absolute inset-0 bg-primary mix-blend-color opacity-[0.72]" />
            {/* Settle the shadows toward ink rather than pure black */}
            <div className="absolute inset-0 bg-foreground/10 mix-blend-multiply" />
          </>
        ) : (
          <>
            <div className="paper absolute inset-0 opacity-70" />
            <HeroArtwork />
          </>
        )}
        {/* Guarantees contrast for the overlaid navigation, whatever the
            picture happens to be doing behind it. */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/80 via-black/45 to-transparent" />
        {/* Settles the band into the page rather than ending on a hard edge */}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background to-transparent" />
      </div>

      {/* Credit, set small and right — a magazine caption. Only shown for
          artwork we made; a supplied image needs its own attribution, which
          we must not invent. */}
      {!banner && (
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <p className="annotation mt-3 text-right text-muted-foreground">{t("credit")}</p>
        </div>
      )}

      {/* The story */}
      <div className="mx-auto max-w-6xl px-4 pb-20 pt-10 sm:px-6 lg:pb-28 lg:pt-14">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-8">
            <p className="annotation inline-block border-b border-primary/40 pb-1 text-primary">
              {t("eyebrow")}
            </p>

            <h1 className="display gradient-text mt-6 text-[2.75rem] leading-[1.03] sm:text-6xl lg:text-[4.5rem]">
              {t("title")}
            </h1>

            <p className="mt-7 max-w-2xl text-xl leading-relaxed text-muted-foreground">
              {t("subtitle")}
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link href="/tests">
                <Button size="lg" className="h-11 w-full px-6 text-base sm:w-auto">
                  {t("ctaPrimary")}
                  <ArrowRight />
                </Button>
              </Link>
              <Link href="/about">
                <Button
                  size="lg"
                  variant="outline"
                  className="h-11 w-full px-6 text-base sm:w-auto"
                >
                  {t("ctaSecondary")}
                </Button>
              </Link>
            </div>

            <p className="annotation mt-8">{t("note")}</p>
          </div>

          {/* Sidebar: the five domains, set as a contents list */}
          <aside className="lg:col-span-4 lg:border-l lg:border-border lg:pl-10">
            <p className="annotation text-muted-foreground">{t("indexLabel")}</p>
            <ul className="mt-5">
              {terms.map((term, i) => (
                <li key={term} className="border-t border-border">
                  <Link
                    href="/articles"
                    className="group flex items-baseline gap-4 py-3.5 transition-colors hover:text-primary"
                  >
                    <span className="annotation tabular-nums text-muted-foreground">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="display text-xl">{t(`terms.${term}`)}</span>
                  </Link>
                </li>
              ))}
              <li className="border-t border-border" />
            </ul>
          </aside>
        </div>
      </div>
    </section>
  );
}
