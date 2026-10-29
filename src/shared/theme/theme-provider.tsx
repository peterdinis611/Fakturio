"use client";

import { ThemeProvider as TeispaceThemeProvider } from "@teispace/next-themes";
import type { ReactNode } from "react";

/**
 * Theme wrapper compatible with React 19 / Next 16.
 * Uses @teispace/next-themes so the anti-FOUC script is not rendered
 * as a React <script> child (which triggers the console error).
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <TeispaceThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      storage="local"
      storageKey="theme"
      disableTransitionOnChange={false}
    >
      {children}
    </TeispaceThemeProvider>
  );
}
