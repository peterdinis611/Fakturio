import { Suspense } from "react";
import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { LandingShell } from "@/components/landing/landing-shell";
import { redirect } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Meta" });

  return {
    title: { absolute: t("titleDefault") },
    description: t("description"),
    alternates: {
      canonical: locale === "en" ? "/en" : "/",
      languages: { sk: "/", en: "/en", "x-default": "/" },
    },
    openGraph: {
      title: t("ogTitle"),
      description: t("ogDescription"),
      locale: locale === "en" ? "en_US" : "sk_SK",
      url: locale === "en" ? "/en" : "/",
    },
  };
}

async function SignedInRedirect({ locale }: { locale: string }) {
  const { isAuthenticated } = await auth();
  if (isAuthenticated) {
    redirect({ href: "/dashboard", locale });
  }
  return null;
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
      <Suspense fallback={null}>
        <SignedInRedirect locale={locale} />
      </Suspense>
      <LandingShell />
    </>
  );
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}
