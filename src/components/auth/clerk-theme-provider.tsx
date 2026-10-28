"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { shadcn } from "@clerk/ui/themes";
import { ui } from "@clerk/ui";
import { useTheme } from "@teispace/next-themes";
import { useMemo } from "react";
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
  const isDark = resolvedTheme === "dark";
  const appearance = useMemo(
    () => (isDark ? fakturioClerkDark : fakturioClerkLight),
    [isDark],
  );

  return (
    <ClerkProvider
      ui={ui}
      localization={localization}
      appearance={{
        theme: shadcn,
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
