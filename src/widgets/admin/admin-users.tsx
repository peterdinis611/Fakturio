import { getLocale, getTranslations } from "next-intl/server";
import { formatDate } from "@/shared/lib/format";
import type { AppLocale } from "@/i18n/routing";
import type { AdminUserSummary, PagedResponse } from "@/shared/api/types";
import { MotionItem } from "@/shared/ui/motion/page-motion";

export async function AdminUsersBody({
  dataPromise,
}: {
  dataPromise: Promise<PagedResponse<AdminUserSummary>>;
}) {
  const t = await getTranslations("Admin");
  const locale = (await getLocale()) as AppLocale;
  const data = await dataPromise;

  return (
    <MotionItem>
      <div className="overflow-x-auto border-t border-border">
        <table className="w-full min-w-[640px] text-left text-[13px]">
          <thead>
            <tr className="border-b border-border text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
              <th className="py-3 pr-4 font-medium">{t("colEmail")}</th>
              <th className="py-3 pr-4 font-medium">{t("colCompany")}</th>
              <th className="py-3 pr-4 font-medium">{t("colCreated")}</th>
              <th className="py-3 pr-4 font-medium">{t("colSeen")}</th>
              <th className="py-3 font-medium">{t("colRole")}</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((u) => (
              <tr key={u.id} className="border-b border-border/70">
                <td className="py-2.5 pr-4">
                  <p className="font-medium text-ink">{u.email}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {[u.firstName, u.lastName].filter(Boolean).join(" ") || "—"}
                  </p>
                </td>
                <td className="py-2.5 pr-4 text-muted-foreground">
                  {u.companyName || t("noCompany")}
                </td>
                <td className="data-num py-2.5 pr-4 text-muted-foreground">
                  {formatDate(u.createdAt, locale)}
                </td>
                <td className="data-num py-2.5 pr-4 text-muted-foreground">
                  {u.lastSeenAt ? formatDate(u.lastSeenAt, locale) : "—"}
                </td>
                <td className="py-2.5 text-muted-foreground">
                  {u.isAdmin ? "admin" : "user"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-3 text-[12px] text-muted-foreground">
          {t("usersPaging", {
            page: data.page,
            total: data.totalCount,
          })}
        </p>
      </div>
    </MotionItem>
  );
}
