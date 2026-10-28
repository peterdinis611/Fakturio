import Link from "next/link";
import { Show, SignInButton, SignUpButton } from "@clerk/nextjs";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Fakturio",
  description: "Fakturácia pre slovenských freelancerov a SZČO",
};

async function SignedInRedirect() {
  const { isAuthenticated } = await auth();
  if (isAuthenticated) redirect("/dashboard");
  return null;
}

export default function LandingPage() {
  return (
    <div className="relative min-h-svh overflow-hidden bg-ground">
      <Suspense fallback={null}>
        <SignedInRedirect />
      </Suspense>

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 80% 50% at 10% -10%, color-mix(in oklab, var(--ink) 12%, transparent), transparent), radial-gradient(ellipse 60% 40% at 90% 10%, color-mix(in oklab, var(--chart-3) 18%, transparent), transparent)",
        }}
      />

      <header className="relative z-10 mx-auto flex w-full max-w-[1152px] items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5 text-ink">
          <span className="stamp" aria-hidden>
            F
          </span>
          <span className="text-[16px] font-semibold">Fakturio</span>
        </Link>
        <Suspense
          fallback={
            <div className="h-9 w-40 animate-pulse rounded bg-raised" />
          }
        >
          <div className="flex items-center gap-2">
            <Show when="signed-out">
              <SignInButton mode="redirect" forceRedirectUrl="/dashboard">
                <Button type="button" variant="ghost">
                  Prihlásiť sa
                </Button>
              </SignInButton>
              <SignUpButton mode="redirect" forceRedirectUrl="/dashboard">
                <Button type="button">Vytvoriť účet</Button>
              </SignUpButton>
            </Show>
            <Show when="signed-in">
              <Button type="button" asChild>
                <Link href="/dashboard">Prejsť do aplikácie</Link>
              </Button>
            </Show>
          </div>
        </Suspense>
      </header>

      <main className="relative z-10 mx-auto flex w-full max-w-[1152px] flex-col gap-10 px-4 pb-20 pt-16 sm:px-6 lg:px-8 lg:pt-24">
        <div className="max-w-2xl">
          <p className="mb-3 text-[13px] font-medium tracking-[0.08em] text-muted-foreground uppercase">
            Faktúry · DPH · platby
          </p>
          <h1 className="text-balance text-[clamp(2.25rem,5vw,3.75rem)] leading-[1.05] font-semibold tracking-tight text-ink">
            Fakturio
          </h1>
          <p className="mt-5 max-w-xl text-[17px] leading-relaxed text-muted-foreground">
            Jednoduchá fakturácia pre freelancera a SZČO. Vystavuj, sleduj
            splatnosti a maj prehľad o cashflow — bez zbytočného balastu.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Suspense fallback={null}>
              <Show when="signed-out">
                <SignUpButton mode="redirect" forceRedirectUrl="/dashboard">
                  <Button type="button" size="lg">
                    Začať zadarmo
                  </Button>
                </SignUpButton>
                <SignInButton mode="redirect" forceRedirectUrl="/dashboard">
                  <Button type="button" size="lg" variant="outline">
                    Mám účet
                  </Button>
                </SignInButton>
              </Show>
              <Show when="signed-in">
                <Button type="button" size="lg" asChild>
                  <Link href="/dashboard">Otvoriť prehľad</Link>
                </Button>
              </Show>
            </Suspense>
          </div>
        </div>

        <aside
          aria-hidden
          className="panel relative max-w-md self-end p-5 sm:mt-[-4rem]"
        >
          <div className="mb-4 flex items-center justify-between">
            <span className="text-[12px] tracking-wide text-muted-foreground uppercase">
              Ukážka faktúry
            </span>
            <span className="stamp text-[11px]">OK</span>
          </div>
          <p className="text-[15px] font-medium text-ink">FA-2026-0142</p>
          <p className="mt-1 text-[13px] text-muted-foreground">
            Studio Nova · splatnosť 14 dní
          </p>
          <div className="mt-6 flex items-end justify-between border-t border-border pt-4">
            <span className="text-[12px] text-muted-foreground">Spolu</span>
            <span className="data-num text-[22px] font-semibold text-ink">
              1 280,00 €
            </span>
          </div>
        </aside>
      </main>
    </div>
  );
}
