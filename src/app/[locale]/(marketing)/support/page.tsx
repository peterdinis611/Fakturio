import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { SupportView } from "@/features/legal/ui/support-view";
import { getSiteLegal } from "@/shared/legal/site-legal";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Meta" });

  return {
    title: t("supportTitle"),
    description: t("supportDescription"),
    alternates: {
      canonical: locale === "en" ? "/en/support" : "/support",
      languages: {
        sk: "/support",
        en: "/en/support",
        "x-default": "/support",
      },
    },
    openGraph: {
      title: t("supportTitle"),
      description: t("supportDescription"),
      locale: locale === "en" ? "en_US" : "sk_SK",
      url: locale === "en" ? "/en/support" : "/support",
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
  const path = locale === "en" ? "/en/support" : "/support";
  const siteUrl =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ??
    "http://localhost:3000";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: t("supportTitle"),
    description: t("supportDescription"),
    url: `${siteUrl}${path}`,
    inLanguage: locale === "en" ? "en" : "sk",
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