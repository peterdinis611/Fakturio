import { apiFetchBlob } from "@/shared/api/client";

export async function GET(
  request: Request,
  context: { params: Promise<{ token: string }> },
) {
  const { token } = await context.params;
  const { searchParams } = new URL(request.url);
  const disposition =
    searchParams.get("disposition") === "attachment"
      ? "attachment"
      : "inline";

  try {
    const { blob, filename } = await apiFetchBlob(
      `/api/public/invoices/${encodeURIComponent(token)}/pdf`,
      undefined,
      "application/pdf, */*",
      { skipAuth: true },
    );
    const name = filename || `faktura-${token}.pdf`;
    return new Response(blob, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `${disposition}; filename="${name}"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch {
    return new Response("PDF sa nepodarilo načítať", { status: 502 });
  }
}
