"use client";

import { useEffect, useState } from "react";
import { AtSign } from "lucide-react";
import { BRAND } from "@/lib/brand";

export function BrandFooter() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  return (
    <footer className="border-t border-border/60 bg-muted/40 px-4 pt-5 pb-24 md:py-6">
      <div className="mx-auto flex max-w-3xl flex-col gap-3 text-center md:flex-row md:items-center md:justify-between md:text-left">
        <p className="text-xs leading-relaxed text-muted-foreground md:flex-1">
          {mounted ? (
            <>
              <span className="font-semibold text-foreground">{BRAND.name}.</span>{" "}
              Promociones y disponibilidad actualizada en nuestro Instagram. Contáctanos por WhatsApp para descuentos al por mayor.
            </>
          ) : (
            // Empty on server to avoid any extension interference during hydration
            <span className="opacity-0">.</span>
          )}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 md:shrink-0">
          <a
            href={BRAND.whatsapp.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-green-500 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-green-500/25 transition-luxury hover:bg-green-600"
          >
            <span className="font-bold">WhatsApp:</span>
            <span>{BRAND.whatsapp.display}</span>
            <span className="sr-only">(se abre en una pestaña nueva)</span>
          </a>
          <a
            href={BRAND.instagram.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-orange px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-brand-orange/25 transition-luxury hover:bg-brand-orange/90"
          >
            <AtSign className="h-4 w-4" aria-hidden />
            <span>{BRAND.instagram.handle}</span>
            <span className="sr-only">(se abre en una pestaña nueva)</span>
          </a>
        </div>
      </div>
    </footer>
  );
}
