import type { Metadata } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { Toaster } from "@/components/ui/sonner";
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

export const metadata: Metadata = {
  title: {
    default: "Fakturio",
    template: "%s · Fakturio",
  },
  description: "Fakturácia pre slovenských freelancerov a SZČO",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="sk"
      suppressHydrationWarning
      className={`${plexSans.variable} ${plexMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-ground font-sans text-foreground">
        <ThemeProvider>
          {children}
          <Toaster position="top-right" closeButton />
        </ThemeProvider>
      </body>
    </html>
  );
}
