import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/auth-shell";
import "@/app/(marketing)/landing.css";

export const metadata: Metadata = {
  title: "Prihlásenie",
  description: "Prihlás sa do Fakturio a pokračuj vo fakturácii.",
  robots: { index: false, follow: false },
};

export default function SignInPage() {
  return <AuthShell mode="sign-in" />;
}
