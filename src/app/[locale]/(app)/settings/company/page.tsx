import { CheckCircle2, CircleDashed, ListChecks } from "lucide-react";
import { getCompany } from "@/actions/company";
import { CompanyForm } from "@/components/company/company-form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";

export const metadata = { title: "Firma" };

export default async function CompanySettingsPage() {
  const company = await getCompany();
  const c = company.completeness;
  const missing = c.items.filter((i) => i.isRequired && !i.isComplete);

  return (
    <div className="mx-auto max-w-[42rem] space-y-5">
      <Card size="sm" className="rounded-[6px] bg-surface ring-border">
        <CardHeader className="border-b border-rule pb-3">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <CardTitle className="text-[15px]">Firma</CardTitle>
                <Badge
                  variant="outline"
                  className={
                    c.isReadyToInvoice
                      ? "rounded-[4px] border-positive/40 text-positive"
                      : "rounded-[4px] border-warning/40 text-warning"
                  }
                >
                  {c.isReadyToInvoice ? "Pripravené" : "Doplniť"}
                </Badge>
              </div>
              <CardDescription className="mt-1">
                {c.isReadyToInvoice
                  ? "Údaje dodávateľa na faktúrach a PDF sú kompletné."
                  : `${c.percentComplete}% hotové — doplň povinné polia.`}
              </CardDescription>
            </div>
            <Badge
              variant="secondary"
              className="rounded-[4px] data-num shrink-0"
            >
              {c.completedRequired}/{c.totalRequired} povinných
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3 text-[12px] text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <ListChecks className="size-3.5" aria-hidden />
                Dokončenosť
              </span>
              <span className="data-num font-medium text-ink">
                {c.percentComplete}%
              </span>
            </div>
            <Progress value={c.percentComplete} />
          </div>

          {!c.isReadyToInvoice && missing.length > 0 ? (
            <>
              <Separator />
              <Alert className="border-warning/30 bg-pill-warning-bg/60 text-pill-warning-ink">
                <CircleDashed />
                <AlertTitle>Chýbajúce povinné údaje</AlertTitle>
                <AlertDescription>
                  <ul className="mt-1.5 space-y-1">
                    {missing.map((i) => (
                      <li key={i.key} className="text-[13px]">
                        <span className="font-medium">{i.label}</span>
                        {i.hint ? (
                          <span className="text-muted-foreground">
                            {" "}
                            — {i.hint}
                          </span>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            </>
          ) : (
            <>
              <Separator />
              <Alert className="border-positive/25 bg-positive/5">
                <CheckCircle2 className="text-positive" />
                <AlertTitle>Pripravené na fakturáciu</AlertTitle>
                <AlertDescription>
                  Všetky povinné firemné údaje sú vyplnené.
                </AlertDescription>
              </Alert>
            </>
          )}
        </CardContent>
      </Card>

      <CompanyForm initial={company} mode="settings" />
    </div>
  );
}
