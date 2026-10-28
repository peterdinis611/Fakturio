import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["sk", "en"],
  defaultLocale: "sk",
  localePrefix: "as-needed",
  // Avoid Accept-Language redirects during Clerk OAuth / SSO callbacks.
  localeDetection: false,
});

export type AppLocale = (typeof routing.locales)[number];
