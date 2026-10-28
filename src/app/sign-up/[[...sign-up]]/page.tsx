import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/auth-shell";
import "@/app/(marketing)/landing.css";

export const metadata: Metadata = {
  title: "Registrácia",
  description: "Vytvor si účet vo Fakturio a vystav prvú faktúru ešte dnes.",
  robots: { index: false, follow: false },
};

export default function SignUpPage() {
  return <AuthShell mode="sign-up" />;
}
