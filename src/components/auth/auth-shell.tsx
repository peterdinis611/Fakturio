"use client";

import { useTranslations } from "next-intl";
import { AuthForm } from "@/components/auth/auth-form";
import { AuthThemeSlot } from "@/components/landing/auth-theme-slot";
import { LocaleSwitcher } from "@/components/i18n/locale-switcher";
import { Link } from "@/i18n/navigation";

type AuthShellProps = {
  mode: "sign-in" | "sign-up";
};

export function AuthShell({ mode }: AuthShellProps) {
  const t = useTranslations("Auth");

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
            <AuthForm mode={mode} />
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
