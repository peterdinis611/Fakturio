"use client";

import type { UseFormRegisterReturn } from "react-hook-form";
import { useTranslations } from "next-intl";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Spinner } from "@/shared/ui/spinner";
import { cn } from "@/shared/lib/utils";
import { normalizeIco } from "@/shared/lib/validations/sk";

type IcoLookupFieldProps = {
  id: string;
  register: UseFormRegisterReturn;
  lookingUp: boolean;
  registrySupported: boolean;
  canLookup: boolean;
  onLookup: (mode: "auto" | "manual") => void;
  "aria-invalid"?: boolean;
  className?: string;
};

export function IcoLookupField({
  id,
  register,
  lookingUp,
  registrySupported,
  canLookup,
  onLookup,
  "aria-invalid": ariaInvalid,
  className,
}: IcoLookupFieldProps) {
  const t = useTranslations("CustomerDetail");
  const { onBlur, onChange, ...rest } = register;

  return (
    <div className={cn("flex gap-2", className)}>
      <Input
        id={id}
        className="data-num min-w-0 flex-1"
        inputMode="numeric"
        autoComplete="off"
        aria-invalid={ariaInvalid}
        aria-busy={lookingUp || undefined}
        {...rest}
        onChange={onChange}
        onBlur={(event) => {
          const cleaned = normalizeIco(event.target.value);
          if (cleaned !== event.target.value) {
            event.target.value = cleaned;
            onChange(event);
          }
          onBlur(event);
          if (registrySupported) onLookup("auto");
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter" && registrySupported) {
            event.preventDefault();
            const target = event.currentTarget;
            const cleaned = normalizeIco(target.value);
            if (cleaned !== target.value) {
              target.value = cleaned;
              onChange({
                ...event,
                target,
                currentTarget: target,
              } as React.ChangeEvent<HTMLInputElement>);
            }
            onLookup("manual");
          }
        }}
      />
      {registrySupported ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-9 shrink-0 px-2.5"
          disabled={lookingUp || !canLookup}
          onClick={() => onLookup("manual")}
          aria-label={t("lookupFill")}
        >
          {lookingUp ? (
            <Spinner size="sm" label={t("lookupSearching")} />
          ) : (
            t("lookupFill")
          )}
        </Button>
      ) : null}
    </div>
  );
}
