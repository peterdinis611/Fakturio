import { getTranslations } from "next-intl/server";
import { listNotes } from "@/features/notes/api/notes";
import { PageHeader } from "@/widgets/app-shell/page-header";
import { NotesBoard } from "@/widgets/notes/notes-board";

export async function generateMetadata() {
  const t = await getTranslations("Notes");
  return { title: t("title") };
}

export default async function NotesPage() {
  const t = await getTranslations("Notes");
  const data = await listNotes({ pageSize: 100 });
  const pinned = data.items.filter((n) => n.isPinned).length;

  return (
    <div>
      <PageHeader
        title={t("title")}
        description={t("description")}
        ledger={
          <>
            <span>{data.totalCount}</span>
            {pinned > 0 ? <span>{t("pinned", { count: pinned })}</span> : null}
          </>
        }
      />
      <NotesBoard items={data.items} />
    </div>
  );
}
