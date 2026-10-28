import { Suspense } from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { LandingShell } from "@/components/landing/landing-shell";

export const metadata: Metadata = {
  title: {
    absolute: "Fakturio — fakturácia pre SZČO a freelancerov",
  },
  description:
    "Vystavuj faktúry, sleduj DPH a splatnosti a páruje platby podľa VS. Fakturácia bez balastu pre slovenských freelancerov a SZČO.",
  alternates: { canonical: "/" },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Fakturio",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  inLanguage: "sk",
  description:
    "Fakturácia pre slovenských freelancerov a SZČO — faktúry, DPH, splatnosti a párovanie platieb podľa VS.",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "EUR",
  },
  featureList: [
    "Faktúry a DPH",
    "Párovanie platieb podľa VS",
    "Splatnosti a upomienky",
    "Reporty a cashflow",
    "Export pre účtovníka",
  ],
};

async function SignedInRedirect() {
  const { isAuthenticated } = await auth();
  if (isAuthenticated) redirect("/dashboard");
  return null;
}

export default function LandingPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Suspense fallback={null}>
        <SignedInRedirect />
      </Suspense>
      <LandingShell />
    </>
  );
}
