import Image from "next/image";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { BRAND } from "@/lib/brand";

type Props = {
  /** Imagen estática (jpg) o video (mp4) de fondo del hero. */
  heroSrc: string | null;
};

function isVideo(src: string | null): boolean {
  return !!src && /\.(mp4|webm|mov)(\?|$)/i.test(src);
}

export function HeroSection({ heroSrc }: Props) {
  const video = isVideo(heroSrc);

  return (
    <section className="relative overflow-hidden rounded-[28px] shadow-2xl shadow-brand-orange/20 ring-1 ring-brand-orange/15 md:rounded-[32px]">
      <div className="relative aspect-16/11 min-h-[260px] sm:aspect-2/1 md:min-h-[340px] lg:aspect-21/9">
        {heroSrc && video ? (
          <video
            src={heroSrc}
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : heroSrc ? (
          <Image
            src={heroSrc}
            alt={`${BRAND.name} — pulpas y fruta natural`}
            fill
            priority
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1080px"
            className="object-cover object-center"
          />
        ) : (
          <div className="absolute inset-0 bg-citrus-splash" />
        )}

        {/* Citrus juice splash overlay */}
        <div
          className="absolute inset-0 bg-linear-to-tr from-brand-orange/55 via-brand-mandarin/25 to-brand-lemon/35 mix-blend-multiply"
          aria-hidden
        />
        <div
          className="absolute inset-0 bg-linear-to-t from-black/65 via-black/30 to-transparent"
          aria-hidden
        />

        <div className="relative z-10 flex h-full flex-col justify-between p-5 text-white sm:p-6 md:p-8 lg:p-10">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/35 bg-white/15 px-3 py-1.5 text-xs font-bold tracking-wide backdrop-blur-md">
              <Sparkles className="h-4 w-4 text-brand-lemon" aria-hidden />
              100% natural · RD
            </span>
            <Link
              href={BRAND.instagram.url}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-white/30 bg-black/25 px-3 py-1.5 text-xs font-semibold backdrop-blur-md transition-luxury hover:bg-black/40"
            >
              {BRAND.instagram.handle}
            </Link>
          </div>

          <div className="max-w-xl space-y-3 md:space-y-4">
            <h2 className="text-3xl font-black leading-[1.05] tracking-tight drop-shadow-lg sm:text-4xl md:text-5xl lg:text-[3.5rem]">
              Frescura
              <br />
              <span className="text-brand-lemon">cítrica</span> en tu mesa
            </h2>
            <p className="max-w-[95%] text-sm font-medium leading-relaxed text-white/95 drop-shadow md:max-w-[90%] md:text-base">
              Pulpas, jugos y fruta congelada — la misma calidad de{" "}
              {BRAND.instagram.handle} llevada hasta tu cocina.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
