import Link from "next/link";
import { AtSign, ExternalLink } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { BRAND } from "@/lib/brand";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Perfil y contacto",
  description: `Conecta con ${BRAND.name} en Instagram: ${BRAND.instagram.handle}.`,
};

export default function PerfilPage() {
  return (
    <div className="mx-auto max-w-lg space-y-8 px-4 py-12 text-center md:py-16">
      <div className="space-y-2">
        <p className="text-sm font-medium uppercase tracking-[0.25em] text-primary">Marca</p>
        <h1 className="text-2xl font-black tracking-tight text-foreground md:text-3xl">
          {BRAND.name}
        </h1>
        <p className="text-pretty text-muted-foreground">{BRAND.tagline}</p>
      </div>

      <div className="rounded-2xl border border-border/60 bg-card p-6 text-left shadow-lg shadow-black/10">
        <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold">
          <AtSign className="h-5 w-5 text-primary" aria-hidden />
          Instagram
        </h2>
        <p className="text-sm text-muted-foreground">
          Publicamos combos, disponibilidad y novedades en nuestro perfil oficial. Es la referencia
          principal para coordinar pedidos y ver qué hay en temporada.
        </p>
        <a
          href={BRAND.instagram.url}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            buttonVariants({ variant: "default", size: "lg" }),
            "mt-5 w-full justify-center gap-2"
          )}
        >
          Abrir {BRAND.instagram.handle}
          <ExternalLink className="h-4 w-4 opacity-80" aria-hidden />
        </a>
      </div>

      <p className="text-xs text-muted-foreground">
        Compras en esta web: entrega a domicilio según las zonas del checkout. Para consultas
        puntuales, escríbenos por Instagram.
      </p>

      <div className="flex flex-wrap justify-center gap-3">
        <Link href="/" className={cn(buttonVariants({ variant: "ghost" }), "inline-flex")}>
          Portada del sitio
        </Link>
        <Link href="/catalogo" className={cn(buttonVariants({ variant: "outline" }), "inline-flex")}>
          Ver catálogo
        </Link>
      </div>
    </div>
  );
}
