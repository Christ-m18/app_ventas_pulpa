import Link from "next/link";
import { Apple, Cherry, Citrus, Package, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type Tile = {
  slug: string;
  label: string;
  desc: string;
  icon: LucideIcon;
  bg: string;
  ring: string;
  text: string;
};

const TILES: Tile[] = [
  {
    slug: "frutas-tropicales",
    label: "Tropicales",
    desc: "Mango, chinola, guanábana",
    icon: Apple,
    bg: "bg-brand-orange/15",
    ring: "ring-brand-orange/30",
    text: "text-brand-orange",
  },
  {
    slug: "frutas-del-bosque",
    label: "Del bosque",
    desc: "Fresa, cereza",
    icon: Cherry,
    bg: "bg-brand-grapefruit/15",
    ring: "ring-brand-grapefruit/30",
    text: "text-brand-grapefruit",
  },
  {
    slug: "citricos",
    label: "Cítricos y zumos",
    desc: "Naranja, mandarina, limón",
    icon: Citrus,
    bg: "bg-brand-lemon/25",
    ring: "ring-brand-lemon/40",
    text: "text-amber-700 dark:text-brand-lemon",
  },
  {
    slug: "combos",
    label: "Combos",
    desc: "Packs y promos",
    icon: Package,
    bg: "bg-brand-lime/15",
    ring: "ring-brand-lime/30",
    text: "text-brand-lime",
  },
];

type Props = {
  /** Map of slug → category UUID from DB. Fallback to slug-based query if missing. */
  categoryIdBySlug?: Record<string, string>;
};

export function CategoryTiles({ categoryIdBySlug = {} }: Props) {
  return (
    <section className="space-y-4">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-brand-orange">
            Compra por categoría
          </p>
          <h2 className="text-2xl font-black tracking-tight md:text-3xl">¿Qué se te antoja?</h2>
        </div>
        <Link href="/catalogo" className="hidden text-sm font-bold text-brand-orange hover:underline sm:inline">
          Ver todo
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {TILES.map((t) => {
          const id = categoryIdBySlug[t.slug];
          const href = id ? `/catalogo?categoria=${id}` : `/catalogo?q=${encodeURIComponent(t.label)}`;
          const Icon = t.icon;
          return (
            <Link
              key={t.slug}
              href={href}
              className={cn(
                "group flex flex-col items-start gap-2 rounded-3xl border border-border bg-card p-4 ring-1 transition-luxury hover:-translate-y-0.5 hover:shadow-lg sm:p-5",
                t.ring,
              )}
            >
              <div
                className={cn(
                  "flex h-12 w-12 items-center justify-center rounded-2xl transition-luxury group-hover:scale-110",
                  t.bg,
                  t.text,
                )}
              >
                <Icon className="h-6 w-6" />
              </div>
              <div className="space-y-0.5">
                <p className="text-sm font-bold tracking-tight md:text-base">{t.label}</p>
                <p className="text-xs text-muted-foreground line-clamp-2">{t.desc}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
