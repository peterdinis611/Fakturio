"use client";

import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";
import { useLocale, useTranslations } from "next-intl";
import { PageLoader } from "@/components/ui/spinner";

/**
 * Finishes Google/OAuth after the IdP redirect.
 * Kept minimal on purpose: no theme-dependent remounts, no overflow clipping,
 * so Clerk bot-protection / session transfer can complete.
 */
export function SsoCallback() {
  const t = useTranslations("Auth");
  const locale = useLocale();
  const signInPath = locale === "en" ? "/en/sign-in" : "/sign-in";
  const signUpPath = locale === "en" ? "/en/sign-up" : "/sign-up";
  const afterAuth = locale === "en" ? "/en/dashboard" : "/dashboard";

  return (
    <div className="auth-sso">
      <PageLoader label={t("loadingSignIn")} />
      {/* Required for Clerk bot / Turnstile challenges after OAuth */}
      <div id="clerk-captcha" />
      <AuthenticateWithRedirectCallback
        signInUrl={signInPath}
        signUpUrl={signUpPath}
        signInFallbackRedirectUrl={afterAuth}
        signUpFallbackRedirectUrl={afterAuth}
        signInForceRedirectUrl={afterAuth}
        signUpForceRedirectUrl={afterAuth}
        continueSignUpUrl={signUpPath}
      />
    </div>
  );
}
