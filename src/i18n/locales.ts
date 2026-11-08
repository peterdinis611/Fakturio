import { cs, de, enUS, sk, type Locale as DateFnsLocale } from "date-fns/locale";
import {
  cs as csDayPicker,
  de as deDayPicker,
  enUS as enDayPicker,
  sk as skDayPicker,
} from "react-day-picker/locale";
import type { Locale as DayPickerLocale } from "react-day-picker";
import { routing, type AppLocale } from "@/i18n/routing";

export type { AppLocale };

type LocaleMeta = {
  /** BCP-47 tag for Intl / toLocaleString */
  intl: string;
  /** Open Graph locale (underscore form) */
  og: string;
  /** Native language name (fallback if messages miss Locale.*) */
  nativeName: string;
  dateFns: DateFnsLocale;
  dayPicker: DayPickerLocale;
  /** Prefer US-style month-first short dates */
  dateStyle: "eu" | "us";
};

const LOCALE_META: Record<AppLocale, LocaleMeta> = {
  sk: {
    intl: "sk-SK",
    og: "sk_SK",
    nativeName: "Slovenčina",
    dateFns: sk,
    dayPicker: skDayPicker,
    dateStyle: "eu",
  },
  en: {
    intl: "en-US",
    og: "en_US",
    nativeName: "English",
    dateFns: enUS,
    dayPicker: enDayPicker,
    dateStyle: "us",
  },
  cs: {
    intl: "cs-CZ",
    og: "cs_CZ",
    nativeName: "Čeština",
    dateFns: cs,
    dayPicker: csDayPicker,
    dateStyle: "eu",
  },
  de: {
    intl: "de-DE",
    og: "de_DE",
    nativeName: "Deutsch",
    dateFns: de,
    dayPicker: deDayPicker,
    dateStyle: "eu",
  },
};

export function isAppLocale(value: string): value is AppLocale {
  return (routing.locales as readonly string[]).includes(value);
}

export function resolveAppLocale(value: string | undefined | null): AppLocale {
  if (value && isAppLocale(value)) return value;
  return routing.defaultLocale;
}

export function intlLocale(locale: string = routing.defaultLocale): string {
  return LOCALE_META[resolveAppLocale(locale)].intl;
}

export function ogLocale(locale: string = routing.defaultLocale): string {
  return LOCALE_META[resolveAppLocale(locale)].og;
}

export function dateFnsLocale(locale: string = routing.defaultLocale) {
  return LOCALE_META[resolveAppLocale(locale)].dateFns;
}

export function dayPickerLocale(locale: string = routing.defaultLocale) {
  return LOCALE_META[resolveAppLocale(locale)].dayPicker;
}

export function datePattern(
  locale: string = routing.defaultLocale,
  withTime = false,
): string {
  const style = LOCALE_META[resolveAppLocale(locale)].dateStyle;
  if (style === "us") {
    return withTime ? "MMM d, yyyy HH:mm" : "MMM d, yyyy";
  }
  return withTime ? "d. M. yyyy HH:mm" : "d. M. yyyy";
}

/** Path with as-needed locale prefix (default locale unprefixed). */
export function localePath(locale: string, path = "/"): string {
  const code = resolveAppLocale(locale);
  const normalized =
    !path || path === "/"
      ? "/"
      : path.startsWith("/")
        ? path
        : `/${path}`;

  if (code === routing.defaultLocale) {
    return normalized;
  }

  return normalized === "/" ? `/${code}` : `/${code}${normalized}`;
}

/** hreflang map for a given path (always absolute-from-root). */
export function languageAlternates(path = "/"): Record<string, string> {
  const languages: Record<string, string> = {
    "x-default": localePath(routing.defaultLocale, path),
  };
  for (const code of routing.locales) {
    languages[code] = localePath(code, path);
  }
  return languages;
}

export function alternateOgLocales(locale: string): string[] {
  const current = ogLocale(locale);
  return routing.locales
    .map((code) => ogLocale(code))
    .filter((tag) => tag !== current);
}
