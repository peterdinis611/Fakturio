import Link from "next/link";
import type { Metadata } from "next";
import { SignUp } from "@clerk/nextjs";
import { Suspense } from "react";
import { AuthThemeSlot } from "@/components/landing/auth-theme-slot";
import { PageLoader } from "@/components/ui/spinner";
import "@/app/(marketing)/landing.css";

export const metadata: Metadata = {
  title: "Registrácia",
  description: "Vytvor si účet vo Fakturio a vystav prvú faktúru ešte dnes.",
  robots: { index: false, follow: false },
};

export default function SignUpPage() {
  return (
    <div className="auth-shell">
      <AuthThemeSlot />
      <Link href="/" className="auth-shell-brand">
        <span aria-hidden>F</span>
        Fakturio
      </Link>
      <div className="auth-shell-card">
        <Suspense fallback={<PageLoader label="Načítavam registráciu…" />}>
          <SignUp
            routing="path"
            path="/sign-up"
            signInUrl="/sign-in"
            fallbackRedirectUrl="/dashboard"
          />
        </Suspense>
      </div>
    </div>
  );
}
