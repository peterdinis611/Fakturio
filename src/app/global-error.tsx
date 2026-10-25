"use client";

import { useEffect } from "react";
import { IBM_Plex_Sans } from "next/font/google";
import "./globals.css";

const plexSans = IBM_Plex_Sans({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600"],
});

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="sk" className={`${plexSans.className} h-full`}>
      <body className="min-h-full bg-[#eef0f3] text-[#12151a] antialiased dark:bg-[#111110] dark:text-[#f2f2ee]">
        <div className="mx-auto flex min-h-full max-w-md flex-col justify-center px-6 py-16">
          <p className="font-mono text-[13px] font-bold tracking-tight text-[#7a8494]">
            500
          </p>
          <h1 className="mt-3 text-[22px] font-semibold">Kritická chyba</h1>
          <p className="mt-2 text-[14px] leading-relaxed text-[#5a6270] dark:text-[#a3a39a]">
            Aplikácia spadla pri načítaní. Skús obnoviť stránku.
          </p>
          <button
            type="button"
            onClick={reset}
            className="mt-6 inline-flex h-9 w-fit items-center rounded-[4px] bg-[#12151a] px-3 text-[14px] font-medium text-[#f7f8fa] dark:bg-[#f2f2ee] dark:text-[#111110]"
          >
            Skúsiť znova
          </button>
        </div>
      </body>
    </html>
  );
}
