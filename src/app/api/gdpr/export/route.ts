import { apiFetchBlob } from "@/shared/api/client";

export async function GET() {
  try {
    const { blob, filename, contentType } = await apiFetchBlob(
      "/api/gdpr/export.zip",
      undefined,
      "application/zip",
    );

    return new Response(blob, {
      headers: {
        "Content-Type": contentType || "application/zip",
        "Content-Disposition": `attachment; filename="${filename || "fakturio-gdpr.zip"}"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch {
    return new Response("Export sa nepodarilo pripraviť", { status: 502 });
  }
}
