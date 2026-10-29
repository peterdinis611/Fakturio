import type { ReactNode } from "react";
import Link from "next/link";
import { Button } from "@/shared/ui/button";

type ErrorScreenProps = {
  code: "404" | "500";
  title: string;
  description: string;
  primaryHref?: string;
  primaryLabel?: string;
  secondary?: ReactNode;
};

export function ErrorScreen({
  code,
  title,
  description,
  primaryHref = "/",
  primaryLabel = "Späť na prehľad",
  secondary,
}: ErrorScreenProps) {
  return (
    <div className="flex min-h-[70vh] flex-col items-start justify-center px-4 py-16 sm:px-6">
      <div className="w-full max-w-md">
        <div className="ledger-strip mb-6 border-0 pb-0">
          <span className="stamp" aria-hidden>
            {code === "404" ? "?" : "!"}
          </span>
          <span className="money text-[13px] text-faint">{code}</span>
        </div>
        <h1 className="text-[22px] font-semibold tracking-tight text-ink">
          {title}
        </h1>
        <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground">
          {description}
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Button asChild>
            <Link href={primaryHref}>{primaryLabel}</Link>
          </Button>
          {secondary}
        </div>
      </div>
    </div>
  );
}
