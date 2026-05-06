import { Leaf, ShieldCheck, Truck, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const ITEMS = [
  {
    icon: Leaf,
    title: "100% natural",
    desc: "Sin conservantes ni azúcar añadida",
    accent: "text-brand-lime bg-brand-lime/15",
  },
  {
    icon: Truck,
    title: "Entrega coordinada",
    desc: "Por WhatsApp e Instagram",
    accent: "text-brand-orange bg-brand-orange/15",
  },
  {
    icon: ShieldCheck,
    title: "Pago seguro",
    desc: "Efectivo o transferencia con IA",
    accent: "text-brand-grapefruit bg-brand-grapefruit/15",
  },
  {
    icon: Sparkles,
    title: "Fruta seleccionada",
    desc: "Cosecha local dominicana",
    accent: "text-amber-700 dark:text-brand-lemon bg-brand-lemon/25",
  },
];

export function TrustBanner() {
  return (
    <section className="rounded-3xl border border-border bg-card px-4 py-5 shadow-sm md:py-6">
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {ITEMS.map(({ icon: Icon, title, desc, accent }) => (
          <li key={title} className="flex items-start gap-3">
            <div
              className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl",
                accent,
              )}
            >
              <Icon className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold tracking-tight">{title}</p>
              <p className="text-xs text-muted-foreground line-clamp-2">{desc}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
