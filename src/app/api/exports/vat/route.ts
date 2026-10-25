import { apiFetchBlob } from "@/lib/api/client";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  try {
    const { blob, filename, contentType } = await apiFetchBlob(
      "/api/exports/vat.csv",
      {
        from: from || undefined,
        to: to || undefined,
      },
      "text/csv",
    );

    return new Response(blob, {
      headers: {
        "Content-Type": contentType || "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename || "dph.csv"}"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch {
    return new Response("Export DPH sa nepodaril", { status: 502 });
  }
}
