import type { Metadata, Viewport } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { skSK } from "@clerk/localizations";
import { shadcn } from "@clerk/ui/themes";
import {
  Bricolage_Grotesque,
  IBM_Plex_Mono,
  IBM_Plex_Sans,
} from "next/font/google";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { fakturioClerkLight } from "@/lib/clerk-appearance";
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
  authors: [{ name: "Fakturio" }],
  creator: "Fakturio",
  publisher: "Fakturio",
  keywords: [
    "fakturácia",
    "faktúry",
    "SZČO",
    "freelancer",
    "DPH",
    "variabilný symbol",
    "platby",
    "Slovensko",
    "Fakturio",
  ],
  alternates: {
    canonical: "/",
    languages: { sk: "/" },
  },
  openGraph: {
    type: "website",
    locale: "sk_SK",
    url: "/",
    siteName: "Fakturio",
    title: "Fakturio — fakturácia bez balastu",
    description:
      "Faktúry, DPH a platby podľa VS pre slovenských freelancerov a SZČO. Začni zadarmo.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Fakturio — fakturácia bez balastu",
    description:
      "Vystavuj faktúry, sleduj splatnosti a maj cashflow pod kontrolou.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  category: "business",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
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
        <ClerkProvider
          localization={skSK}
          appearance={{
            theme: shadcn,
            variables: fakturioClerkLight.variables,
            signIn: fakturioClerkLight,
            signUp: fakturioClerkLight,
          }}
          signInUrl="/sign-in"
          signUpUrl="/sign-up"
          afterSignOutUrl="/"
        >
          <ThemeProvider>
            {children}
            <Toaster position="top-right" closeButton />
          </ThemeProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
