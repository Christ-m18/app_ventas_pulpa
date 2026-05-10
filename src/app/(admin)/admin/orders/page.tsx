import Link from "next/link";
import { listOrders } from "@/features/admin/services/adminOrderService";
import {
  formatDateTime,
  formatRD,
  ORDER_STATUS_LABEL,
  PAYMENT_STATUS_LABEL,
  PAYMENT_METHOD_LABEL,
  statusToneClasses,
  paymentStatusToneClasses,
  zoneLabel,
} from "@/features/admin/lib/format";
import { cn } from "@/lib/utils";
import { formatPhone } from "@/lib/format-phone";
import type { OrderStatus } from "../../../../../packages/core/domain/entities/order";

export const dynamic = "force-dynamic";
export const metadata = { title: "Órdenes" };

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const statusFilter = (typeof sp.status === "string" ? sp.status : "all") as
    | OrderStatus
    | "all";
  const paymentStatus = typeof sp.paymentStatus === "string" ? sp.paymentStatus : "all";
  const paymentMethod = typeof sp.paymentMethod === "string" ? sp.paymentMethod : "all";

  const orders = await listOrders({
    status: statusFilter,
    paymentStatus,
    paymentMethod: paymentMethod as "all" | "cash_on_delivery" | "bank_transfer",
  });

  const tabs: Array<{ label: string; value: string }> = [
    { label: "Todas", value: "all" },
    { label: "Por procesar", value: "pending" },
    { label: "Procesando", value: "processing" },
    { label: "En camino", value: "out_for_delivery" },
    { label: "Entregadas", value: "delivered" },
    { label: "Canceladas", value: "cancelled" },
  ];

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-brand-orange">
          Operación
        </p>
        <h1 className="text-3xl font-black tracking-tight">Órdenes</h1>
      </header>

      <nav className="flex flex-wrap gap-1.5">
        {tabs.map((t) => (
          <Link
            key={t.value}
            href={
              t.value === "all"
                ? "/admin/orders"
                : `/admin/orders?status=${t.value}`
            }
            className={cn(
              "rounded-full px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider transition-luxury",
              statusFilter === t.value
                ? "bg-brand-orange text-white shadow-md shadow-brand-orange/30"
                : "bg-muted text-muted-foreground hover:bg-muted/80",
            )}
          >
            {t.label}
          </Link>
        ))}
      </nav>

      {orders.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted-foreground">
          No hay órdenes con estos filtros.
        </p>
      ) : (
        <>
        {/* Mobile card layout */}
        <ul className="space-y-3 md:hidden">
          {orders.map((o) => (
            <li key={o.id}>
              <Link
                href={`/admin/orders/${o.id}`}
                className="block rounded-2xl bg-card p-4 ring-1 ring-foreground/5 shadow-md transition-luxury active:scale-[0.98]"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-mono text-sm font-bold text-brand-orange">#{o.id.slice(0, 8)}</p>
                    <p className="mt-0.5 text-sm font-medium">{o.customer_name ?? "Invitado"}</p>
                    <p className="text-xs text-muted-foreground">{formatPhone(o.phone)} · {zoneLabel(o.zone)}</p>
                  </div>
                  <span className="font-mono text-base font-black text-brand-orange">
                    {formatRD(o.total)}
                  </span>
                </div>
                <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
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
                  <span className="text-[10px] text-muted-foreground">
                    {PAYMENT_METHOD_LABEL[o.payment_method] ?? o.payment_method}
                  </span>
                </div>
                <p className="mt-1.5 text-[10px] text-muted-foreground">{formatDateTime(o.created_at)}</p>
              </Link>
            </li>
          ))}
        </ul>

        {/* Desktop table layout */}
        <div className="hidden overflow-x-auto rounded-2xl bg-card ring-1 ring-foreground/5 shadow-md md:block">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/60 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                <th className="px-4 py-3">Orden</th>
                <th className="px-4 py-3">Cliente</th>
                <th className="px-4 py-3">Zona</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3">Pago</th>
                <th className="px-4 py-3 text-right">Total</th>
                <th className="px-4 py-3">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {orders.map((o) => (
                <tr
                  key={o.id}
                  className="transition-luxury hover:bg-muted/40"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/orders/${o.id}`}
                      className="font-mono font-bold text-brand-orange hover:underline"
                    >
                      #{o.id.slice(0, 8)}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium">
                      {o.customer_name ?? "Invitado"}
                    </p>
                    <p className="text-xs text-muted-foreground">{formatPhone(o.phone)}</p>
                  </td>
                  <td className="px-4 py-3 text-xs">{zoneLabel(o.zone)}</td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                        statusToneClasses(o.status),
                      )}
                    >
                      {ORDER_STATUS_LABEL[o.status] ?? o.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                        paymentStatusToneClasses(o.payment_status),
                      )}
                    >
                      {PAYMENT_STATUS_LABEL[o.payment_status] ?? o.payment_status}
                    </span>
                    <p className="mt-0.5 text-[10px] text-muted-foreground">
                      {PAYMENT_METHOD_LABEL[o.payment_method] ?? o.payment_method}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-bold">
                    {formatRD(o.total)}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {formatDateTime(o.created_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </>
      )}
    </div>
  );
}
