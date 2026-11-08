import { cn } from "@/shared/lib/utils";

const SIZES = {
  sm: 18,
  md: 22,
  lg: 28,
  xl: 36,
} as const;

export type BrandMarkSize = keyof typeof SIZES;

type Props = {
  size?: BrandMarkSize | number;
  /** outline = ink stroke; solid = filled ink tile with light glyph */
  variant?: "outline" | "solid";
  className?: string;
  title?: string;
};

/**
 * Fakturio mark — perforated invoice stub + ledger F + platobný pás.
 */
export function BrandMark({
  size = "md",
  variant = "outline",
  className,
  title = "Fakturio",
}: Props) {
  const px = typeof size === "number" ? size : SIZES[size];
  const solid = variant === "solid";

  return (
    <svg
      width={px}
      height={px}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={title}
      className={cn(
        "brand-mark shrink-0",
        solid ? "brand-mark--solid" : "brand-mark--outline",
        className,
      )}
    >
      {solid ? (
        <rect width="32" height="32" rx="5" fill="currentColor" />
      ) : (
        <rect
          x="1.5"
          y="1.5"
          width="29"
          height="29"
          rx="4"
          stroke="currentColor"
          strokeWidth="1.75"
        />
      )}

      {[8, 13, 18, 23].map((y) =>
        solid ? (
          <circle
            key={y}
            cx="6"
            cy={y}
            r="1.35"
            fill="var(--brand-mark-cut, #F3F4F6)"
          />
        ) : (
          <circle
            key={y}
            cx="6"
            cy={y}
            r="1.25"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.35"
          />
        ),
      )}

      <path
        d={solid ? "M9.5 5.5v21" : "M9.25 4.5v23"}
        stroke={solid ? "var(--brand-mark-cut, #F3F4F6)" : "currentColor"}
        strokeWidth="1.15"
        strokeDasharray="1.4 1.6"
        opacity="0.45"
      />

      <path
        d="M12.5 7.5h12v2.6H15.2v3.7h8.2v2.4H15.2V24.5h-2.7V7.5Z"
        fill={solid ? "var(--brand-mark-cut, #F3F4F6)" : "currentColor"}
      />

      <rect
        x="12.5"
        y="25.6"
        width="12"
        height="2.2"
        rx="0.45"
        fill={solid ? "var(--brand-mark-cut, #F3F4F6)" : "currentColor"}
        opacity={solid ? 0.88 : 1}
      />
    </svg>
  );
}
