import type { Metadata } from "next";
import "./landing.css";

export const metadata: Metadata = {
  title: {
    absolute: "Fakturio — fakturácia pre SZČO a freelancerov",
  },
  description:
    "Vystavuj faktúry, sleduj DPH a splatnosti a páruje platby podľa VS. Fakturácia bez balastu pre slovenských freelancerov a SZČO.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Fakturio — fakturácia bez balastu",
    description:
      "Faktúry, DPH a platby podľa VS. Začni zadarmo — nastavenie firmy za pár minút.",
    url: "/",
    type: "website",
  },
};

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
