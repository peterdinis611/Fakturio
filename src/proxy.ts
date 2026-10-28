import { clerkMiddleware } from "@clerk/nextjs/server";
import createMiddleware from "next-intl/middleware";
import { NextResponse } from "next/server";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

function isApiOrTrpc(pathname: string) {
  return pathname.startsWith("/api") || pathname.startsWith("/trpc");
}

export default clerkMiddleware(async (_auth, req) => {
  // Keep API out of locale rewrites; let Clerk still decorate the request.
  if (isApiOrTrpc(req.nextUrl.pathname)) {
    return NextResponse.next();
  }

  return intlMiddleware(req);
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
    "/__clerk/(.*)",
  ],
};
