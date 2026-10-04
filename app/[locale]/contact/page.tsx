import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Mail } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

const CONTACT_EMAIL = "hello@synapse.example";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "contact" });
  return { title: t("eyebrow"), description: t("description") };
}

export default async function ContactPage() {
  const t = await getTranslations("contact");

  return (
    <>
      <PageHeader eyebrow={t("eyebrow")} title={t("title")} description={t("description")} />

      <section className="mx-auto max-w-2xl px-4 py-20 sm:px-6">
        <Card className="glass">
          <CardContent className="p-6 sm:p-8">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                <Mail className="size-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("preferEmail")}</p>
                <a href={`mailto:${CONTACT_EMAIL}`} className="font-medium text-primary">
                  {CONTACT_EMAIL}
                </a>
              </div>
            </div>

            <form
              action={`mailto:${CONTACT_EMAIL}`}
              method="GET"
              encType="text/plain"
              className="mt-8 space-y-5"
            >
              <div className="space-y-1.5">
                <Label htmlFor="name">{t("nameLabel")}</Label>
                <Input id="name" name="name" placeholder={t("namePlaceholder")} required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="subject">{t("subjectLabel")}</Label>
                <Input id="subject" name="subject" placeholder={t("subjectPlaceholder")} required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="body">{t("messageLabel")}</Label>
                <Textarea id="body" name="body" placeholder={t("messagePlaceholder")} rows={5} required />
              </div>
              <Button type="submit" className="w-full">
                {t("submit")}
              </Button>
              <p className="text-xs text-muted-foreground">{t("note")}</p>
            </form>
          </CardContent>
        </Card>
      </section>
    </>
  );
}
