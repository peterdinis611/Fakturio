import { apiFetchBlob } from "@/shared/api/client";
import { contentDisposition } from "@/shared/lib/content-disposition";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const status = searchParams.get("status");

  try {
    const { blob, filename, contentType } = await apiFetchBlob(
      "/api/exports/expenses.csv",
      {
        from: from || undefined,
        to: to || undefined,
        status: status || undefined,
      },
      "text/csv",
    );

    return new Response(blob, {
      headers: {
        "Content-Type": contentType || "text/csv; charset=utf-8",
        "Content-Disposition": contentDisposition(filename || "naklady.csv"),
        "Cache-Control": "private, no-store",
      },
    });
  } catch {
    return new Response("Export nákladov sa nepodaril", { status: 502 });
  }
}
