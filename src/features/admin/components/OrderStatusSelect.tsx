"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { updateOrderStatusAction } from "../actions/orderActions";
import { ORDER_STATUS_LABEL, statusToneClasses } from "../lib/format";
import { cn } from "@/lib/utils";

const STATUSES = ["pending", "processing", "out_for_delivery", "delivered", "cancelled"] as const;

export function OrderStatusSelect({
  orderId,
  current,
}: {
  orderId: string;
  current: string;
}) {
  const [selected, setSelected] = useState(current);
  const [busy, setBusy] = useState(false);

  async function handleSave() {
    if (selected === current) return;
    setBusy(true);
    const res = await updateOrderStatusAction({ orderId, status: selected });
    setBusy(false);
    if (res.ok) {
      toast.success("Estado actualizado");
    } else {
      toast.error(res.error ?? "Error al actualizar");
      setSelected(current);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex flex-wrap gap-1.5">
        {STATUSES.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setSelected(s)}
            className={cn(
              "rounded-full px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider transition-luxury",
              selected === s
                ? statusToneClasses(s) + " ring-2 ring-foreground/20"
                : "bg-muted text-muted-foreground hover:bg-muted/80",
            )}
          >
            {ORDER_STATUS_LABEL[s] ?? s}
          </button>
        ))}
      </div>
      {selected !== current && (
        <Button
          size="sm"
          onClick={handleSave}
          disabled={busy}
          className="bg-brand-orange text-white hover:bg-brand-orange/90"
        >
          {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden /> : "Guardar"}
        </Button>
      )}
    </div>
  );
}
