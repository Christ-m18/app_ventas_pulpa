import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { ProductCard } from "@/features/products/components/ProductCard";
import { productService } from "@/features/products/services/productService";

type Props = {
  excludeId: string;
  categoryId: string | null;
  limit?: number;
};

export async function RelatedProducts({ excludeId, categoryId, limit = 4 }: Props) {
  const all = await productService.getProducts();
  const sameCategory = categoryId
    ? all.filter((p) => p.category_id === categoryId && p.id !== excludeId)
    : [];
  const others = all.filter((p) => p.id !== excludeId && !sameCategory.includes(p));
  const products = [...sameCategory, ...others].slice(0, limit);

  if (products.length === 0) return null;

  return (
    <section className="mt-16 space-y-5">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-brand-orange">
            También te puede gustar
          </p>
          <h2 className="text-2xl font-black tracking-tight md:text-3xl">Productos relacionados</h2>
        </div>
        <Link
          href="/catalogo"
          className="hidden items-center gap-1 text-sm font-bold text-brand-orange transition-luxury hover:text-brand-orange/80 sm:inline-flex"
        >
          Ver todo
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}
