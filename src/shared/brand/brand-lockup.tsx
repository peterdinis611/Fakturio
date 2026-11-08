import { cn } from "@/shared/lib/utils";
import {
  BrandMark,
  type BrandMarkSize,
} from "@/shared/brand/brand-mark";

type Props = {
  markSize?: BrandMarkSize | number;
  markVariant?: "outline" | "solid";
  wordmark?: boolean;
  className?: string;
  markClassName?: string;
  wordmarkClassName?: string;
};

/** Mark + optional “Fakturio” wordmark for headers and auth. */
export function BrandLockup({
  markSize = "md",
  markVariant = "outline",
  wordmark = true,
  className,
  markClassName,
  wordmarkClassName,
}: Props) {
  return (
    <span className={cn("brand-lockup inline-flex items-center gap-2.5", className)}>
      <BrandMark
        size={markSize}
        variant={markVariant}
        className={markClassName}
      />
      {wordmark ? (
        <span
          className={cn(
            "brand-wordmark text-[16px] font-semibold tracking-tight text-ink",
            wordmarkClassName,
          )}
        >
          Fakturio
        </span>
      ) : null}
    </span>
  );
}
