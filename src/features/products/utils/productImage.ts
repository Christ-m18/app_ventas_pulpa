import type { Product } from "../../../../packages/core/domain/entities/product";

const I = (filename: string) => `/images/${filename}`;

// Catálogo de assets reales del perfil. Cada entrada DEBE existir en
// /public/images/ con el nombre exacto. Mezcla jpg (foto) y mp4 (video).
const REAL = {
  tamarindo: I("Pulpa de tamarindo.mp4"),
  fresa: I("Fresas congeladas.jpg"),
  cereza: I("Pulpa de cereza.mp4"),
  chinola: I("Pulpa de chinola.mp4"),
  guanabana: I("Pulpa de guanábana.mp4"),
  mango: I("Pulpa de mango.mp4"),
  naranjaJugo: I("Zumo de naranja de jugo.mp4"),
  naranjaAgria: I("Zumo de naranja agria.mp4"),
  mandarina: I("Zumo de mandarina.mp4"),
  limon: I("Zumo de limón.mp4"),
} as const;

const FALLBACK = REAL.tamarindo;

const PATH_OVERRIDES: Record<string, string> = {
  "/images/mango.jpg": REAL.mango,
  "/images/chinola.jpg": REAL.chinola,
  "/images/guanabana.jpg": REAL.guanabana,
  "/images/fresa.jpg": REAL.fresa,
  "/images/limon.jpg": REAL.limon,
  "/images/tamarindo.jpg": REAL.tamarindo,
  "/images/cereza.jpg": REAL.cereza,
};

const NAME_RULES: Array<{ pattern: RegExp; image: string }> = [
  { pattern: /tamarindo/i, image: REAL.tamarindo },
  { pattern: /fresa/i, image: REAL.fresa },
  { pattern: /cereza/i, image: REAL.cereza },
  { pattern: /chinola/i, image: REAL.chinola },
  { pattern: /guan[áa]bana/i, image: REAL.guanabana },
  { pattern: /mango/i, image: REAL.mango },
  { pattern: /naranja\s*agria/i, image: REAL.naranjaAgria },
  { pattern: /naranja/i, image: REAL.naranjaJugo },
  { pattern: /mandarina/i, image: REAL.mandarina },
  { pattern: /lim[óo]n/i, image: REAL.limon },
];

export function resolveProductImage(product: Pick<Product, "name" | "image_url">): string {
  const url = product.image_url;
  if (url && PATH_OVERRIDES[url]) return PATH_OVERRIDES[url];
  if (url && (url.startsWith("/images/Pulpa") || url.startsWith("/images/Zumo") || url.startsWith("/images/Fresas"))) return url;

  const match = NAME_RULES.find((r) => r.pattern.test(product.name));
  if (match) return match.image;

  return FALLBACK;
}

export function isVideoSource(src: string | null | undefined): boolean {
  if (!src) return false;
  return /\.(mp4|webm|mov)(\?|$)/i.test(src);
}

export function withResolvedImage<T extends Pick<Product, "name" | "image_url">>(product: T): T {
  return { ...product, image_url: resolveProductImage(product) };
}

export function withResolvedImages<T extends Pick<Product, "name" | "image_url">>(items: T[]): T[] {
  return items.map(withResolvedImage);
}
