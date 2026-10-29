import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { AuthShell } from "@/features/auth/ui/auth-shell";
import "@/app/[locale]/(marketing)/landing.css";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Meta" });
  return {
    title: t("signUpTitle"),
    description: t("signUpDescription"),
    robots: { index: false, follow: false },
  };
}

export default async function SignUpPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <AuthShell mode="sign-up" />;
}
