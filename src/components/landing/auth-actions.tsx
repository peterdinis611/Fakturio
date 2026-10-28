"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export function LandingNavActions() {
  const t = useTranslations("Landing");

  return (
    <div className="landing-nav-actions">
      <Link href="/sign-in" className="ghost">
        {t("signIn")}
      </Link>
      <Link href="/sign-up" className="landing-btn landing-btn-teal">
        {t("createAccount")}
      </Link>
    </div>
  );
}

export function LandingHeroActions() {
  const t = useTranslations("Landing");

  return (
    <div className="landing-hero-cta">
      <Link href="/sign-up" className="landing-btn">
        {t("ctaStart")}
      </Link>
      <Link href="/sign-in" className="landing-btn landing-btn-outline">
        {t("ctaHaveAccount")}
      </Link>
    </div>
  );
}

export function LandingCtaActions() {
  const t = useTranslations("Landing");

  return (
    <div className="landing-cta-actions">
      <Link href="/sign-up" className="landing-btn landing-btn-teal">
        {t("createAccount")}
      </Link>
      <Link href="/sign-in" className="landing-btn landing-btn-outline">
        {t("signIn")}
      </Link>
    </div>
  );
}
