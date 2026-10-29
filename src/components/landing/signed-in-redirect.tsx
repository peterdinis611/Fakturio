"use client";

import { useRouter } from "@/i18n/navigation";
import { useEffect } from "react";

/** Client-side: keeps the marketing page static. */
export function SignedInRedirect() {
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;
    void fetch("/api/auth/session")
      .then((r) => r.json())
      .then((data: { authenticated?: boolean }) => {
        if (!cancelled && data.authenticated) {
          router.replace("/dashboard");
        }
      })
      .catch(() => {
        /* ignore */
      });
    return () => {
      cancelled = true;
    };
  }, [router]);

  return null;
}
