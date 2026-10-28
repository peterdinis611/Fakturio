import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { SsoCallback } from "@/components/auth/sso-callback";
import "@/app/[locale]/(marketing)/landing.css";

type Props = { params: Promise<{ locale: string }> };

export const metadata: Metadata = {
  title: "Prihlásenie",
  robots: { index: false, follow: false },
};

export default async function SignInSsoCallbackPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <SsoCallback />;
}
