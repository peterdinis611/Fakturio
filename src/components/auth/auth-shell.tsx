"use client";

import Link from "next/link";
import { SignIn, SignUp } from "@clerk/nextjs";
import { useTheme } from "@teispace/next-themes";
import { useEffect, useState } from "react";
import { AuthThemeSlot } from "@/components/landing/auth-theme-slot";
import { PageLoader } from "@/components/ui/spinner";
import { fakturioClerkAppearance } from "@/lib/clerk-appearance";

type AuthShellProps = {
  mode: "sign-in" | "sign-up";
};

export function AuthShell({ mode }: AuthShellProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const isDark = mounted && resolvedTheme === "dark";
  const appearance = fakturioClerkAppearance(Boolean(isDark));

  return (
    <div className="auth-shell">
      <div className="auth-shell-glow" aria-hidden />
      <AuthThemeSlot />

      <div className="auth-panel">
        <aside className="auth-panel-aside">
          <Link href="/" className="auth-shell-brand">
            <span aria-hidden>F</span>
            Fakturio
          </Link>
          <div className="auth-panel-copy">
            <p className="auth-panel-eyebrow">
              {mode === "sign-in" ? "Vitaj späť" : "Začni zadarmo"}
            </p>
            <h1>
              {mode === "sign-in"
                ? "Prihlásenie do Fakturio"
                : "Vytvor si účet"}
            </h1>
            <p>
              {mode === "sign-in"
                ? "Pokračuj vo faktúrach, splatnostiach a párovaní platieb."
                : "Nastav firmu za pár minút a vystav prvú faktúru ešte dnes."}
            </p>
          </div>
          <ul className="auth-panel-points">
            <li>SK údaje · IČO, IBAN, VS</li>
            <li>DPH režimy pre SZČO</li>
            <li>Import platieb z banky</li>
          </ul>
        </aside>

        <div className="auth-panel-main">
          <Link href="/" className="auth-shell-brand auth-shell-brand-mobile">
            <span aria-hidden>F</span>
            Fakturio
          </Link>
          <div className="auth-shell-card">
            {!mounted ? (
              <PageLoader
                label={
                  mode === "sign-in"
                    ? "Načítavam prihlásenie…"
                    : "Načítavam registráciu…"
                }
              />
            ) : mode === "sign-in" ? (
              <SignIn
                routing="path"
                path="/sign-in"
                signUpUrl="/sign-up"
                fallbackRedirectUrl="/dashboard"
                appearance={appearance}
              />
            ) : (
              <SignUp
                routing="path"
                path="/sign-up"
                signInUrl="/sign-in"
                fallbackRedirectUrl="/dashboard"
                appearance={appearance}
              />
            )}
          </div>
          <p className="auth-panel-note">
            {mode === "sign-in" ? (
              <>
                Nemáš účet? <Link href="/sign-up">Registrácia</Link>
              </>
            ) : (
              <>
                Už máš účet? <Link href="/sign-in">Prihlásenie</Link>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
