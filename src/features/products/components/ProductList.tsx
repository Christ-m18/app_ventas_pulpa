"use client";

import { useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type {
  Product,
  Category,
} from "../../../../packages/core/domain/entities/product";
import { ProductCard } from "./ProductCard";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ProductListProps {
  products: Product[];
  categories: Category[];
}

function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

export function ProductList({ products, categories }: ProductListProps) {
  const router = useRouter();
  const params = useSearchParams();
  const query = params.get("q") ?? "";
  const selectedCategory = params.get("categoria");

  const normalizedQuery = useMemo(() => normalize(query.trim()), [query]);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (selectedCategory && p.category_id !== selectedCategory) return false;
      if (!normalizedQuery) return true;
      const haystack = normalize(`${p.name} ${p.description ?? ""}`);
      return haystack.includes(normalizedQuery);
    });
  }, [products, selectedCategory, normalizedQuery]);

  function setCategory(catId: string | null) {
    const sp = new URLSearchParams(params.toString());
    if (catId) sp.set("categoria", catId);
    else sp.delete("categoria");
    const qs = sp.toString();
    router.replace(qs ? `?${qs}` : "?", { scroll: false });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant={selectedCategory === null ? "default" : "outline"}
          onClick={() => setCategory(null)}
          className={cn(
            "rounded-full",
            selectedCategory === null && "bg-brand-orange text-white hover:bg-brand-orange/90",
          )}
        >
          Todos
        </Button>
        {categories.map((category) => {
          const active = selectedCategory === category.id;
          return (
            <Button
              key={category.id}
              type="button"
              variant={active ? "default" : "outline"}
              onClick={() => setCategory(category.id)}
              className={cn(
                "rounded-full",
                active && "bg-brand-orange text-white hover:bg-brand-orange/90",
              )}
            >
              {category.name}
            </Button>
          );
        })}
        <p className="ml-auto text-xs text-muted-foreground">
          {filtered.length} {filtered.length === 1 ? "producto" : "productos"}
          {query && ` para "${query}"`}
        </p>
      </div>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-border bg-card py-16 text-center">
          <p className="text-base font-semibold">No encontramos productos.</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Prueba con otra búsqueda o categoría.
          </p>
        </div>
      )}
    </div>
  );
}
