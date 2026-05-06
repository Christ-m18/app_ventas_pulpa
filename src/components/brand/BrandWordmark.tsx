import { cn } from "@/lib/utils";

type Size = "sm" | "md" | "lg" | "xl";

const sizeMap: Record<Size, { row: string; al: string; nat: string }> = {
  sm: { row: "text-base", al: "text-[0.6rem]", nat: "text-xs" },
  md: { row: "text-xl", al: "text-[0.7rem]", nat: "text-sm" },
  lg: { row: "text-3xl", al: "text-xs", nat: "text-base" },
  xl: { row: "text-5xl md:text-6xl", al: "text-sm", nat: "text-xl" },
};

type Props = {
  size?: Size;
  className?: string;
  /** Single-line variant collapses both pieces side-by-side. */
  inline?: boolean;
};

export function BrandWordmark({ size = "md", className, inline = false }: Props) {
  const s = sizeMap[size];

  if (inline) {
    return (
      <span className={cn("brand-wordmark inline-flex items-baseline gap-2", className)}>
        <span className={cn("font-black tracking-tight", s.row)}>D&apos;RICHARD</span>
        <span
          className={cn(
            "font-bold italic text-brand-orange leading-none",
            s.nat,
          )}
          style={{ fontFamily: "var(--font-heading), serif" }}
        >
          Al Natural
        </span>
      </span>
    );
  }

  return (
    <span className={cn("brand-wordmark inline-flex flex-col leading-none", className)}>
      <span className={cn("inline-flex items-baseline gap-2", s.row)}>
        <span className="font-black tracking-tight">D&apos;RICHARD</span>
        <span
          className={cn(
            "font-bold italic text-brand-orange",
            s.al,
          )}
          style={{ fontFamily: "var(--font-heading), serif" }}
        >
          PULPAS Y FRUTAS
        </span>
      </span>
      <span
        className={cn(
          "mt-0.5 italic font-bold text-brand-orange",
          s.nat,
        )}
        style={{ fontFamily: "var(--font-heading), serif" }}
      >
        Al Natural
      </span>
    </span>
  );
}
