import { apiFetchBlob } from "@/shared/api/client";
import { contentDisposition } from "@/shared/lib/content-disposition";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;

  try {
    const { blob, filename, contentType } = await apiFetchBlob(
      `/api/attachments/${id}/download`,
      undefined,
      "*/*",
    );
    const name = filename || "priloha";
    return new Response(blob, {
      headers: {
        "Content-Type": contentType ?? "application/octet-stream",
        "Content-Disposition": contentDisposition(name),
        "Cache-Control": "private, no-store",
      },
    });
  } catch {
    return new Response("Prílohu sa nepodarilo stiahnuť", { status: 502 });
  }
}
