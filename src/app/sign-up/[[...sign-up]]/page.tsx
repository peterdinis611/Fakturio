import Link from "next/link";
import { SignUp } from "@clerk/nextjs";
import { Suspense } from "react";
import { AuthThemeSlot } from "@/components/landing/auth-theme-slot";
import { PageLoader } from "@/components/ui/spinner";
import "@/app/(marketing)/landing.css";

export const metadata = { title: "Registrácia" };

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
