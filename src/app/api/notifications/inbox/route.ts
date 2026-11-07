import { NextResponse } from "next/server";
import { apiFetch } from "@/shared/api/client";
import { isApiError } from "@/shared/api/errors";
import type { NotificationList } from "@/features/notifications/model/types";

/** Browser-friendly GET for the notification bell (avoids Server Action POST). */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const take = Math.min(
    50,
    Math.max(1, Number(url.searchParams.get("take") || 20) || 20),
  );

  try {
    const data = await apiFetch<NotificationList>("/api/notifications", {
      searchParams: { take },
      next: { tags: ["notifications"], revalidate: 15 },
    });
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "private, max-age=10, stale-while-revalidate=30",
      },
    });
  } catch (error) {
    if (isApiError(error)) {
      return NextResponse.json(
        { error: error.message || "failed" },
        { status: error.status || 500 },
      );
    }
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
}
