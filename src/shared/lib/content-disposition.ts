/**
 * Build a safe Content-Disposition value with ASCII fallback + RFC 5987 filename*.
 */
export function contentDisposition(
  filename: string,
  disposition: "attachment" | "inline" = "attachment",
): string {
  const raw = (filename || "download").replace(/[\r\n"]/g, "_").trim() || "download";
  const ascii = raw
    .normalize("NFKD")
    .replace(/[^\x20-\x7E]/g, "_")
    .replace(/[/\\?%*:|<>]/g, "_")
    .slice(0, 180);
  const safeAscii = ascii || "download";
  const encoded = encodeURIComponent(raw).replace(/['()]/g, escape);

  return `${disposition}; filename="${safeAscii}"; filename*=UTF-8''${encoded}`;
}
