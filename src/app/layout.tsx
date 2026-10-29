import type { Metadata, Viewport } from "next";
import {
  Bricolage_Grotesque,
  IBM_Plex_Mono,
  IBM_Plex_Sans,
} from "next/font/google";
import { ThemeProvider } from "@/shared/theme/theme-provider";
import { Toaster } from "@/shared/toast/toaster";
import "./globals.css";

const plexSans = IBM_Plex_Sans({
  variable: "--font-plex",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "700"],
});

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700", "800"],
});

const siteUrl =
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ??
  "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Fakturio — fakturácia pre SZČO a freelancerov",
    template: "%s · Fakturio",
  },
  description:
    "Vystavuj faktúry, sleduj DPH a splatnosti a páruje platby podľa VS. Fakturio je jednoduchá fakturácia pre slovenských freelancerov a SZČO.",
  applicationName: "Fakturio",
  alternates: {
    canonical: "/",
    languages: {
      sk: "/",
      en: "/en",
      "x-default": "/",
    },
  },
  openGraph: {
    type: "website",
    locale: "sk_SK",
    alternateLocale: ["en_US"],
    url: "/",
    siteName: "Fakturio",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#eef0f3" },
    { media: "(prefers-color-scheme: dark)", color: "#111110" },
  ],
  colorScheme: "light dark",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="sk"
      suppressHydrationWarning
      className={`${plexSans.variable} ${plexMono.variable} ${bricolage.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-ground font-sans text-foreground">
        <ThemeProvider>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
