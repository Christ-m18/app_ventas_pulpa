import Link from "next/link";
import { Plus, Sparkles, Star } from "lucide-react";
import { listProducts } from "@/features/admin/services/adminProductService";
import { formatRD } from "@/features/admin/lib/format";
import { cn } from "@/lib/utils";
import { ToggleFeaturedButton } from "@/features/admin/components/ToggleFeaturedButton";

export const dynamic = "force-dynamic";
export const metadata = { title: "Productos" };

export default async function ProductsPage() {
  const products = await listProducts();

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-brand-orange">
            Catálogo
          </p>
          <h1 className="text-3xl font-black tracking-tight">Productos</h1>
        </div>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-2 rounded-xl bg-brand-orange px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-brand-orange/30 transition-luxury hover:bg-brand-orange/90"
        >
          <Plus className="h-4 w-4" aria-hidden />
          Nuevo producto
        </Link>
      </header>

      {products.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted-foreground">
          No hay productos registrados.
        </p>
      ) : (
        <>
        {/* Mobile card layout */}
        <ul className="space-y-3 md:hidden">
          {products.map((p) => (
            <li key={p.id} className="rounded-2xl bg-card p-4 ring-1 ring-foreground/5 shadow-md">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    {p.is_combo && (
                      <span className="rounded bg-brand-lemon/30 px-1.5 py-0.5 text-[9px] font-bold uppercase text-amber-800">
                        Combo
                      </span>
                    )}
                    <p className="font-medium">{p.name}</p>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {p.category_name ?? "Sin categoría"} · {p.unit}
                  </p>
                </div>
                <span className="font-mono text-base font-black text-brand-orange">
                  {formatRD(p.price)}
                </span>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className={cn(
                    "rounded-full px-2.5 py-0.5 text-xs font-bold",
                    p.stock <= 5
                      ? "bg-amber-500/15 text-amber-700"
                      : "bg-brand-lime/15 text-brand-lime",
                  )}>
                    Stock: {p.stock}
                  </span>
                  <ToggleFeaturedButton productId={p.id} current={p.is_featured} />
                </div>
                <Link
                  href={`/admin/products/${p.id}/edit`}
                  className="rounded-lg bg-brand-orange/10 px-3 py-1.5 text-xs font-semibold text-brand-orange transition-luxury hover:bg-brand-orange/20"
                >
                  Editar
                </Link>
              </div>
            </li>
          ))}
        </ul>

        {/* Desktop table layout */}
        <div className="hidden overflow-x-auto rounded-2xl bg-card ring-1 ring-foreground/5 shadow-md md:block">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/60 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                <th className="px-4 py-3">Producto</th>
                <th className="px-4 py-3">Categoría</th>
                <th className="px-4 py-3 text-right">Precio</th>
                <th className="px-4 py-3 text-right">Stock</th>
                <th className="px-4 py-3">Unidad</th>
                <th className="px-4 py-3 text-center">Destacado</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {products.map((p) => (
                <tr key={p.id} className="transition-luxury hover:bg-muted/40">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {p.is_combo && (
                        <span className="rounded bg-brand-lemon/30 px-1.5 py-0.5 text-[9px] font-bold uppercase text-amber-800">
                          Combo
                        </span>
                      )}
                      <span className="font-medium">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {p.category_name ?? "-"}
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-bold">
                    {formatRD(p.price)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span
                      className={cn(
                        "font-mono font-bold",
                        p.stock <= 5 ? "text-amber-700" : "text-foreground",
                      )}
                    >
                      {p.stock}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs">{p.unit}</td>
                  <td className="px-4 py-3 text-center">
                    <ToggleFeaturedButton productId={p.id} current={p.is_featured} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/products/${p.id}/edit`}
                      className="text-xs font-semibold text-brand-orange hover:underline"
                    >
                      Editar
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </>
      )}
    </div>
  );
}
