import Link from "next/link";
import { ArrowLeft, ArrowRight, Inbox, Package } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { requireUser } from "@/infrastructure/auth/dal";
import { createSupabaseServerClient } from "@/infrastructure/supabase/server";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Mis pedidos",
  description: "Historial completo de tus pedidos.",
};

type OrderRow = {
  id: string;
  total: number;
  status: string;
  payment_method: "cash_on_delivery" | "bank_transfer";
  payment_status:
    | "awaiting_voucher"
    | "pending_review"
    | "verified"
    | "pending_cash"
    | "paid"
    | "failed";
  zone: string;
  created_at: string;
  order_items: Array<{ quantity: number }>;
};

const PAYMENT_BADGE: Record<OrderRow["payment_status"], string> = {
  awaiting_voucher: "bg-amber-500/15 text-amber-600 border-amber-500/30",
  pending_review:   "bg-amber-500/15 text-amber-600 border-amber-500/30",
  verified:         "bg-brand-lime/15 text-brand-lime border-brand-lime/30",
  pending_cash:     "bg-brand-orange/15 text-brand-orange border-brand-orange/30",
  paid:             "bg-brand-lime/15 text-brand-lime border-brand-lime/30",
  failed:           "bg-destructive/15 text-destructive border-destructive/30",
};

const PAYMENT_LABEL: Record<OrderRow["payment_status"], string> = {
  awaiting_voucher: "Esperando comprobante",
  pending_review:   "En revisión",
  verified:         "Verificado",
  pending_cash:     "Contra entrega",
  paid:             "Pagado",
  failed:           "Rechazado",
};

const ORDER_STATUS_LABEL: Record<string, string> = {
  pending: "Por procesar",
  processing: "Procesando",
  out_for_delivery: "En camino",
  delivered: "Entregado",
  cancelled: "Cancelado",
};

const FORMATTER = new Intl.DateTimeFormat("es-DO", {
  dateStyle: "medium",
  timeStyle: "short",
});

export default async function PedidosPage() {
  const user = await requireUser();
  const supabase = await createSupabaseServerClient();

  let orders: OrderRow[] = [];
  try {
    const { data } = await supabase
      .from("orders")
      .select(
        "id, total, status, payment_method, payment_status, zone, created_at, order_items(quantity)",
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .returns<OrderRow[]>();
    orders = data ?? [];
  } catch {
    orders = [];
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 md:py-12">
      <Link
        href="/cuenta"
        className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "mb-6 -ml-3 gap-2")}
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Volver al panel
      </Link>

      <header className="mb-8 space-y-2">
        <h1 className="text-3xl font-black tracking-tight md:text-4xl">Mis pedidos</h1>
        <p className="text-sm text-muted-foreground md:text-base">
          Aquí ves todos los pedidos que has hecho, en orden cronológico.
        </p>
      </header>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-3xl border border-dashed border-border bg-card px-6 py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-orange/15 text-brand-orange">
            <Inbox className="h-7 w-7" aria-hidden />
          </div>
          <div>
            <p className="text-base font-bold">Aún no tienes pedidos</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Cuando realices tu primera compra, aparecerá aquí.
            </p>
          </div>
          <Link href="/catalogo">
            <Button className="bg-brand-orange text-white hover:bg-brand-orange/90">
              Explorar el catálogo
            </Button>
          </Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {orders.map((order) => {
            const itemCount = order.order_items.reduce((acc, it) => acc + it.quantity, 0);
            return (
              <li key={order.id}>
                <Link
                  href={`/order-confirmation/${order.id}`}
                  className="group flex flex-col gap-3 rounded-3xl border border-border bg-card p-5 shadow-sm transition-luxury hover:-translate-y-0.5 hover:border-brand-orange/40 hover:shadow-lg hover:shadow-brand-orange/10 sm:flex-row sm:items-center"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-orange/15 text-brand-orange">
                    <Package className="h-6 w-6" aria-hidden />
                  </div>

                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-sm font-bold">
                        #{order.id.slice(0, 8)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {FORMATTER.format(new Date(order.created_at))}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {itemCount} producto{itemCount === 1 ? "" : "s"} ·{" "}
                      <span className="capitalize">{order.zone.replace(/-/g, " ")}</span> ·{" "}
                      {ORDER_STATUS_LABEL[order.status] ?? order.status}
                    </p>
                  </div>

                  <div className="flex flex-row items-center justify-between gap-3 sm:flex-col sm:items-end sm:justify-center">
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider",
                        PAYMENT_BADGE[order.payment_status],
                      )}
                    >
                      {PAYMENT_LABEL[order.payment_status]}
                    </span>
                    <span className="font-mono text-base font-black text-brand-orange">
                      RD${Number(order.total).toFixed(2)}
                    </span>
                  </div>

                  <ArrowRight
                    className="hidden h-5 w-5 text-muted-foreground transition-luxury group-hover:translate-x-1 group-hover:text-brand-orange sm:block"
                    aria-hidden
                  />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
