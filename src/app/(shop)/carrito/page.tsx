"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/features/cart/store/useCartStore";
import { isVideoSource } from "@/features/products/utils/productImage";

export default function CarritoPage() {
  const { items, removeItem, updateQuantity, getTotal, getSubtotal, getDiscount } = useCartStore();
  const total = getTotal();
  const subtotal = getSubtotal();
  const discount = getDiscount();

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center px-4 py-16 text-center md:py-24">
        <ShoppingCart className="mb-4 h-16 w-16 text-muted-foreground" aria-hidden />
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Tu carrito está vacío</h1>
        <p className="mt-2 max-w-md text-muted-foreground">
          Explora el catálogo y añade pulpas para verlas aquí.
        </p>
        <Link href="/catalogo" className={cn(buttonVariants({ size: "lg" }), "mt-8")}>
          Ir al catálogo
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 px-4 py-4 sm:px-5 md:space-y-8 md:px-0 md:py-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Carrito</h1>
        <p className="text-sm text-muted-foreground md:text-base">
          Revisa cantidades y continúa al pago.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3 lg:gap-10">
        <ul className="space-y-3 lg:col-span-2">
          {items.map((item) => (
            <li
              key={item.product.id}
              className="flex flex-col gap-4 rounded-2xl border border-border/60 bg-card p-4 sm:flex-row sm:items-center"
            >
              <div className="relative mx-auto h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-muted sm:mx-0">
                {item.product.image_url ? (
                  isVideoSource(item.product.image_url) ? (
                    <video 
                      src={item.product.image_url} 
                      className="w-full h-full object-cover" 
                      muted 
                      playsInline 
                    />
                  ) : (
                    <Image 
                      src={item.product.image_url} 
                      alt={item.product.name} 
                      fill 
                      className="object-contain p-2" 
                      sizes="96px" 
                    />
                  )
                ) : null}
              </div>
              <div className="min-w-0 flex-1 text-center sm:text-left">
                <h2 className="font-semibold leading-tight">{item.product.name}</h2>
                <p className="text-sm text-muted-foreground">
                  RD${item.product.price} / {item.product.unit}
                </p>
                <div className="mt-3 flex items-center justify-center gap-2 sm:justify-start">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-9 w-9"
                    onClick={() =>
                      item.quantity <= 1
                        ? removeItem(item.product.id)
                        : updateQuantity(item.product.id, item.quantity - 1)
                    }
                    aria-label="Reducir cantidad"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-9 w-9"
                    disabled={item.quantity >= item.product.stock}
                    onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                    aria-label="Aumentar cantidad"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-between gap-4 border-t pt-3 sm:flex-col sm:border-t-0 sm:pt-0">
                <p className="text-lg font-bold text-primary sm:text-right">
                  RD${(item.product.price * item.quantity).toFixed(2)}
                </p>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="shrink-0 text-destructive"
                  onClick={() => removeItem(item.product.id)}
                  aria-label={`Eliminar ${item.product.name}`}
                >
                  <Trash2 className="h-5 w-5" />
                </Button>
              </div>
            </li>
          ))}
        </ul>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl border border-border/60 bg-muted/30 p-6 flex flex-col gap-4">
            <h2 className="text-lg font-semibold border-b border-border/60 pb-4">Resumen del pedido</h2>
            
            <div className="flex justify-between items-center text-sm text-muted-foreground">
              <span>Subtotal</span>
              <span>RD${subtotal.toFixed(2)}</span>
            </div>
            
            {discount > 0 && (
              <div className="flex justify-between items-center text-sm font-medium text-green-600">
                <span>Descuento por volumen</span>
                <span>-RD${discount.toFixed(2)}</span>
              </div>
            )}
            
            <div className="flex justify-between items-center border-t border-border/60 pt-4">
              <span className="text-base font-medium">Total</span>
              <span className="text-3xl font-black tracking-tight text-brand-orange">
                RD${total.toFixed(2)}
              </span>
            </div>

            <Link
              href="/checkout"
              className={cn(buttonVariants({ size: "lg" }), "mt-6 inline-flex w-full justify-center bg-brand-orange text-white hover:bg-brand-orange/90")}
            >
              Proceder al checkout
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
