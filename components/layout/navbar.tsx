"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { ArrowRight, Menu } from "lucide-react";

import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { AccountMenu } from "@/components/auth/account-menu";
import { LogoMark } from "@/components/brand/logo-mark";

export function Navbar() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);

  // Only the homepage opens on a full-bleed image, so only there does the bar
  // start transparent and sit on the picture.
  const overHero = pathname === "/";

  React.useEffect(() => {
    if (!overHero) return;
    const onScroll = () => setScrolled(window.scrollY > 32);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [overHero]);

  const overlay = overHero && !scrolled;

  const NAV_LINKS = [
    { href: "/tests", label: t("tests") },
    { href: "/articles", label: t("articles") },
    { href: "/lessons", label: t("lessons") },
    { href: "/about", label: t("about") },
  ];

  return (
    // Over the hero the bar borrows the dark palette, so every control inside
    // it reads against the picture without needing its own colour overrides.
    <header className={cn("sticky top-0 z-50 w-full", overlay && "dark")}>
      <div
        className={cn(
          "transition-colors duration-300",
          overlay
            ? "border-b border-transparent bg-transparent"
            : "glass border-b border-border"
        )}
      >
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          {/* Inherits body colour, which the dark class on the header does not
              override — so the overlay case needs stating explicitly. */}
          <Link
            href="/"
            className={cn(
              "flex items-center gap-2 font-semibold tracking-tight",
              overlay && "text-white"
            )}
          >
            <LogoMark className="size-7" />
            <span>Synapse</span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  overlay
                    ? "text-white/85 hover:text-white"
                    : "text-muted-foreground hover:text-foreground",
                  pathname === link.href && (overlay ? "text-white" : "text-foreground")
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className={cn("hidden items-center gap-2 md:flex", overlay && "text-white")}>
            <LanguageSwitcher />
            <ThemeToggle />
            <AccountMenu />
            <Link href="/dashboard">
              <Button variant="ghost">{t("dashboard")}</Button>
            </Link>
            <Link href="/tests">
              <Button>
                {t("startAssessment")}
                <ArrowRight />
              </Button>
            </Link>
          </div>

          <div className="flex items-center gap-1 md:hidden">
            <LanguageSwitcher />
            <ThemeToggle />
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger
                render={<Button variant="ghost" size="icon" aria-label={t("openMenu")} />}
              >
                <Menu className="size-5" />
              </SheetTrigger>
              <SheetContent side="right" className="w-72">
                <nav className="mt-10 flex flex-col gap-1">
                  {NAV_LINKS.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setOpen(false)}
                      className="rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  ))}
                  <Link
                    href="/dashboard"
                    onClick={() => setOpen(false)}
                    className="rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    {t("dashboard")}
                  </Link>
                  <AccountMenu className="w-full justify-start px-3" />
                  <Link href="/tests" onClick={() => setOpen(false)} className="mt-3">
                    <Button className="w-full">
                      {t("startAssessment")}
                      <ArrowRight />
                    </Button>
                  </Link>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
