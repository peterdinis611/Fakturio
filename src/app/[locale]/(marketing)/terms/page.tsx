import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { TermsView } from "@/features/legal/ui/terms-view";
import { getSiteLegal } from "@/shared/legal/site-legal";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Meta" });

  return {
    title: t("termsTitle"),
    description: t("termsDescription"),
    alternates: {
      canonical: locale === "en" ? "/en/terms" : "/terms",
      languages: {
        sk: "/terms",
        en: "/en/terms",
        "x-default": "/terms",
      },
    },
    openGraph: {
      title: t("termsTitle"),
      description: t("termsDescription"),
      locale: locale === "en" ? "en_US" : "sk_SK",
      url: locale === "en" ? "/en/terms" : "/terms",
      type: "article",
    },
    robots: { index: true, follow: true },
  };
}

export default async function TermsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "Meta" });
  const legal = getSiteLegal();
  const path = locale === "en" ? "/en/terms" : "/terms";
  const siteUrl =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ??
    "http://localhost:3000";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TermsOfService",
    name: t("termsTitle"),
    description: t("termsDescription"),
    url: `${siteUrl}${path}`,
    inLanguage: locale === "en" ? "en" : "sk",
    dateModified: legal.effectiveDateIso,
    publisher: {
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
      <TermsView locale={locale} />
    </>
  );
}
