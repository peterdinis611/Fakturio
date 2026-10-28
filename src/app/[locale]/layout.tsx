import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { ClerkThemeProvider } from "@/components/auth/clerk-theme-provider";
import { LocaleHtmlLang } from "@/components/i18n/locale-html-lang";
import { clerkLocalization } from "@/i18n/clerk";
import { routing, type AppLocale } from "@/i18n/routing";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  setRequestLocale(locale);
  const messages = await getMessages();
  const appLocale = locale as AppLocale;

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <ClerkThemeProvider
        localization={clerkLocalization(appLocale)}
        signInUrl={appLocale === "en" ? "/en/sign-in" : "/sign-in"}
        signUpUrl={appLocale === "en" ? "/en/sign-up" : "/sign-up"}
        afterSignOutUrl={appLocale === "en" ? "/en" : "/"}
      >
        <LocaleHtmlLang locale={locale} />
        {children}
      </ClerkThemeProvider>
    </NextIntlClientProvider>
  );
}
