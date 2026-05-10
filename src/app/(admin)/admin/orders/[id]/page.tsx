import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MapPin, Phone, User } from "lucide-react";
import { formatPhone } from "@/lib/format-phone";
import { getOrderDetail } from "@/features/admin/services/adminOrderService";
import { OrderStatusSelect } from "@/features/admin/components/OrderStatusSelect";
import { PaymentActions } from "@/features/admin/components/PaymentActions";
import {
  formatDateTime,
  formatRD,
  PAYMENT_METHOD_LABEL,
  PAYMENT_STATUS_LABEL,
  paymentStatusToneClasses,
  zoneLabel,
} from "@/features/admin/lib/format";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "Detalle de orden" };

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getOrderDetail(id);
  if (!order) notFound();

  const subtotal = order.total - order.shipping_cost;

  return (
    <div className="space-y-6">
      <Link
        href="/admin/orders"
        className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground transition-luxury hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Volver a órdenes
      </Link>

      <header className="flex flex-wrap items-baseline gap-4">
        <h1 className="text-2xl font-black tracking-tight md:text-3xl">
          Orden <span className="font-mono text-brand-orange">#{id.slice(0, 8)}</span>
        </h1>
        <p className="text-xs text-muted-foreground">{formatDateTime(order.created_at)}</p>
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="rounded-2xl bg-card p-5 ring-1 ring-foreground/5 shadow-md">
            <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-muted-foreground">
              Estado de la orden
            </h2>
            <OrderStatusSelect orderId={order.id} current={order.status} />
          </section>

          <section className="rounded-2xl bg-card p-5 ring-1 ring-foreground/5 shadow-md">
            <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-muted-foreground">
              Items ({order.items.length})
            </h2>
            <ul className="divide-y divide-border/40">
              {order.items.map((it) => (
                <li key={it.id} className="flex items-center justify-between gap-4 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{it.product?.name ?? it.product_id}</p>
                    <p className="text-xs text-muted-foreground">
                      {it.quantity} x {formatRD(it.price)} / {it.product?.unit ?? "ud"}
                    </p>
                  </div>
                  <span className="font-mono font-bold">
                    {formatRD(it.price * it.quantity)}
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-4 space-y-1 border-t border-border/40 pt-4 text-sm">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatRD(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Envío ({zoneLabel(order.zone)})</span>
                <span>{formatRD(order.shipping_cost)}</span>
              </div>
              <div className="flex justify-between pt-2 text-lg font-black">
                <span>Total</span>
                <span className="text-brand-orange">{formatRD(order.total)}</span>
              </div>
            </div>
          </section>

          <section className="rounded-2xl bg-card p-5 ring-1 ring-foreground/5 shadow-md">
            <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-muted-foreground">
              Pago
            </h2>
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-sm font-semibold">
                {PAYMENT_METHOD_LABEL[order.payment_method] ?? order.payment_method}
              </span>
              <span
                className={cn(
                  "rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider",
                  paymentStatusToneClasses(order.payment_status),
                )}
              >
                {PAYMENT_STATUS_LABEL[order.payment_status] ?? order.payment_status}
              </span>
            </div>
            <PaymentActions
              orderId={order.id}
              paymentMethod={order.payment_method}
              paymentStatus={order.payment_status}
              voucher={order.voucher}
            />
          </section>
        </div>

        <aside className="space-y-6">
          <section className="rounded-2xl bg-card p-5 ring-1 ring-foreground/5 shadow-md">
            <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-muted-foreground">
              Cliente
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
                <span className="font-medium">{order.customer.full_name ?? "Invitado"}</span>
              </div>
              {order.customer.email && (
                <p className="text-xs text-muted-foreground break-all">
                  {order.customer.email}
                </p>
              )}
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
                <span>{formatPhone(order.customer.phone ?? order.phone)}</span>
              </div>
            </div>
          </section>

          <section className="rounded-2xl bg-card p-5 ring-1 ring-foreground/5 shadow-md">
            <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-muted-foreground">
              Entrega
            </h2>
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-orange" aria-hidden />
                <div>
                  <p className="font-semibold">{zoneLabel(order.zone)}</p>
                  <p className="text-xs text-muted-foreground">{order.delivery_address}</p>
                </div>
              </div>
              {order.notes && (
                <div className="rounded-xl bg-muted/60 p-3 text-xs text-muted-foreground">
                  <p className="mb-1 font-bold uppercase tracking-wider">Notas</p>
                  {order.notes}
                </div>
              )}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
