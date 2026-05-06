"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Minus, Plus, ShoppingBag, Zap } from "lucide-react";
import { toast } from "sonner";
import type { Product } from "../../../../packages/core/domain/entities/product";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/features/cart/store/useCartStore";
import { cn } from "@/lib/utils";

type Props = {
  product: Product;
  /** When true, renders as the sticky mobile bar variant. */
  sticky?: boolean;
  className?: string;
};

export function AddToCartBar({ product, sticky = false, className }: Props) {
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);
  const [qty, setQty] = useState(1);
  const outOfStock = product.stock <= 0;
  const max = Math.max(1, Math.min(99, product.stock));

  function adjust(delta: number) {
    setQty((q) => Math.max(1, Math.min(max, q + delta)));
  }

  function add() {
    addItem(product, qty);
    toast.success(`${product.name} × ${qty} agregado al carrito`);
  }

  function buyNow() {
    addItem(product, qty);
    router.push("/checkout");
  }

  return (
    <div
      className={cn(
        "flex flex-wrap items-stretch gap-3",
        sticky &&
          "fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background/95 p-3 pb-safe shadow-lg backdrop-blur-xl md:hidden",
        className,
      )}
    >
      <div className="flex items-center rounded-full border border-border bg-card">
        <button
          type="button"
          aria-label="Disminuir cantidad"
          onClick={() => adjust(-1)}
          disabled={qty <= 1 || outOfStock}
          className="flex h-11 w-11 items-center justify-center text-muted-foreground transition-luxury hover:text-brand-orange disabled:opacity-40"
        >
          <Minus className="h-4 w-4" />
        </button>
        <span
          aria-live="polite"
          className="min-w-[2.5rem] text-center text-base font-bold tabular-nums"
        >
          {qty}
        </span>
        <button
          type="button"
          aria-label="Aumentar cantidad"
          onClick={() => adjust(1)}
          disabled={qty >= max || outOfStock}
          className="flex h-11 w-11 items-center justify-center text-muted-foreground transition-luxury hover:text-brand-orange disabled:opacity-40"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      <Button
        type="button"
        size="lg"
        onClick={add}
        disabled={outOfStock}
        className="flex-1 gap-2 rounded-full bg-brand-orange text-white shadow-md shadow-brand-orange/30 hover:bg-brand-orange/90"
      >
        <ShoppingBag className="h-4 w-4" />
        {outOfStock ? "Agotado" : "Agregar"}
      </Button>
      <Button
        type="button"
        size="lg"
        variant="outline"
        onClick={buyNow}
        disabled={outOfStock}
        className="hidden gap-2 rounded-full border-brand-orange text-brand-orange hover:bg-brand-orange/10 sm:inline-flex"
      >
        <Zap className="h-4 w-4" />
        Comprar ya
      </Button>
    </div>
  );
}
