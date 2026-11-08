import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { SupportView } from "@/features/legal/ui/support-view";
import { getSiteLegal } from "@/shared/legal/site-legal";
import {
  languageAlternates,
  localePath,
  ogLocale,
} from "@/i18n/locales";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Meta" });
  const path = localePath(locale, "/support");

  return {
    title: t("supportTitle"),
    description: t("supportDescription"),
    alternates: {
      canonical: path,
      languages: languageAlternates("/support"),
    },
    openGraph: {
      title: t("supportTitle"),
      description: t("supportDescription"),
      locale: ogLocale(locale),
      url: path,
      type: "website",
    },
    robots: { index: true, follow: true },
  };
}

export default async function SupportPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "Meta" });
  const legal = getSiteLegal();
  const path = localePath(locale, "/support");
  const siteUrl =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ??
    "http://localhost:3000";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: t("supportTitle"),
    description: t("supportDescription"),
    url: `${siteUrl}${path}`,
    inLanguage: locale,
    mainEntity: {
      "@type": "Organization",
      name: legal.controllerName,
      email: legal.contactEmail,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SupportView locale={locale} />
    </>
  );
}