"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";
import { toggleFeaturedAction } from "../actions/productActions";
import { cn } from "@/lib/utils";

export function ToggleFeaturedButton({
  productId,
  current,
}: {
  productId: string;
  current: boolean;
}) {
  const [featured, setFeatured] = useState(current);
  const [busy, setBusy] = useState(false);

  async function toggle() {
    const next = !featured;
    setBusy(true);
    const res = await toggleFeaturedAction(productId, next);
    setBusy(false);
    if (res.ok) {
      setFeatured(next);
      toast.success(next ? "Destacado" : "Removido de destacados");
    } else {
      toast.error(res.error ?? "Error");
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={busy}
      aria-label={featured ? "Quitar de destacados" : "Destacar"}
      className={cn(
        "inline-flex h-8 w-8 items-center justify-center rounded-full transition-luxury",
        featured
          ? "bg-brand-orange text-white shadow-md shadow-brand-orange/30"
          : "bg-muted text-muted-foreground hover:bg-brand-orange/15 hover:text-brand-orange",
      )}
    >
      <Sparkles className="h-4 w-4" aria-hidden />
    </button>
  );
}
