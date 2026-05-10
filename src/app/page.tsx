import Image from "next/image";
import Link from "next/link";
import { MarketingHeader } from "@/components/layout/MarketingHeader";
import { BrandWordmark } from "@/components/brand/BrandWordmark";
import { CategoryTiles } from "@/components/home/CategoryTiles";
import { FeaturedCarousel } from "@/components/home/FeaturedCarousel";
import { TrustBanner } from "@/components/home/TrustBanner";
import { buttonVariants } from "@/components/ui/button";
import { BRAND } from "@/lib/brand";
import { getSiteJpegPaths, getSiteMp4Paths } from "@/lib/site-images";
import { productService } from "@/features/products/services/productService";
import { AtSign, ArrowRight, Leaf, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Inicio",
  description: `${BRAND.tagline} Catálogo, entrega y fotos reales de la marca.`,
};

export default async function LandingPage() {
  const jpgs = getSiteJpegPaths();
  const mp4s = getSiteMp4Paths();
  const heroVideo = mp4s.at(-1) ?? null;
  const heroFallback = jpgs[0] ?? null;
  const mosaic = jpgs.slice(1, 25);

  const [featured, categories] = await Promise.all([
    productService.getFeaturedProducts(),
    productService.getCategories(),
  ]);

  const categoryIdBySlug = Object.fromEntries(categories.map((c) => [c.slug, c.id]));

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <MarketingHeader />

      {/* ═══ HERO ═══ */}
      <section className="relative">
        <div className="relative aspect-4/5 min-h-[420px] sm:aspect-21/11 sm:min-h-[480px] md:min-h-[580px]">
          {heroVideo ? (
            <video
              src={heroVideo}
              autoPlay
              loop
              muted
              playsInline
              preload="metadata"
              poster={heroFallback ?? undefined}
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : heroFallback ? (
            <Image
              src={heroFallback}
              alt={`${BRAND.name} — pulpas naturales`}
              fill
              priority
              className="object-cover object-center"
              sizes="100vw"
            />
          ) : (
            <div className="absolute inset-0 bg-citrus-splash" />
          )}

          <div
            className="absolute inset-0 bg-linear-to-tr from-brand-orange/55 via-brand-mandarin/25 to-brand-lemon/35 mix-blend-multiply"
            aria-hidden
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/35 to-black/15" />
          <div className="grain absolute inset-0" />

          <div className="absolute inset-0 flex flex-col justify-end px-4 pb-14 pt-24 sm:px-8 md:pb-20 md:px-12">
            <div className="mx-auto max-w-4xl text-center text-white">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.25em] text-white backdrop-blur-md">
                <Leaf className="h-3.5 w-3.5 text-brand-lemon" aria-hidden />
                Pulpas y frutas naturales · República Dominicana
              </div>

              <h1 className="text-4xl font-black leading-[0.95] tracking-tight drop-shadow-2xl sm:text-6xl md:text-7xl lg:text-[5.5rem]">
                Sabor de fruta,
                <br />
                <span className="text-brand-lemon">recién exprimida</span>
              </h1>

              <p className="mx-auto mt-6 max-w-2xl text-base text-white/95 drop-shadow sm:text-lg md:text-xl">
                {BRAND.tagline}
              </p>

              <div className="mt-10 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
                <Link
                  href="/tienda"
                  className={cn(
                    buttonVariants({ size: "lg" }),
                    "gap-2.5 bg-brand-orange text-base font-bold text-white shadow-2xl shadow-brand-orange/40 transition-luxury hover:scale-[1.03] hover:bg-brand-orange/90 rounded-2xl px-8 py-6",
                  )}
                >
                  Ir a la tienda
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <Link
                  href={BRAND.instagram.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    buttonVariants({ variant: "outline", size: "lg" }),
                    "gap-2 border-white/40 bg-white/10 text-white backdrop-blur-md transition-luxury hover:bg-white/20 hover:text-white rounded-2xl px-8 py-6",
                  )}
                >
                  <AtSign className="h-4 w-4" />
                  Ver Instagram
                </Link>
              </div>

              <div className="mt-7 flex flex-wrap justify-center gap-3 text-sm">
                <Link
                  href="/login"
                  className="font-semibold text-white/90 underline-offset-4 transition-luxury hover:text-brand-lemon hover:underline"
                >
                  Iniciar sesión
                </Link>
                <span className="text-white/60">·</span>
                <Link
                  href="/registro"
                  className="font-semibold text-white/90 underline-offset-4 transition-luxury hover:text-brand-lemon hover:underline"
                >
                  Crear cuenta
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ TRUST + CATEGORIES + FEATURED — Amazon-style stack ═══ */}
      <div className="mx-auto w-full max-w-7xl space-y-10 px-4 py-10 sm:px-6 md:py-14 md:space-y-14">
        <TrustBanner />
        <CategoryTiles categoryIdBySlug={categoryIdBySlug} />

        {featured.length > 0 && (
          <FeaturedCarousel
            title="Más pedidos esta semana"
            subtitle="Top ventas"
            products={featured}
          />
        )}
      </div>

      {/* ═══ GALLERY MOSAIC ═══ */}
      {mosaic.length > 0 && (
        <section className="border-y border-border/60 bg-secondary/30 px-3 py-12 sm:px-4 md:py-16">
          <div className="mx-auto max-w-7xl">
            <div className="mb-2 flex items-center justify-center gap-2 text-brand-orange">
              <Sparkles className="h-4 w-4" />
              <span className="text-xs font-bold uppercase tracking-[0.25em]">Galería</span>
              <Sparkles className="h-4 w-4" />
            </div>
            <h2 className="mb-2 text-center text-2xl font-black tracking-tight md:text-3xl">
              Así trabajamos la fruta
            </h2>
            <p className="mx-auto mb-10 max-w-2xl text-center text-sm text-muted-foreground md:text-base leading-relaxed">
              Fotos reales del contenido de {BRAND.instagram.handle}: preparación, envases y pedidos.
            </p>
            <div className="columns-2 gap-2.5 sm:columns-3 sm:gap-3 md:columns-4 lg:columns-5 lg:gap-3.5 [&>div]:mb-2.5 [&>div]:break-inside-avoid lg:[&>div]:mb-3.5">
              {mosaic.map((src, i) => (
                <div
                  key={src}
                  className="relative overflow-hidden rounded-2xl bg-card shadow-md shadow-brand-orange/5 ring-1 ring-border/50 transition-luxury hover:scale-[1.02] hover:shadow-xl hover:shadow-brand-orange/15"
                >
                  <div className="relative aspect-4/5 w-full sm:aspect-square">
                    <Image
                      src={src}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="(max-width:640px) 50vw, 25vw"
                      loading={i < 12 ? "eager" : "lazy"}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══ FINAL CTA ═══ */}
      <section className="relative mx-auto max-w-4xl px-4 py-16 text-center md:py-24">
        <div className="absolute inset-0 rounded-[40px] bg-citrus-splash opacity-60" aria-hidden />
        <div className="relative z-10">
          <BrandWordmark size="lg" className="mx-auto" />
          <h2 className="mt-6 text-3xl font-black md:text-4xl">¿Listo para pedir?</h2>
          <p className="mt-4 text-muted-foreground leading-relaxed max-w-xl mx-auto">
            Entra al catálogo, arma tu carrito y coordina entrega. También puedes seguir novedades en Instagram.
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/tienda"
              className={cn(
                buttonVariants({ size: "lg" }),
                "bg-brand-orange text-base font-bold text-white shadow-xl shadow-brand-orange/30 hover:bg-brand-orange/90 rounded-2xl px-8 py-6 transition-luxury hover:scale-[1.02]",
              )}
            >
              Comprar ahora
            </Link>
            <Link
              href="/catalogo"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "rounded-2xl px-8 py-6 transition-luxury hover:scale-[1.02]",
              )}
            >
              Ver catálogo
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="border-t border-border/60 bg-card px-4 py-10 text-center text-sm text-muted-foreground">
        <BrandWordmark size="md" className="mx-auto" />
        <a
          href={BRAND.instagram.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex items-center gap-1.5 text-brand-orange transition-luxury hover:underline underline-offset-4"
        >
          <AtSign className="h-4 w-4" />
          {BRAND.instagram.handle}
        </a>
        <p className="mt-4 text-xs text-muted-foreground/70">
          © {new Date().getFullYear()} {BRAND.name}. Todos los derechos reservados.
        </p>
      </footer>
    </div>
  );
}
