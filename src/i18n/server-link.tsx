import NextLink from "next/link";
import { getLocale } from "next-intl/server";
import type { ComponentProps } from "react";
import { getPathname } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";

type Href = ComponentProps<typeof NextLink>["href"];

type Props = Omit<ComponentProps<typeof NextLink>, "href"> & {
  href: Href;
  /** Override locale (defaults to the active request locale). */
  locale?: AppLocale;
};

/**
 * Locale-aware link for Server Components.
 *
 * Prefer this over `Link` from `@/i18n/navigation` in RSC trees: next-intl's
 * shared Link calls React `use()` only while the locale promise is pending,
 * which React 19.3 flags as conditional `use()`.
 */
export async function ServerLink({ href, locale: localeProp, ...rest }: Props) {
  const locale = (localeProp ?? (await getLocale())) as AppLocale;
  const pathname = getPathname({
    href: href as string,
    locale,
  });

  return <NextLink href={pathname} {...rest} />;
}
