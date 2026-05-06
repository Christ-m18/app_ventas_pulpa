import Link from "next/link";
import { ChevronRight, Flame } from "lucide-react";
import { ProductCard } from "@/features/products/components/ProductCard";
import type { Product } from "../../../packages/core/domain/entities/product";

type Props = {
  title: string;
  subtitle?: string;
  products: Product[];
  href?: string;
};

export function FeaturedCarousel({ title, subtitle, products, href = "/catalogo" }: Props) {
  if (products.length === 0) return null;

  return (
    <section className="space-y-4">
      <div className="flex items-end justify-between gap-4">
        <div className="min-w-0">
          <p className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.25em] text-brand-orange">
            <Flame className="h-3.5 w-3.5" />
            {subtitle ?? "Lo más pedido"}
          </p>
          <h2 className="text-2xl font-black tracking-tight md:text-3xl">{title}</h2>
        </div>
        <Link
          href={href}
          className="hidden shrink-0 items-center gap-1 text-sm font-bold text-brand-orange transition-luxury hover:text-brand-orange/80 sm:inline-flex"
        >
          Ver todo
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Mobile: horizontal scroll · Desktop: grid */}
      <div className="-mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto scrollbar-hide pb-2 sm:grid sm:snap-none sm:grid-cols-3 sm:overflow-visible sm:gap-4 sm:pb-0 lg:grid-cols-4 xl:grid-cols-5">
          {products.map((p) => (
            <div
              key={p.id}
              className="w-[68vw] shrink-0 snap-start sm:w-auto"
            >
              <ProductCard product={p} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
