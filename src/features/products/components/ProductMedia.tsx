import Image from "next/image";
import { isVideoSource } from "@/features/products/utils/productImage";
import { cn } from "@/lib/utils";

type Props = {
  src: string | null;
  alt: string;
  /** Render as priority above the fold. */
  priority?: boolean;
  className?: string;
  /** Aspect ratio container (default: square) */
  aspect?: "square" | "video" | "portrait";
  /** sizes attribute for next/image when not video */
  sizes?: string;
};

const ASPECT: Record<NonNullable<Props["aspect"]>, string> = {
  square: "aspect-square",
  video: "aspect-video",
  portrait: "aspect-4/5",
};

export function ProductMedia({
  src,
  alt,
  priority,
  className,
  aspect = "square",
  sizes = "(max-width: 768px) 100vw, 50vw",
}: Props) {
  const video = isVideoSource(src);

  return (
    <div
      className={cn(
        "relative overflow-hidden bg-linear-to-br from-accent/40 via-card to-secondary/30",
        ASPECT[aspect],
        className,
      )}
    >
      {src && video ? (
        <video
          src={src}
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : src ? (
        <Image src={src} alt={alt} fill priority={priority} sizes={sizes} className="object-cover" />
      ) : (
        <div className="flex h-full items-center justify-center">
          <span className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
            Sin imagen
          </span>
        </div>
      )}
    </div>
  );
}
