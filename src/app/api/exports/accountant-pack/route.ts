import { apiFetchBlob } from "@/shared/api/client";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  try {
    const { blob, filename, contentType } = await apiFetchBlob(
      "/api/exports/accountant-pack.zip",
      {
        from: from || undefined,
        to: to || undefined,
      },
      "application/zip",
    );

    return new Response(blob, {
      headers: {
        "Content-Type": contentType || "application/zip",
        "Content-Disposition": `attachment; filename="${filename || "fakturio-uctovnictvo.zip"}"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch {
    return new Response("Účtovný balík sa nepodarilo pripraviť", { status: 502 });
  }
}
