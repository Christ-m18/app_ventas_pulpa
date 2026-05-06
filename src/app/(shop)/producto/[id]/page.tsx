import Link from "next/link";
import { notFound } from "next/navigation";
import {
  CheckCircle2,
  ChevronRight,
  Home,
  Leaf,
  Sparkles,
  Truck,
  ShieldCheck,
} from "lucide-react";
import { AddToCartBar } from "@/features/products/components/AddToCartBar";
import { ProductMedia } from "@/features/products/components/ProductMedia";
import { RelatedProducts } from "@/features/products/components/RelatedProducts";
import { productService } from "@/features/products/services/productService";
import { resolveProductImage } from "@/features/products/utils/productImage";
import { BRAND } from "@/lib/brand";

type Params = { id: string };

export async function generateMetadata({ params }: { params: Promise<Params> }) {
  const { id } = await params;
  const product = await productService.getProductById(id);
  if (!product) return { title: "Producto no encontrado" };
  return {
    title: product.name,
    description: product.description ?? `${product.name} | ${BRAND.name}`,
  };
}

export default async function ProductPage({ params }: { params: Promise<Params> }) {
  const { id } = await params;
  const product = await productService.getProductById(id);
  if (!product) notFound();

  const src = resolveProductImage(product);
  const inStock = product.stock > 0;
  const stockLabel = inStock
    ? product.stock < 10
      ? `Solo ${product.stock} disponibles`
      : "En stock"
    : "Agotado";

  return (
    <div className="mx-auto w-full max-w-7xl px-4 pb-32 pt-4 md:px-6 md:pb-12">
      {/* Breadcrumb */}
      <nav aria-label="Migajas de pan" className="mb-4 flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
        <Link href="/tienda" className="inline-flex items-center gap-1 transition-luxury hover:text-brand-orange">
          <Home className="h-3 w-3" /> Inicio
        </Link>
        <ChevronRight className="h-3 w-3 opacity-60" />
        <Link href="/catalogo" className="transition-luxury hover:text-brand-orange">
          Catálogo
        </Link>
        <ChevronRight className="h-3 w-3 opacity-60" />
        <span className="line-clamp-1 max-w-[14rem] text-foreground">{product.name}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        {/* Media — sticky on desktop */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-md shadow-brand-orange/10">
            <ProductMedia
              src={src}
              alt={product.name}
              priority
              aspect="square"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
        </div>

        {/* Info */}
        <div className="flex flex-col gap-6">
          <div className="flex flex-wrap gap-2">
            {product.is_featured && (
              <span className="inline-flex items-center gap-1 rounded-full bg-brand-orange/15 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-brand-orange">
                <Sparkles className="h-3 w-3" /> Top venta
              </span>
            )}
            <span className="inline-flex items-center gap-1 rounded-full bg-brand-lime/15 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-brand-lime">
              <Leaf className="h-3 w-3" /> 100% natural
            </span>
            {product.is_combo && (
              <span className="inline-flex items-center gap-1 rounded-full bg-brand-grapefruit/15 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-brand-grapefruit">
                Combo
              </span>
            )}
          </div>

          <h1 className="text-3xl font-black tracking-tight md:text-4xl">{product.name}</h1>

          {product.description && (
            <p className="text-base leading-relaxed text-muted-foreground">{product.description}</p>
          )}

          {/* Price block */}
          <div className="rounded-3xl border border-border bg-card p-5 shadow-md shadow-brand-orange/5">
            <div className="flex items-baseline gap-3">
              <span className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                RD$
              </span>
              <span className="text-4xl font-black leading-none text-brand-orange md:text-5xl">
                {Number(product.price).toFixed(2)}
              </span>
              <span className="ml-auto text-xs font-medium uppercase tracking-wider text-muted-foreground">
                / {product.unit}
              </span>
            </div>
            <p className={`mt-2 text-sm font-semibold ${inStock ? "text-brand-lime" : "text-destructive"}`}>
              {stockLabel}
            </p>
          </div>

          {/* Quantity + Add */}
          <AddToCartBar product={product} />

          {/* Benefits */}
          {product.benefits && product.benefits.length > 0 && (
            <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {product.benefits.map((b) => (
                <li
                  key={b}
                  className="flex items-start gap-2 rounded-2xl border border-border bg-card px-3 py-2.5 text-sm"
                >
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-lime" aria-hidden />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          )}

          {/* Trust badges */}
          <div className="grid grid-cols-1 gap-3 rounded-3xl border border-border bg-card p-5 shadow-sm sm:grid-cols-3">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-orange/15 text-brand-orange">
                <Truck className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-bold">Entrega coordinada</p>
                <p className="text-xs text-muted-foreground">Por WhatsApp/IG</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-lime/15 text-brand-lime">
                <Leaf className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-bold">Fruta seleccionada</p>
                <p className="text-xs text-muted-foreground">Cosecha local</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-grapefruit/15 text-brand-grapefruit">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-bold">Pago seguro</p>
                <p className="text-xs text-muted-foreground">Efectivo o transferencia</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <RelatedProducts excludeId={product.id} categoryId={product.category_id} />

      {/* Sticky mobile add bar */}
      <AddToCartBar product={product} sticky />
    </div>
  );
}
