import { Suspense } from "react";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { LandingShell } from "@/components/landing/landing-shell";

export const metadata = {
  title: "Fakturio",
  description: "Fakturácia pre slovenských freelancerov a SZČO",
};

async function SignedInRedirect() {
  const { isAuthenticated } = await auth();
  if (isAuthenticated) redirect("/dashboard");
  return null;
}

export default function LandingPage() {
  return (
    <>
      <Suspense fallback={null}>
        <SignedInRedirect />
      </Suspense>
      <LandingShell />
    </>
  );
}
