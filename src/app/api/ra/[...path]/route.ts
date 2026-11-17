import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE } from "@/shared/auth/constants";

export const dynamic = "force-dynamic";

const DEFAULT_BASE = "http://localhost:5148";

function apiBase() {
  return process.env.API_BASE_URL?.replace(/\/$/, "") || DEFAULT_BASE;
}

async function proxy(req: NextRequest, pathParts: string[]) {
  const jar = await cookies();
  const token = jar.get(AUTH_COOKIE)?.value;
  if (!token) {
    return NextResponse.json({ title: "Unauthorized" }, { status: 401 });
  }

  const target = new URL(
    `/api/admin/ra/${pathParts.map(encodeURIComponent).join("/")}`,
    `${apiBase()}/`,
  );
  target.search = req.nextUrl.search;

  const headers = new Headers();
  headers.set("Authorization", `Bearer ${token}`);
  headers.set("Accept", "application/json");
  const contentType = req.headers.get("content-type");
  if (contentType) headers.set("Content-Type", contentType);

  const init: RequestInit = {
    method: req.method,
    headers,
    cache: "no-store",
  };

  if (req.method !== "GET" && req.method !== "HEAD") {
    const body = await req.text();
    if (body) init.body = body;
  }

  const upstream = await fetch(target, init);
  const text = await upstream.text();
  const resHeaders = new Headers();
  const contentRange = upstream.headers.get("Content-Range");
  if (contentRange) {
    resHeaders.set("Content-Range", contentRange);
    resHeaders.set("Access-Control-Expose-Headers", "Content-Range");
  }
  const upstreamType = upstream.headers.get("Content-Type");
  if (upstreamType) resHeaders.set("Content-Type", upstreamType);

  return new NextResponse(text, {
    status: upstream.status,
    headers: resHeaders,
  });
}

type Ctx = { params: Promise<{ path: string[] }> };

export async function GET(req: NextRequest, ctx: Ctx) {
  const { path } = await ctx.params;
  return proxy(req, path);
}

export async function PUT(req: NextRequest, ctx: Ctx) {
  const { path } = await ctx.params;
  return proxy(req, path);
}

export async function POST(req: NextRequest, ctx: Ctx) {
  const { path } = await ctx.params;
  return proxy(req, path);
}

export async function DELETE(req: NextRequest, ctx: Ctx) {
  const { path } = await ctx.params;
  return proxy(req, path);
}

export async function PATCH(req: NextRequest, ctx: Ctx) {
  const { path } = await ctx.params;
  return proxy(req, path);
}
