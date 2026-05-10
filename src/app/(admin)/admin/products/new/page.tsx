import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { listCategories } from "@/features/admin/services/adminProductService";
import { createProductAction } from "@/features/admin/actions/productActions";
import { ProductForm } from "@/features/admin/components/ProductForm";

export const metadata = { title: "Nuevo producto" };

export default async function NewProductPage() {
  const categories = await listCategories();

  return (
    <div className="space-y-6">
      <Link
        href="/admin/products"
        className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Volver a productos
      </Link>

      <h1 className="text-3xl font-black tracking-tight">Nuevo producto</h1>

      <div className="max-w-2xl rounded-2xl bg-card p-6 ring-1 ring-foreground/5 shadow-md">
        <ProductForm categories={categories} action={createProductAction} />
      </div>
    </div>
  );
}
