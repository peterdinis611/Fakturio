/** Browser download URLs proxied through Next.js → backend exports. */

function withRange(
  path: string,
  params?: { from?: string; to?: string; status?: string },
) {
  const q = new URLSearchParams();
  if (params?.from) q.set("from", params.from);
  if (params?.to) q.set("to", params.to);
  if (params?.status) q.set("status", params.status);
  const qs = q.toString();
  return qs ? `${path}?${qs}` : path;
}

export function invoicesExportHref(params?: {
  from?: string;
  to?: string;
  status?: string;
}) {
  return withRange("/api/exports/invoices", params);
}

export function vatExportHref(params?: { from?: string; to?: string }) {
  return withRange("/api/exports/vat", params);
}

export function moneyS3ExportHref(params?: { from?: string; to?: string }) {
  return withRange("/api/exports/money-s3", params);
}

export function accountantPackHref(params?: { from?: string; to?: string }) {
  return withRange("/api/exports/accountant-pack", params);
}
