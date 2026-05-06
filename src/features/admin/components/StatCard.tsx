import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type Tone = "orange" | "lemon" | "lime" | "grapefruit" | "mandarin";

const toneMap: Record<Tone, { bg: string; ring: string; text: string }> = {
  orange: {
    bg: "bg-brand-orange/12",
    ring: "ring-brand-orange/20",
    text: "text-brand-orange",
  },
  lemon: {
    bg: "bg-brand-lemon/25",
    ring: "ring-brand-lemon/30",
    text: "text-amber-800 dark:text-brand-lemon",
  },
  lime: {
    bg: "bg-brand-lime/15",
    ring: "ring-brand-lime/25",
    text: "text-emerald-700 dark:text-brand-lime",
  },
  grapefruit: {
    bg: "bg-brand-grapefruit/12",
    ring: "ring-brand-grapefruit/25",
    text: "text-brand-grapefruit",
  },
  mandarin: {
    bg: "bg-brand-mandarin/15",
    ring: "ring-brand-mandarin/25",
    text: "text-brand-mandarin",
  },
};

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "orange",
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon: LucideIcon;
  tone?: Tone;
}) {
  const t = toneMap[tone];
  return (
    <div
      className={cn(
        "relative flex items-start justify-between gap-4 overflow-hidden rounded-2xl bg-card p-5 ring-1 ring-foreground/5 shadow-md transition-luxury hover:-translate-y-0.5 hover:shadow-lg",
      )}
    >
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
          {label}
        </p>
        <p className="mt-2 text-2xl font-black tracking-tight md:text-3xl">{value}</p>
        {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
      </div>
      <div
        className={cn(
          "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ring-1",
          t.bg,
          t.ring,
          t.text,
        )}
      >
        <Icon className="h-5 w-5" aria-hidden />
      </div>
    </div>
  );
}
