/** Browser download URLs proxied through Next.js → backend CSV exports. */

export function invoicesExportHref(params?: {
  from?: string;
  to?: string;
  status?: string;
}) {
  const q = new URLSearchParams();
  if (params?.from) q.set("from", params.from);
  if (params?.to) q.set("to", params.to);
  if (params?.status) q.set("status", params.status);
  const qs = q.toString();
  return qs ? `/api/exports/invoices?${qs}` : "/api/exports/invoices";
}

export function vatExportHref(params?: { from?: string; to?: string }) {
  const q = new URLSearchParams();
  if (params?.from) q.set("from", params.from);
  if (params?.to) q.set("to", params.to);
  const qs = q.toString();
  return qs ? `/api/exports/vat?${qs}` : "/api/exports/vat";
}
