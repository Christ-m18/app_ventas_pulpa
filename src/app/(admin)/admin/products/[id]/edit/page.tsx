import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Trash2 } from "lucide-react";
import { getProduct, listCategories, listInventoryLogs } from "@/features/admin/services/adminProductService";
import { updateProductAction } from "@/features/admin/actions/productActions";
import { ProductForm } from "@/features/admin/components/ProductForm";
import { DeleteProductButton } from "@/features/admin/components/DeleteProductButton";
import { formatDateTime } from "@/features/admin/lib/format";

export const dynamic = "force-dynamic";
export const metadata = { title: "Editar producto" };

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [product, categories, logs] = await Promise.all([
    getProduct(id),
    listCategories(),
    listInventoryLogs(id),
  ]);
  if (!product) notFound();

  const boundAction = updateProductAction.bind(null, id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/admin/products"
          className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Volver a productos
        </Link>
        <DeleteProductButton productId={id} productName={product.name} />
      </div>

      <h1 className="text-3xl font-black tracking-tight">
        Editar: <span className="text-brand-orange">{product.name}</span>
      </h1>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="max-w-2xl rounded-2xl bg-card p-6 ring-1 ring-foreground/5 shadow-md lg:col-span-2">
          <ProductForm product={product} categories={categories} action={boundAction} />
        </div>

        <aside className="rounded-2xl bg-card p-5 ring-1 ring-foreground/5 shadow-md">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-muted-foreground">
            Historial de inventario
          </h2>
          {logs.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sin movimientos registrados.</p>
          ) : (
            <ul className="space-y-2">
              {logs.map((log) => (
                <li
                  key={log.id}
                  className="rounded-xl bg-muted/40 p-3 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold capitalize">{log.reason}</span>
                    <span
                      className={
                        log.change > 0
                          ? "font-mono font-bold text-emerald-600"
                          : "font-mono font-bold text-destructive"
                      }
                    >
                      {log.change > 0 ? "+" : ""}
                      {log.change}
                    </span>
                  </div>
                  <p className="mt-1 text-muted-foreground">
                    {formatDateTime(log.created_at)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </aside>
      </div>
    </div>
  );
}
