import Image from "next/image";
import { BRAND } from "@/lib/brand";

type Props = {
  /** Rutas `/images/...` desde `public/images` (fotos del negocio). */
  imagePaths: string[];
};

/** Malla tipo feed con fotos reales del contenido subido. */
export function GalleryStrip({ imagePaths }: Props) {
  if (imagePaths.length === 0) return null;

  return (
    <section aria-label="Galería de fotos" className="space-y-3">
      <p className="text-center text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        Del taller y los pedidos · {BRAND.shortTitle}
      </p>
      <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-4 sm:gap-2 md:grid-cols-6 md:gap-2 lg:grid-cols-6">
        {imagePaths.map((src, i) => (
          <div
            key={src}
            className="relative aspect-square overflow-hidden rounded-xl bg-muted ring-1 ring-black/5 transition-transform duration-300 hover:z-10 hover:scale-[1.02] hover:shadow-lg md:rounded-2xl"
          >
            <Image
              src={src}
              alt=""
              fill
              sizes="(max-width: 640px) 33vw, 16vw"
              className="object-cover"
              loading={i < 6 ? "eager" : "lazy"}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
