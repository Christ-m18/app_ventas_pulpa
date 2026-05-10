import Link from "next/link";
import { MapPin, Phone, Truck } from "lucide-react";
import { formatPhone } from "@/lib/format-phone";
import { getDeliveriesBoard } from "@/features/admin/services/adminReportingService";
import {
  formatDateTime,
  formatRD,
  PAYMENT_METHOD_LABEL,
  paymentStatusToneClasses,
  PAYMENT_STATUS_LABEL,
  zoneLabel,
} from "@/features/admin/lib/format";
import { cn } from "@/lib/utils";
import type { DeliveryItem } from "@/features/admin/services/adminReportingService";

export const dynamic = "force-dynamic";
export const metadata = { title: "Entregas" };

export default async function DeliveriesPage() {
  const board = await getDeliveriesBoard();

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-brand-orange">
          Logística
        </p>
        <h1 className="text-3xl font-black tracking-tight">Entregas</h1>
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        <Column
          title="Pendientes por entregar"
          items={board.pending}
          tone="bg-amber-500/10"
          emptyLabel="Sin entregas pendientes"
        />
        <Column
          title="En camino"
          items={board.inDelivery}
          tone="bg-brand-mandarin/10"
          emptyLabel="Nada en camino"
        />
        <Column
          title="Entregados"
          items={board.delivered}
          tone="bg-brand-lime/10"
          emptyLabel="Sin entregas recientes"
        />
      </div>
    </div>
  );
}

function Column({
  title,
  items,
  tone,
  emptyLabel,
}: {
  title: string;
  items: DeliveryItem[];
  tone: string;
  emptyLabel: string;
}) {
  const byZone = new Map<string, DeliveryItem[]>();
  for (const it of items) {
    const list = byZone.get(it.zone) ?? [];
    list.push(it);
    byZone.set(it.zone, list);
  }

  return (
    <section className={cn("rounded-2xl p-4 ring-1 ring-foreground/5 shadow-md", tone)}>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-bold">{title}</h2>
        <span className="rounded-full bg-foreground/10 px-2.5 py-0.5 text-[10px] font-bold">
          {items.length}
        </span>
      </div>

      {items.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">{emptyLabel}</p>
      ) : (
        <div className="space-y-5">
          {Array.from(byZone.entries())
            .sort(([, a], [, b]) => b.length - a.length)
            .map(([zone, zoneItems]) => (
              <div key={zone}>
                <p className="mb-1.5 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-brand-orange">
                  <MapPin className="h-3 w-3" aria-hidden />
                  {zoneLabel(zone)} ({zoneItems.length})
                </p>
                <ul className="space-y-2">
                  {zoneItems.map((it) => (
                    <li
                      key={it.id}
                      className="rounded-xl bg-card p-3 ring-1 ring-foreground/5"
                    >
                      <Link
                        href={`/admin/orders/${it.id}`}
                        className="font-mono text-xs font-bold text-brand-orange hover:underline"
                      >
                        #{it.id.slice(0, 8)}
                      </Link>
                      <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                        {it.delivery_address}
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-[10px]">
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <Phone className="h-3 w-3" aria-hidden />
                          {formatPhone(it.phone)}
                        </span>
                        <span className="font-mono font-bold">{formatRD(it.total)}</span>
                        <span className="text-muted-foreground">
                          {PAYMENT_METHOD_LABEL[it.payment_method]}
                        </span>
                        <span
                          className={cn(
                            "rounded-full px-1.5 py-0.5 font-bold uppercase",
                            paymentStatusToneClasses(it.payment_status),
                          )}
                        >
                          {PAYMENT_STATUS_LABEL[it.payment_status] ?? it.payment_status}
                        </span>
                      </div>
                      <p className="mt-1 text-[10px] text-muted-foreground/70">
                        {formatDateTime(it.created_at)}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
        </div>
      )}
    </section>
  );
}
