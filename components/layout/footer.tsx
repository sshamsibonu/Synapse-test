import { getTranslations } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import { LogoMark } from "@/components/brand/logo-mark";

export async function Footer() {
  const t = await getTranslations();

  const columns: { title: string; links: { href: string; label: string }[] }[] = [
    {
      title: t("footer.platform"),
      links: [
        { href: "/tests", label: t("nav.tests") },
        { href: "/lessons", label: t("nav.lessons") },
        { href: "/articles", label: t("nav.articles") },
        { href: "/dashboard", label: t("nav.dashboard") },
      ],
    },
    {
      title: t("footer.company"),
      links: [
        { href: "/about", label: t("nav.about") },
        { href: "/faq", label: t("nav.faq") },
        { href: "/contact", label: t("footer.contact") },
      ],
    },
    {
      title: t("footer.legal"),
      links: [{ href: "/privacy", label: t("footer.privacyPolicy") }],
    },
  ];

  return (
    <footer className="border-t border-border/60">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 md:grid-cols-[2fr_1fr_1fr_1fr]">
          <div>
            <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
              <LogoMark className="size-6" />
              <span>Synapse</span>
            </Link>
            <p className="mt-3 max-w-sm text-sm text-muted-foreground">
              {t("footer.tagline")}
            </p>
          </div>
          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="text-sm font-medium">{col.title}</h3>
              <ul className="mt-3 space-y-2">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-10 flex flex-col gap-2 border-t border-border/60 pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>{t("footer.copyright", { year: new Date().getFullYear() })}</p>
          <p>{t("footer.disclaimer")}</p>
        </div>
      </div>
    </footer>
  );
}
