import Link from "next/link";
import {
  AlertTriangle,
  Banknote,
  Building2,
  CalendarDays,
  ClipboardList,
  Truck,
  Wallet,
} from "lucide-react";
import { getDashboardStats } from "@/features/admin/services/adminOrderService";
import { listOrders } from "@/features/admin/services/adminOrderService";
import { StatCard } from "@/features/admin/components/StatCard";
import {
  formatDateTime,
  formatRD,
  ORDER_STATUS_LABEL,
  paymentStatusToneClasses,
  PAYMENT_STATUS_LABEL,
  statusToneClasses,
  zoneLabel,
} from "@/features/admin/lib/format";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "Dashboard" };

export default async function AdminDashboardPage() {
  const [stats, recent] = await Promise.all([getDashboardStats(), listOrders({ limit: 8 })]);

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-2">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-brand-orange">
          Vista general
        </p>
        <h1 className="text-3xl font-black tracking-tight md:text-4xl">
          Hola, panel de control
        </h1>
        <p className="text-sm text-muted-foreground">
          Resumen del día y atajos para resolver pendientes en segundos.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Ventas hoy"
          value={formatRD(stats.todayRevenue)}
          icon={CalendarDays}
          tone="orange"
        />
        <StatCard
          label="Ventas del mes"
          value={formatRD(stats.monthRevenue)}
          hint={`Efectivo ${formatRD(stats.cashRevenue)} · Transf. ${formatRD(stats.transferRevenue)}`}
          icon={Banknote}
          tone="lime"
        />
        <StatCard
          label="Por procesar"
          value={stats.pendingCount}
          hint="Órdenes recién creadas"
          icon={ClipboardList}
          tone="lemon"
        />
        <StatCard
          label="En camino"
          value={stats.outForDeliveryCount}
          hint="Pedidos asignados a entrega"
          icon={Truck}
          tone="mandarin"
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <Link
          href="/admin/payments?status=pending_review"
          className="group flex items-center gap-4 rounded-2xl bg-card p-5 ring-1 ring-foreground/5 shadow-md transition-luxury hover:-translate-y-0.5 hover:shadow-lg"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-grapefruit/15 text-brand-grapefruit ring-1 ring-brand-grapefruit/20">
            <Wallet className="h-5 w-5" aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
              Comprobantes
            </p>
            <p className="text-2xl font-black tracking-tight">{stats.pendingPaymentReview}</p>
            <p className="text-xs text-muted-foreground">por revisar</p>
          </div>
          <span className="text-xs font-semibold text-brand-orange transition-luxury group-hover:translate-x-1">
            Revisar →
          </span>
        </Link>

        <Link
          href="/admin/orders?paymentStatus=pending_cash"
          className="group flex items-center gap-4 rounded-2xl bg-card p-5 ring-1 ring-foreground/5 shadow-md transition-luxury hover:-translate-y-0.5 hover:shadow-lg"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-orange/12 text-brand-orange ring-1 ring-brand-orange/20">
            <Building2 className="h-5 w-5" aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
              Cobros pendientes
            </p>
            <p className="text-2xl font-black tracking-tight">Ver lista</p>
            <p className="text-xs text-muted-foreground">Efectivo a cobrar al entregar</p>
          </div>
          <span className="text-xs font-semibold text-brand-orange transition-luxury group-hover:translate-x-1">
            Abrir →
          </span>
        </Link>

        <div className="rounded-2xl bg-card p-5 ring-1 ring-foreground/5 shadow-md">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-600" aria-hidden />
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
              Stock bajo
            </p>
          </div>
          {stats.lowStock.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">
              Todos los productos tienen stock suficiente.
            </p>
          ) : (
            <ul className="mt-3 space-y-1.5">
              {stats.lowStock.slice(0, 4).map((p) => (
                <li key={p.id} className="flex items-center justify-between text-sm">
                  <Link
                    href={`/admin/products/${p.id}/edit`}
                    className="line-clamp-1 font-medium hover:text-brand-orange"
                  >
                    {p.name}
                  </Link>
                  <span className="font-mono text-xs font-bold text-amber-700">
                    {p.stock} ud.
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section className="rounded-3xl bg-card p-5 ring-1 ring-foreground/5 shadow-md">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-bold">Órdenes recientes</h2>
          <Link
            href="/admin/orders"
            className="text-xs font-semibold text-brand-orange hover:underline"
          >
            Ver todas →
          </Link>
        </div>
        {recent.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aún no hay órdenes.</p>
        ) : (
          <ul className="divide-y divide-border">
            {recent.map((o) => (
              <li key={o.id}>
                <Link
                  href={`/admin/orders/${o.id}`}
                  className="grid grid-cols-1 gap-3 py-3 transition-luxury hover:bg-muted/40 sm:grid-cols-[1fr_auto_auto] sm:items-center sm:gap-6"
                >
                  <div className="min-w-0">
                    <p className="font-mono text-sm font-bold">#{o.id.slice(0, 8)}</p>
                    <p className="line-clamp-1 text-xs text-muted-foreground">
                      {o.customer_name ?? "Invitado"} · {o.phone} · {zoneLabel(o.zone)}
                    </p>
                    <p className="text-[11px] text-muted-foreground/80">
                      {formatDateTime(o.created_at)}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                        statusToneClasses(o.status),
                      )}
                    >
                      {ORDER_STATUS_LABEL[o.status] ?? o.status}
                    </span>
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                        paymentStatusToneClasses(o.payment_status),
                      )}
                    >
                      {PAYMENT_STATUS_LABEL[o.payment_status] ?? o.payment_status}
                    </span>
                  </div>
                  <span className="font-mono text-base font-black text-brand-orange sm:text-right">
                    {formatRD(o.total)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
