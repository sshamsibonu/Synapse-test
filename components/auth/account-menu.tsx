"use client";

import { useTranslations } from "next-intl";
import { LogIn, LogOut } from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "@/i18n/navigation";
import { useAuthUser } from "@/components/auth/use-auth-user";
import { AuthDialog } from "@/components/auth/auth-dialog";
import { Button } from "@/components/ui/button";

export function AccountMenu({ className }: { className?: string }) {
  const t = useTranslations("nav");
  const router = useRouter();
  const { user, loading } = useAuthUser();

  async function handleSignOut() {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch {
      // ignore
    }
    router.refresh();
  }

  if (loading) {
    return <div className={className} style={{ width: 88 }} />;
  }

  if (user) {
    return (
      <Button variant="ghost" className={className} onClick={handleSignOut}>
        <LogOut />
        {t("signOut")}
      </Button>
    );
  }

  return (
    <AuthDialog
      trigger={
        <Button variant="ghost" className={className}>
          <LogIn />
          {t("signIn")}
        </Button>
      }
    />
  );
}
