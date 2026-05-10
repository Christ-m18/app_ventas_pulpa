"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function BillingDateFilter({ from, to }: { from: string; to: string }) {
  const router = useRouter();
  const [f, setF] = useState(from);
  const [t, setT] = useState(to);

  function apply() {
    const params = new URLSearchParams();
    if (f) params.set("from", f);
    if (t) params.set("to", t);
    router.push(`/admin/billing?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap items-end gap-3">
      <label className="space-y-1">
        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          Desde
        </span>
        <Input type="date" value={f} onChange={(e) => setF(e.target.value)} className="w-40" />
      </label>
      <label className="space-y-1">
        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          Hasta
        </span>
        <Input type="date" value={t} onChange={(e) => setT(e.target.value)} className="w-40" />
      </label>
      <Button
        size="sm"
        onClick={apply}
        className="bg-brand-orange text-white hover:bg-brand-orange/90"
      >
        Aplicar
      </Button>
    </div>
  );
}
