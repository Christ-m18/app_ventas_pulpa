import Link from "next/link";
import { Button } from "@/components/ui/button";
import { GalleryStrip } from "@/components/home/GalleryStrip";
import { HeroSection } from "@/components/home/HeroSection";
import { ProductCard } from "@/features/products/components/ProductCard";
import { productService } from "@/features/products/services/productService";
import { BRAND } from "@/lib/brand";
import { getSiteJpegPaths } from "@/lib/site-images";
import { ArrowRight, Zap, Droplets, Leaf, Sparkles } from "lucide-react";

export default async function TiendaPage() {
  const featuredProducts = await productService.getFeaturedProducts();
  const jpegPaths = getSiteJpegPaths();
  const heroSrc = jpegPaths[0] ?? null;
  const galleryPaths = jpegPaths.slice(1, 25);

  return (
    <div className="flex min-h-screen flex-col pb-6 md:pb-10">
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-border/50 bg-background/80 px-4 py-4 backdrop-blur-xl sm:px-5 md:hidden">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Bienvenido a</p>
          <h1 className="text-xl font-black leading-tight text-foreground">
            {BRAND.shortTitle}
          </h1>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-full border border-primary/30 bg-primary/15 text-primary shadow-sm">
          <Leaf className="h-5 w-5" />
        </div>
      </header>

      <div className="mt-6 space-y-10 px-4 sm:px-5 md:mt-8 md:space-y-12 md:px-0">
        <HeroSection heroSrc={heroSrc} />

        <GalleryStrip imagePaths={galleryPaths} />

        <section className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory -mx-5 px-5">
          {[
            { id: 1, icon: Zap, label: "Energía", color: "bg-brand-mango/15 text-brand-mango border-brand-mango/25" },
            { id: 2, icon: Droplets, label: "Detox", color: "bg-primary/15 text-primary border-primary/25" },
            { id: 3, icon: Leaf, label: "Tropical", color: "bg-brand-lime/15 text-brand-lime border-brand-lime/25" },
            { id: 4, icon: Sparkles, label: "Combos", color: "bg-brand-mora/15 text-brand-mora border-brand-mora/25" },
          ].map((feature) => (
            <div key={feature.id} className="flex min-w-[72px] snap-start flex-col items-center gap-2">
              <div
                className={`flex h-16 w-16 items-center justify-center rounded-2xl border shadow-lg shadow-black/10 ${feature.color}`}
              >
                <feature.icon className="h-7 w-7" />
              </div>
              <span className="text-[11px] font-semibold text-muted-foreground">{feature.label}</span>
            </div>
          ))}
        </section>

        <section className="space-y-4">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-foreground">Favoritos</h2>
              <p className="text-sm text-muted-foreground">Lo más pedido esta semana</p>
            </div>
            <Link
              href="/catalogo"
              className="flex items-center gap-1 text-sm font-bold text-primary transition-luxury hover:text-primary/80"
            >
              Ver todo
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
            {featuredProducts.length > 0 ? (
              featuredProducts.map((product) => <ProductCard key={product.id} product={product} />)
            ) : (
              <div className="col-span-2 rounded-2xl border border-dashed bg-muted/50 py-10 text-center">
                <p className="text-sm text-muted-foreground">No hay productos destacados aún.</p>
              </div>
            )}
          </div>
        </section>

        <section className="relative mt-4 overflow-hidden rounded-[32px] border border-border/60 bg-card p-6 text-center shadow-2xl shadow-primary/10 ring-1 ring-primary/20">
          <div className="absolute inset-0 bg-linear-to-tr from-primary/20 via-primary/5 to-transparent" />
          <div
            className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/20 blur-3xl"
            aria-hidden
          />
          <div className="relative z-10">
            <h2 className="text-2xl font-black">Plan Detox Semanal</h2>
            <p className="mt-2 mb-6 px-4 text-sm text-muted-foreground">
              5 jugos diseñados para limpiar tu cuerpo y llenarte de energía.
            </p>
            <Link href="/catalogo?category=combos">
              <Button className="h-14 w-full rounded-2xl text-base font-bold shadow-lg shadow-primary/30">
                Ver planes
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
