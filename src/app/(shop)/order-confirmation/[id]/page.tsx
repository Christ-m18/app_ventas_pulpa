import Link from "next/link";
import { CheckCircle2, Clock, Package, ShieldAlert, Truck, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BankAccountList } from "@/features/checkout/components/BankAccountList";
import { VoucherUploader } from "@/features/checkout/components/VoucherUploader";
import { createSupabaseServerClient } from "@/infrastructure/supabase/server";
import { cn } from "@/lib/utils";
import { formatPhone } from "@/lib/format-phone";

type Order = {
  id: string;
  created_at: string;
  status: string;
  total: number;
  customer_name: string | null;
  customer_email: string | null;
  payment_method: "cash_on_delivery" | "bank_transfer";
  payment_status:
    | "awaiting_voucher"
    | "pending_review"
    | "verified"
    | "pending_cash"
    | "paid"
    | "failed";
  delivery_address: string;
  zone: string;
  shipping_cost: number;
  phone: string;
  order_items: Array<{
    id: string;
    quantity: number;
    price: number;
    products: { name: string } | null;
  }>;
};

const STATUS_LABELS: Record<Order["payment_status"], { label: string; tone: string; icon: typeof CheckCircle2 }> = {
  awaiting_voucher: { label: "Esperando comprobante", tone: "amber", icon: Upload },
  pending_review:   { label: "Comprobante en revisión", tone: "amber", icon: ShieldAlert },
  verified:         { label: "Pago verificado", tone: "lime", icon: CheckCircle2 },
  pending_cash:     { label: "Pago contra entrega", tone: "orange", icon: Clock },
  paid:             { label: "Pagado", tone: "lime", icon: CheckCircle2 },
  failed:           { label: "Pago rechazado", tone: "red", icon: ShieldAlert },
};

import { InvoiceDialog } from "@/features/checkout/components/InvoiceDialog";

export default async function OrderConfirmationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: order } = await supabase
    .from("orders")
    .select(
      `id, created_at, status, total, customer_name, customer_email, payment_method, payment_status, delivery_address, zone, shipping_cost, phone, 
       order_items ( id, quantity, price, products ( name ) )`,
    )
    .eq("id", id)
    .maybeSingle<Order>();

  if (!order) {
    return (
      <div className="space-y-4 px-4 py-20 text-center">
        <h1 className="text-2xl font-bold">Orden no encontrada</h1>
        <Link href="/catalogo">
          <Button>Volver al catálogo</Button>
        </Link>
      </div>
    );
  }

  const statusMeta = STATUS_LABELS[order.payment_status];
  const StatusIcon = statusMeta.icon;
  const needsVoucher = order.payment_status === "awaiting_voucher";

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 pb-12 sm:px-5 md:px-6">
      <header className="space-y-3 text-center">
        <div className="mx-auto inline-flex h-20 w-20 items-center justify-center rounded-full bg-brand-orange/15 text-brand-orange">
          <CheckCircle2 className="h-10 w-10" aria-hidden />
        </div>
        <h1 className="text-3xl font-black tracking-tight md:text-4xl">¡Gracias por tu pedido!</h1>
        <p className="text-sm text-muted-foreground md:text-base">
          Orden{" "}
          <span className="font-mono font-bold text-foreground">#{order.id.slice(0, 8)}</span>{" "}
          recibida.
        </p>

        <div className="flex flex-col items-center gap-3">
          <span
            className={cn(
              "inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider",
              statusMeta.tone === "lime" && "bg-brand-lime/15 text-brand-lime",
              statusMeta.tone === "amber" && "bg-amber-500/15 text-amber-600",
              statusMeta.tone === "orange" && "bg-brand-orange/15 text-brand-orange",
              statusMeta.tone === "red" && "bg-destructive/15 text-destructive",
            )}
          >
            <StatusIcon className="h-3.5 w-3.5" aria-hidden />
            {statusMeta.label}
          </span>
          
          <InvoiceDialog order={order} />
        </div>
      </header>

      <div className="grid gap-3 text-center sm:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-4">
          <Package className="mx-auto mb-2 h-5 w-5 text-brand-orange" aria-hidden />
          <h3 className="text-sm font-semibold capitalize">{order.status}</h3>
          <p className="text-xs text-muted-foreground">Estado</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4">
          <Clock className="mx-auto mb-2 h-5 w-5 text-brand-orange" aria-hidden />
          <h3 className="text-sm font-semibold">24 - 48 h</h3>
          <p className="text-xs text-muted-foreground">Entrega estimada</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4">
          <Truck className="mx-auto mb-2 h-5 w-5 text-brand-orange" aria-hidden />
          <h3 className="text-sm font-semibold capitalize">{order.zone.replace(/-/g, " ")}</h3>
          <p className="text-xs text-muted-foreground">Zona</p>
        </div>
      </div>

      {needsVoucher && (
        <Card className="border-amber-500/40 bg-amber-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-amber-600" aria-hidden />
              Sube tu comprobante de transferencia
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <p className="mb-3 text-sm">
                Transfiere{" "}
                <span className="font-mono font-bold text-brand-orange">
                  RD${Number(order.total).toFixed(2)}
                </span>{" "}
                a una de estas cuentas:
              </p>
              <BankAccountList />
            </div>

            <div className="border-t border-border pt-5">
              <p className="mb-3 text-sm font-semibold">Sube la captura del comprobante</p>
              <p className="mb-4 text-xs text-muted-foreground">
                La IA revisa monto, banco y referencia. Si todo cuadra, tu pago queda verificado al
                instante.
              </p>
              <VoucherUploader orderId={order.id} />
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Detalles del envío</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            <span className="font-medium">Cliente:</span> {order.customer_name || "Cliente General"}
          </p>
          <p>
            <span className="font-medium">Dirección:</span> {order.delivery_address}
          </p>
          <p>
            <span className="font-medium">Teléfono:</span> {formatPhone(order.phone)}
          </p>
          <p>
            <span className="font-medium">Método de pago:</span>{" "}
            {order.payment_method === "cash_on_delivery"
              ? "Efectivo al recibir"
              : "Transferencia bancaria"}
          </p>
          <p>
            <span className="font-medium">Total:</span>{" "}
            <span className="font-mono font-bold">RD${Number(order.total).toFixed(2)}</span>
          </p>
        </CardContent>
      </Card>

      <div className="flex flex-col justify-center gap-3 sm:flex-row">
        <Link href="/catalogo">
          <Button variant="outline" className="w-full sm:w-auto">
            Seguir comprando
          </Button>
        </Link>
        <Link href="/cuenta">
          <Button className="w-full bg-brand-orange text-white hover:bg-brand-orange/90 sm:w-auto">
            Ir a mi cuenta
          </Button>
        </Link>
      </div>
    </div>
  );
}
