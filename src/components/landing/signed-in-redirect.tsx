"use client";

import { useAuth } from "@clerk/nextjs";
import { useRouter } from "@/i18n/navigation";
import { useEffect } from "react";

/** Client-side: keeps the marketing page static (no server auth()). */
export function SignedInRedirect() {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.replace("/dashboard");
    }
  }, [isLoaded, isSignedIn, router]);

  return null;
}
