"use client";

import type { ReactNode } from "react";
import { FadeIn } from "@/shared/ui/motion/page-motion";

export function PageHeader({
  title,
  description,
  actions,
  ledger,
}: {
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
  ledger?: ReactNode;
}) {
  return (
    <FadeIn className="mb-5">
      <header>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-[22px] font-semibold leading-tight text-ink">
              {title}
            </h1>
            {description ? (
              typeof description === "string" ? (
                <p className="mt-1 max-w-2xl text-[14px] text-muted-foreground">
                  {description}
                </p>
              ) : (
                <div className="mt-1 max-w-2xl">{description}</div>
              )
            ) : null}
            {ledger ? (
              <div className="ledger-strip mt-3 mb-0 border-0 pb-0">{ledger}</div>
            ) : null}
          </div>
          {actions ? (
            <div className="flex flex-wrap items-center gap-2">{actions}</div>
          ) : null}
        </div>
      </header>
    </FadeIn>
  );
}
