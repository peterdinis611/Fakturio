import { listNotes } from "@/features/notes/api/notes";
import { PageHeader } from "@/widgets/app-shell/page-header";
import { NotesBoard } from "@/widgets/notes/notes-board";

export const metadata = { title: "Poznámky" };

export default async function NotesPage() {
  const data = await listNotes({ pageSize: 100 });
  const pinned = data.items.filter((n) => n.isPinned).length;

  return (
    <div>
      <PageHeader
        title="Poznámky"
        description="Rýchle zápisky mimo faktúr — pripnuté ostávajú navrchu."
        ledger={
          <>
            <span>{data.totalCount} poznámok</span>
            {pinned > 0 ? <span>{pinned} pripnutých</span> : null}
          </>
        }
      />
      <NotesBoard items={data.items} />
    </div>
  );
}
