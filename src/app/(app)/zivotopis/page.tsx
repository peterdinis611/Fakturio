import { getResumeProfile, listResumeEntries } from "@/actions/resume";
import { PageHeader } from "@/components/layout/page-header";
import { ResumeEntriesTable } from "@/components/resume/resume-entries-table";
import { ResumeProfileForm } from "@/components/resume/resume-profile-form";

export const metadata = { title: "Životopis" };

export default async function ResumePage() {
  const [profile, entries] = await Promise.all([
    getResumeProfile(),
    listResumeEntries({ pageSize: 100 }),
  ]);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Životopis"
        description="Profil a položky pre prezentáciu skúseností — skúsenosti, vzdelanie, certifikáty."
        ledger={
          <>
            <span>{entries.totalCount} položiek</span>
            <span>{profile.fullName || "Bez mena"}</span>
          </>
        }
      />

      <section className="space-y-3">
        <h2 className="text-[15px] font-medium text-ink">Profil</h2>
        <ResumeProfileForm initial={profile} />
      </section>

      <ResumeEntriesTable items={entries.items} />
    </div>
  );
}
