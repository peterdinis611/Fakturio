import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { AUTH_COOKIE } from "@/shared/auth/constants";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

function isApiOrTrpc(pathname: string) {
  return pathname.startsWith("/api") || pathname.startsWith("/trpc");
}

function stripLocale(pathname: string) {
  for (const locale of routing.locales) {
    if (pathname === `/${locale}`) return "/";
    if (pathname.startsWith(`/${locale}/`)) {
      return pathname.slice(locale.length + 1) || "/";
    }
  }
  return pathname;
}

function isPublicPath(path: string) {
  return (
    path === "/" ||
    path.startsWith("/sign-in") ||
    path.startsWith("/sign-up") ||
    path.startsWith("/api")
  );
}

export default function middleware(req: NextRequest) {
  if (isApiOrTrpc(req.nextUrl.pathname)) {
    return NextResponse.next();
  }

  const path = stripLocale(req.nextUrl.pathname);
  const token = req.cookies.get(AUTH_COOKIE)?.value;
  const isAuthed = Boolean(token);

  if (!isPublicPath(path) && !isAuthed) {
    const locale =
      routing.locales.find((l) => req.nextUrl.pathname.startsWith(`/${l}/`) || req.nextUrl.pathname === `/${l}`)
      ?? routing.defaultLocale;
    const signIn = locale === routing.defaultLocale ? "/sign-in" : `/${locale}/sign-in`;
    const url = req.nextUrl.clone();
    url.pathname = signIn;
    url.searchParams.set("next", path);
    return NextResponse.redirect(url);
  }

  if (
    isAuthed &&
    (path.startsWith("/sign-in") || path.startsWith("/sign-up"))
  ) {
    const locale =
      routing.locales.find((l) => req.nextUrl.pathname.startsWith(`/${l}/`) || req.nextUrl.pathname === `/${l}`)
      ?? routing.defaultLocale;
    const dash = locale === routing.defaultLocale ? "/dashboard" : `/${locale}/dashboard`;
    const url = req.nextUrl.clone();
    url.pathname = dash;
    url.search = "";
    return NextResponse.redirect(url);
  }

  return intlMiddleware(req);
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
