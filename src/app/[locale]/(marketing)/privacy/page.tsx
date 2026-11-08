import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PrivacyPolicyView } from "@/features/legal/ui/privacy-policy-view";
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
  const path = localePath(locale, "/privacy");

  return {
    title: t("privacyTitle"),
    description: t("privacyDescription"),
    alternates: {
      canonical: path,
      languages: languageAlternates("/privacy"),
    },
    openGraph: {
      title: t("privacyTitle"),
      description: t("privacyDescription"),
      locale: ogLocale(locale),
      url: path,
      type: "article",
    },
    robots: { index: true, follow: true },
  };
}

export default async function PrivacyPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "Meta" });
  const legal = getSiteLegal();
  const path = localePath(locale, "/privacy");
  const siteUrl =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ??
    "http://localhost:3000";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "PrivacyPolicy",
    name: t("privacyTitle"),
    description: t("privacyDescription"),
    url: `${siteUrl}${path}`,
    inLanguage: locale,
    dateModified: legal.effectiveDateIso,
    publisher: {
      "@type": "Organization",
      name: legal.controllerName,
      email: legal.privacyEmail,
      ...(legal.controllerIco
        ? { identifier: legal.controllerIco }
        : {}),
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PrivacyPolicyView locale={locale} />
    </>
  );
}
