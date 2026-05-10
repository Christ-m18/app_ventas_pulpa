import type { Product } from "../../../../packages/core/domain/entities/product";

const FALLBACK = "/images/Pulpa de tamarindo.mp4";

/**
 * Returns the image/video URL for a product.
 * Now that images are stored in Supabase Storage with full URLs in the DB,
 * this simply returns the DB value or a fallback.
 */
export function resolveProductImage(product: Pick<Product, "name" | "image_url">): string {
  if (product.image_url && product.image_url.length > 0) return product.image_url;
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
