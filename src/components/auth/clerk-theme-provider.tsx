"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { shadcn } from "@clerk/ui/themes";
import { useTheme } from "@teispace/next-themes";
import { useEffect, useState } from "react";
import {
  fakturioClerkDark,
  fakturioClerkLight,
} from "@/lib/clerk-appearance";

type Props = {
  children: React.ReactNode;
  localization: React.ComponentProps<typeof ClerkProvider>["localization"];
  signInUrl: string;
  signUpUrl: string;
  afterSignOutUrl: string;
};

export function ClerkThemeProvider({
  children,
  localization,
  signInUrl,
  signUpUrl,
  afterSignOutUrl,
}: Props) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const isDark = mounted && resolvedTheme === "dark";
  const appearance = isDark ? fakturioClerkDark : fakturioClerkLight;

  return (
    <ClerkProvider
      localization={localization}
      appearance={{
        theme: shadcn,
        ...appearance,
        variables: appearance.variables,
        elements: appearance.elements,
      }}
      signInUrl={signInUrl}
      signUpUrl={signUpUrl}
      afterSignOutUrl={afterSignOutUrl}
    >
      {children}
    </ClerkProvider>
  );
}
