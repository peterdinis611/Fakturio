"use client";

import { SignIn, SignUp, useAuth } from "@clerk/nextjs";
import { useLocale } from "next-intl";
import { useEffect } from "react";
import { useRouter } from "@/i18n/navigation";

type Props = {
  mode?: "sign-in" | "sign-up";
};

/**
 * Path-based <SignIn>/<SignUp> finish Google OAuth on /sign-in/sso-callback.
 * Do not use AuthenticateWithRedirectCallback here — that API is for custom
 * useSignIn().sso() flows and leaves this page spinning forever.
 */
export function SsoCallback({ mode = "sign-in" }: Props) {
  const locale = useLocale();
  const router = useRouter();
  const { isLoaded, isSignedIn } = useAuth();

  const signInPath = locale === "en" ? "/en/sign-in" : "/sign-in";
  const signUpPath = locale === "en" ? "/en/sign-up" : "/sign-up";
  const afterAuth = locale === "en" ? "/en/dashboard" : "/dashboard";

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.replace("/dashboard");
    }
  }, [isLoaded, isSignedIn, router]);

  return (
    <div className="auth-sso">
      <div id="clerk-captcha" />
      {mode === "sign-up" ? (
        <SignUp
          routing="path"
          path={signUpPath}
          signInUrl={signInPath}
          fallbackRedirectUrl={afterAuth}
        />
      ) : (
        <SignIn
          routing="path"
          path={signInPath}
          signUpUrl={signUpPath}
          fallbackRedirectUrl={afterAuth}
        />
      )}
    </div>
  );
}
