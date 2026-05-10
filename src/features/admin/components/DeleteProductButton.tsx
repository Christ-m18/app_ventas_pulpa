"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { deleteProductAction } from "../actions/productActions";

export function DeleteProductButton({
  productId,
  productName,
}: {
  productId: string;
  productName: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [confirming, setConfirming] = useState(false);

  async function handleDelete() {
    setBusy(true);
    const res = await deleteProductAction(productId);
    setBusy(false);
    if (res.ok) {
      toast.success(`"${productName}" eliminado`);
      router.push("/admin/products");
    } else {
      toast.error(res.error ?? "No se pudo eliminar");
      setConfirming(false);
    }
  }

  if (!confirming) {
    return (
      <Button
        variant="destructive"
        size="sm"
        onClick={() => setConfirming(true)}
        className="gap-1.5"
      >
        <Trash2 className="h-3.5 w-3.5" aria-hidden />
        Eliminar
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-semibold text-destructive">Confirmar?</span>
      <Button
        variant="destructive"
        size="sm"
        onClick={handleDelete}
        disabled={busy}
      >
        {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden /> : "Sí, eliminar"}
      </Button>
      <Button variant="outline" size="sm" onClick={() => setConfirming(false)}>
        Cancelar
      </Button>
    </div>
  );
}
