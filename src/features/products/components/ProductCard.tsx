"use client";

import Link from "next/link";
import { Plus, Sparkles, X } from "lucide-react";
import { toast } from "sonner";
import type { Product } from "../../../../packages/core/domain/entities/product";
import { useCartStore } from "@/features/cart/store/useCartStore";
import { isVideoSource } from "@/features/products/utils/productImage";
import { ProductMedia } from "./ProductMedia";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem);
  const outOfStock = product.stock <= 0;
  const src = product.image_url ?? null;
  const isVideo = isVideoSource(src);

  const handleAddToCart = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product);
    toast.success(`${product.name} agregado al carrito`);
  };

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-md shadow-brand-orange/5 transition-luxury hover:-translate-y-1 hover:border-brand-orange/30 hover:shadow-2xl hover:shadow-brand-orange/20">
      {/* Stretched link — clicking anywhere except the add-button navigates to detail */}
      <Link
        href={`/producto/${product.id}`}
        aria-label={`Ver ${product.name}`}
        className="absolute inset-0 z-10 rounded-3xl focus-visible:outline-2 focus-visible:outline-brand-orange"
      />

      <div className="relative aspect-square w-full overflow-hidden">
        <div className="absolute inset-0 transition-luxury duration-500 group-hover:scale-[1.04]">
          <ProductMedia
            src={src}
            alt={product.name}
            aspect="square"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        </div>

        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-linear-to-t from-card/95 via-card/40 to-transparent"
          aria-hidden
        />

        {product.is_featured && (
          <span className="absolute left-3 top-3 z-20 inline-flex items-center gap-1 rounded-full bg-brand-orange px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-lg shadow-brand-orange/30">
            <Sparkles className="h-3 w-3" aria-hidden />
            Top
          </span>
        )}

        {isVideo && (
          <span className="absolute right-3 top-3 z-20 rounded-full bg-card/95 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-foreground shadow-lg backdrop-blur">
            Video
          </span>
        )}

        {outOfStock && (
          <span className="absolute bottom-3 right-3 z-20 rounded-full bg-destructive px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
            Agotado
          </span>
        )}
      </div>

      <div className="relative z-20 flex grow flex-col justify-between gap-3 p-4 pointer-events-none">
        <div className="space-y-1">
          <h3 className="line-clamp-2 text-sm font-bold tracking-tight text-foreground transition-luxury group-hover:text-brand-orange">
            {product.name}
          </h3>
          <p className="line-clamp-2 text-xs leading-snug text-muted-foreground">
            {product.description}
          </p>
        </div>

        <div className="flex items-end justify-between">
          <div>
            <span className="block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              RD$
            </span>
            <span className="text-xl font-black leading-none text-brand-orange">
              {product.price}
            </span>
          </div>

          <button
            type="button"
            onClick={handleAddToCart}
            disabled={outOfStock}
            aria-label={outOfStock ? "Agotado" : `Agregar ${product.name} al carrito`}
            className={cn(
              "relative z-20 pointer-events-auto flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-luxury",
              outOfStock
                ? "bg-muted text-muted-foreground"
                : "bg-brand-orange text-white shadow-lg shadow-brand-orange/30 hover:scale-110 hover:shadow-brand-orange/50",
            )}
          >
            {outOfStock ? <X className="h-4 w-4" /> : <Plus className="h-5 w-5 stroke-3" />}
          </button>
        </div>
      </div>
    </article>
  );
}
