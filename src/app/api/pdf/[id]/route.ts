import { apiFetchBlob } from "@/lib/api/client";

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
    const { blob, filename } = await apiFetchBlob(`/api/invoices/${id}/pdf`);
    const name = filename || `faktura-${id}.pdf`;
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
