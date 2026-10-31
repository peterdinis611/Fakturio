import { apiFetchBlob } from "@/shared/api/client";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  try {
    const { blob, filename, contentType } = await apiFetchBlob(
      "/api/exports/money-s3.xml",
      {
        from: from || undefined,
        to: to || undefined,
      },
      "application/xml",
    );

    return new Response(blob, {
      headers: {
        "Content-Type": contentType || "application/xml; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename || "money-s3.xml"}"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch {
    return new Response("Export Money S3 XML sa nepodaril", { status: 502 });
  }
}
