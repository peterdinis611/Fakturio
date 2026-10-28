"use client";

import { SignIn, SignUp } from "@clerk/nextjs";
import { useLocale, useTranslations } from "next-intl";
import { useTheme } from "@teispace/next-themes";
import { useEffect, useState } from "react";
import { AuthThemeSlot } from "@/components/landing/auth-theme-slot";
import { LocaleSwitcher } from "@/components/i18n/locale-switcher";
import { Link } from "@/i18n/navigation";
import { fakturioClerkAppearance } from "@/lib/clerk-appearance";

type AuthShellProps = {
  mode: "sign-in" | "sign-up";
};

export function AuthShell({ mode }: AuthShellProps) {
  const t = useTranslations("Auth");
  const locale = useLocale();
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // Default light until mounted — but NEVER delay mounting SignIn/SignUp.
  // Delaying breaks /sign-in/sso-callback after Google OAuth.
  const isDark = mounted && resolvedTheme === "dark";
  const appearance = fakturioClerkAppearance(Boolean(isDark));
  const signInPath = locale === "en" ? "/en/sign-in" : "/sign-in";
  const signUpPath = locale === "en" ? "/en/sign-up" : "/sign-up";
  const afterAuth = locale === "en" ? "/en/dashboard" : "/dashboard";

  return (
    <div className="auth-shell">
      <div className="auth-shell-glow" aria-hidden />
      <div className="auth-shell-tools">
        <LocaleSwitcher compact />
        <AuthThemeSlot />
      </div>

      <div className="auth-panel">
        <aside className="auth-panel-aside">
          <Link href="/" className="auth-shell-brand">
            <span aria-hidden>F</span>
            Fakturio
          </Link>
          <div className="auth-panel-copy">
            <p className="auth-panel-eyebrow">
              {mode === "sign-in" ? t("welcomeBack") : t("startFree")}
            </p>
            <h1>
              {mode === "sign-in" ? t("signInTitle") : t("signUpTitle")}
            </h1>
            <p>{mode === "sign-in" ? t("signInLead") : t("signUpLead")}</p>
          </div>
          <ul className="auth-panel-points">
            <li>{t("pointSk")}</li>
            <li>{t("pointVat")}</li>
            <li>{t("pointPayments")}</li>
          </ul>
        </aside>

        <div className="auth-panel-main">
          <Link href="/" className="auth-shell-brand auth-shell-brand-mobile">
            <span aria-hidden>F</span>
            Fakturio
          </Link>
          <div className="auth-shell-card">
            {/* Stable key: theme appearance updates must not remount mid-OAuth */}
            {mode === "sign-in" ? (
              <SignIn
                key="sign-in"
                routing="path"
                path={signInPath}
                signUpUrl={signUpPath}
                fallbackRedirectUrl={afterAuth}
                appearance={appearance}
              />
            ) : (
              <SignUp
                key="sign-up"
                routing="path"
                path={signUpPath}
                signInUrl={signInPath}
                fallbackRedirectUrl={afterAuth}
                appearance={appearance}
              />
            )}
            <div id="clerk-captcha" />
          </div>
          <p className="auth-panel-note">
            {mode === "sign-in" ? (
              <>
                {t("noAccount")}{" "}
                <Link href="/sign-up">{t("signUpLink")}</Link>
              </>
            ) : (
              <>
                {t("hasAccount")}{" "}
                <Link href="/sign-in">{t("signInLink")}</Link>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
