import Link from "next/link";
import type { Metadata } from "next";
import { SignIn } from "@clerk/nextjs";
import { Suspense } from "react";
import { AuthThemeSlot } from "@/components/landing/auth-theme-slot";
import { PageLoader } from "@/components/ui/spinner";
import "@/app/(marketing)/landing.css";

export const metadata: Metadata = {
  title: "Prihlásenie",
  description: "Prihlás sa do Fakturio a pokračuj vo fakturácii.",
  robots: { index: false, follow: false },
};

export default function SignInPage() {
  return (
    <div className="auth-shell">
      <AuthThemeSlot />
      <Link href="/" className="auth-shell-brand">
        <span aria-hidden>F</span>
        Fakturio
      </Link>
      <div className="auth-shell-card">
        <Suspense fallback={<PageLoader label="Načítavam prihlásenie…" />}>
          <SignIn
            routing="path"
            path="/sign-in"
            signUpUrl="/sign-up"
            fallbackRedirectUrl="/dashboard"
          />
        </Suspense>
      </div>
    </div>
  );
}
