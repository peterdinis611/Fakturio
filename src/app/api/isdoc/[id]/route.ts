import { apiFetchBlob } from "@/shared/api/client";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const { searchParams } = new URL(request.url);
  const disposition =
    searchParams.get("disposition") === "attachment"
      ? "attachment"
      : "inline";

  try {
    const { blob, filename, contentType } = await apiFetchBlob(
      `/api/invoices/${id}/isdoc`,
      undefined,
      "application/xml, text/xml, */*",
    );
    const name = filename || `faktura-${id}.isdoc`;
    return new Response(blob, {
      headers: {
        "Content-Type": contentType ?? "application/xml",
        "Content-Disposition": `${disposition}; filename="${name}"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch {
    return new Response("ISDOC sa nepodarilo načítať", { status: 502 });
  }
}
