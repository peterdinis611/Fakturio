import { enUS, skSK } from "@clerk/localizations";
import type { AppLocale } from "./routing";

export function clerkLocalization(locale: AppLocale) {
  return locale === "en" ? enUS : skSK;
}
