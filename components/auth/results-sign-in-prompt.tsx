"use client";

import { useTranslations } from "next-intl";
import { LogIn } from "lucide-react";

import { AuthDialog } from "@/components/auth/auth-dialog";
import { Button } from "@/components/ui/button";

export function ResultsSignInPrompt({ message }: { message: string }) {
  const t = useTranslations("nav");

  return (
    <div className="rounded-md border border-dashed border-border px-4 py-10 text-center">
      <p className="text-sm text-muted-foreground">{message}</p>
      <div className="mt-4 flex justify-center">
        <AuthDialog
          trigger={
            <Button type="button">
              <LogIn />
              {t("signIn")}
            </Button>
          }
        />
      </div>
    </div>
  );
}
