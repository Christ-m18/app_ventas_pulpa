import { Suspense } from "react";
import { productService } from "@/features/products/services/productService";
import { ProductList } from "@/features/products/components/ProductList";
import { AIRecommendations } from "@/features/ai/components/AIRecommendations";
import { BRAND } from "@/lib/brand";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Catálogo de pulpas",
  description: `Pulpas naturales, jugos y combos. Novedades en ${BRAND.instagram.handle}.`,
};

export default async function CatalogoPage() {
  const [products, categories] = await Promise.all([
    productService.getProducts(),
    productService.getCategories(),
  ]);

  return (
    <div className="space-y-8 px-4 py-4 sm:space-y-10 sm:px-5 md:px-0 md:py-6">
      <div className="space-y-3 text-center sm:space-y-4">
        <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.25em] text-brand-orange">
          Catálogo
        </p>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
          Todo lo que tenemos al natural
        </h1>
        <p className="mx-auto max-w-[700px] text-sm text-muted-foreground sm:text-base md:text-lg">
          Pulpas congeladas, jugos por galón y combos cítricos — la misma línea que mostramos en{" "}
          {BRAND.instagram.handle}.
        </p>
      </div>

      <AIRecommendations allProducts={products} />

      <Suspense fallback={<div className="h-32" />}>
        <ProductList products={products} categories={categories} />
      </Suspense>
    </div>
  );
}
