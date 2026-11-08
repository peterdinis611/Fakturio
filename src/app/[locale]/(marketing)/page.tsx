import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { LandingShell } from "@/widgets/landing/landing-shell";
import { SignedInRedirect } from "@/widgets/landing/signed-in-redirect";
import {
  languageAlternates,
  localePath,
  ogLocale,
} from "@/i18n/locales";
import { routing } from "@/i18n/routing";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Meta" });
  const path = localePath(locale, "/");

  return {
    title: { absolute: t("titleDefault") },
    description: t("description"),
    alternates: {
      canonical: path,
      languages: languageAlternates("/"),
    },
    openGraph: {
      title: t("ogTitle"),
      description: t("ogDescription"),
      locale: ogLocale(locale),
      url: path,
    },
  };
}

export default async function LandingPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "Meta" });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Fakturio",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    inLanguage: locale,
    description: t("description"),
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "EUR",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SignedInRedirect />
      <LandingShell />
    </>
  );
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}
