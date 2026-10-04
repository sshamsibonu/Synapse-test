"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";

import { createClient } from "@/lib/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export const AGE_RANGES = [
  "under_18",
  "18_24",
  "25_34",
  "35_44",
  "45_plus",
] as const;

export type AgeRange = (typeof AGE_RANGES)[number];

function friendlyAuthError(
  message: string,
  t: ReturnType<typeof useTranslations<"auth">>
): string {
  const lower = message.toLowerCase();
  if (lower.includes("invalid login credentials")) return t("invalidCredentials");
  if (lower.includes("email not confirmed")) return t("confirmEmail");
  return message || t("genericError");
}

export function AuthDialog({
  trigger,
  onSuccess,
}: {
  trigger: React.ReactNode;
  onSuccess?: () => void;
}) {
  const t = useTranslations("auth");
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [tab, setTab] = React.useState("signin");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [ageRange, setAgeRange] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [notice, setNotice] = React.useState<string | null>(null);

  function reset() {
    setEmail("");
    setPassword("");
    setAgeRange("");
    setError(null);
    setNotice(null);
    setLoading(false);
  }

  async function saveAgeRangeIfNeeded(
    supabase: ReturnType<typeof createClient>,
    userId: string,
    value: string
  ) {
    if (!value) return;
    await supabase.from("profiles").update({ age_range: value }).eq("id", userId);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setNotice(null);

    let supabase: ReturnType<typeof createClient>;
    try {
      supabase = createClient();
    } catch {
      setLoading(false);
      setError(t("notConfigured"));
      return;
    }

    try {
      if (tab === "signin") {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) {
          setError(friendlyAuthError(signInError.message, t));
          return;
        }
        // Legacy research session hook — safe if it fails.
        try {
          await fetch("/api/session");
        } catch {
          // ignore
        }
        setOpen(false);
        reset();
        onSuccess?.();
        router.refresh();
        return;
      }

      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: ageRange ? { age_range: ageRange } : undefined,
        },
      });

      if (signUpError) {
        setError(friendlyAuthError(signUpError.message, t));
        return;
      }

      if (data.user && ageRange && data.session) {
        await saveAgeRangeIfNeeded(supabase, data.user.id, ageRange);
      }

      if (data.session) {
        setOpen(false);
        reset();
        onSuccess?.();
        router.refresh();
        return;
      }

      setNotice(t("confirmEmail"));
    } catch {
      setError(t("genericError"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) reset();
      }}
    >
      <DialogTrigger render={trigger as React.ReactElement} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("dialogTitle")}</DialogTitle>
          <DialogDescription>{t("dialogDescription")}</DialogDescription>
        </DialogHeader>

        <Tabs
          value={tab}
          onValueChange={(v) => {
            setTab(String(v));
            setError(null);
            setNotice(null);
          }}
        >
          <TabsList className="w-full">
            <TabsTrigger value="signin" className="flex-1">
              {t("signIn")}
            </TabsTrigger>
            <TabsTrigger value="signup" className="flex-1">
              {t("signUp")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value={tab}>
            <form onSubmit={handleSubmit} className="space-y-3 pt-2">
              <div className="space-y-1.5">
                <Label htmlFor="auth-email">{t("email")}</Label>
                <Input
                  id="auth-email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="auth-password">{t("password")}</Label>
                <Input
                  id="auth-password"
                  type="password"
                  autoComplete={tab === "signin" ? "current-password" : "new-password"}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              {tab === "signup" ? (
                <div className="space-y-1.5">
                  <Label htmlFor="auth-age">{t("ageRange")}</Label>
                  <select
                    id="auth-age"
                    className="border-input bg-background h-8 w-full rounded-lg border px-2.5 text-sm"
                    value={ageRange}
                    onChange={(e) => setAgeRange(e.target.value)}
                  >
                    <option value="">{t("ageRangeNone")}</option>
                    {AGE_RANGES.map((value) => (
                      <option key={value} value={value}>
                        {t(`ageRanges.${value}`)}
                      </option>
                    ))}
                  </select>
                </div>
              ) : null}

              {error && (
                <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                  {error}
                </p>
              )}
              {notice && (
                <p className="rounded-lg border border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
                  {notice}
                </p>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? t("pleaseWait") : tab === "signin" ? t("signIn") : t("signUp")}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
