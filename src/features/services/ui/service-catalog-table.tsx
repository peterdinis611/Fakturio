"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "@/shared/toast";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { deleteServiceAction } from "@/features/services/api/services";
import { ServiceCatalogForm } from "@/features/services/ui/service-catalog-form";
import { EmptyState } from "@/shared/ui/empty-state";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import type { ServiceCatalogItem } from "@/shared/api/types";
import { actionErrorMessage } from "@/shared/lib/action-utils";
import { formatMoney } from "@/shared/lib/format";

type Props = {
  items: ServiceCatalogItem[];
  isVatPayer: boolean;
  defaultVatRate: number;
};

export function ServiceCatalogTable({
  items,
  isVatPayer,
  defaultVatRate,
}: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [createOpen, setCreateOpen] = useState(false);
  const [editItem, setEditItem] = useState<ServiceCatalogItem | null>(null);

  function refresh() {
    router.refresh();
  }

  function remove(id: string) {
    startTransition(async () => {
      const result = await deleteServiceAction({ id });
      if (!result?.data) {
        toast.error(actionErrorMessage(result ?? {}) ?? "Mazanie zlyhalo");
        return;
      }
      toast.success("Služba odstránená");
      refresh();
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button type="button">
              <Plus className="size-4" aria-hidden />
              Nová služba
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nová služba</DialogTitle>
            </DialogHeader>
            <ServiceCatalogForm
              isVatPayer={isVatPayer}
              defaultVatRate={defaultVatRate}
              onDone={() => {
                setCreateOpen(false);
                refresh();
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {items.length === 0 ? (
        <EmptyState
          title="Katalóg je prázdny"
          description="Pridaj služby a produkty — na faktúre ich pridáš jedným klikom."
        />
      ) : (
        <div className="panel overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-[12px] text-muted-foreground">
                  Popis
                </TableHead>
                <TableHead className="text-[12px] text-muted-foreground">
                  Mj.
                </TableHead>
                <TableHead className="text-right text-[12px] text-muted-foreground">
                  Cena
                </TableHead>
                {isVatPayer ? (
                  <TableHead className="text-right text-[12px] text-muted-foreground">
                    DPH
                  </TableHead>
                ) : null}
                <TableHead className="text-[12px] text-muted-foreground">
                  Stav
                </TableHead>
                <TableHead className="w-24" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id} className="h-11">
                  <TableCell className="font-medium">{item.description}</TableCell>
                  <TableCell>{item.unit}</TableCell>
                  <TableCell className="data-num text-right">
                    {formatMoney(item.unitPrice, "EUR")}
                  </TableCell>
                  {isVatPayer ? (
                    <TableCell className="data-num text-right">
                      {item.vatRate}%
                    </TableCell>
                  ) : null}
                  <TableCell className="text-muted-foreground">
                    {item.isActive ? "Aktívna" : "Neaktívna"}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        disabled={pending}
                        aria-label="Upraviť"
                        onClick={() => setEditItem(item)}
                      >
                        <Pencil className="size-3.5" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        disabled={pending}
                        aria-label="Zmazať"
                        onClick={() => remove(item.id)}
                      >
                        <Trash2 className="size-3.5 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog
        open={Boolean(editItem)}
        onOpenChange={(open) => {
          if (!open) setEditItem(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upraviť službu</DialogTitle>
          </DialogHeader>
          {editItem ? (
            <ServiceCatalogForm
              key={editItem.id}
              initial={editItem}
              isVatPayer={isVatPayer}
              defaultVatRate={defaultVatRate}
              onDone={() => {
                setEditItem(null);
                refresh();
              }}
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
