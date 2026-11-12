import { apiFetchBlob } from "@/shared/api/client";

export async function GET(
  request: Request,
  context: { params: Promise<{ token: string }> },
) {
  const { token } = await context.params;
  const disposition =
    new URL(request.url).searchParams.get("disposition") === "attachment"
      ? "attachment"
      : "inline";

  try {
    const { blob, filename, contentType } = await apiFetchBlob(
      `/api/public/invoices/${encodeURIComponent(token)}/isdoc`,
      undefined,
      "application/xml, text/xml, */*",
      { skipAuth: true },
    );
    const name = filename || `faktura-${token}.isdoc`;
    return new Response(blob, {
      headers: {
        "Content-Type": contentType ?? "application/xml",
        "Content-Disposition": `${disposition}; filename="${name}"`,
        "Cache-Control": "public, max-age=300",
      },
    });
  } catch {
    return new Response("ISDOC sa nepodarilo načítať", { status: 502 });
  }
}
