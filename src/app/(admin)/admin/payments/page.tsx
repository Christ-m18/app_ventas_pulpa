import Link from "next/link";
import { Eye, ShieldCheck, XCircle } from "lucide-react";
import { listPendingVouchers } from "@/features/admin/services/adminPaymentService";
import {
  formatDateTime,
  formatRD,
  PAYMENT_STATUS_LABEL,
  paymentStatusToneClasses,
  zoneLabel,
} from "@/features/admin/lib/format";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "Pagos" };

export default async function PaymentsPage() {
  const vouchers = await listPendingVouchers();

  const pending = vouchers.filter(
    (v) => !v.is_verified && v.payment_status === "pending_review",
  );
  const verified = vouchers.filter((v) => v.is_verified || v.payment_status === "verified");
  const rejected = vouchers.filter((v) => v.payment_status === "failed");

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-brand-orange">
          Operación
        </p>
        <h1 className="text-3xl font-black tracking-tight">Pagos y comprobantes</h1>
        <p className="text-sm text-muted-foreground">
          Revisa, aprueba o rechaza comprobantes de transferencia.
        </p>
      </header>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="flex items-center gap-3 rounded-2xl bg-amber-500/10 p-4">
          <Eye className="h-5 w-5 text-amber-600" aria-hidden />
          <div>
            <p className="text-2xl font-black">{pending.length}</p>
            <p className="text-xs font-semibold text-amber-700">Por revisar</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-2xl bg-brand-lime/15 p-4">
          <ShieldCheck className="h-5 w-5 text-emerald-600" aria-hidden />
          <div>
            <p className="text-2xl font-black">{verified.length}</p>
            <p className="text-xs font-semibold text-emerald-700">Verificados</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-2xl bg-destructive/10 p-4">
          <XCircle className="h-5 w-5 text-destructive" aria-hidden />
          <div>
            <p className="text-2xl font-black">{rejected.length}</p>
            <p className="text-xs font-semibold text-destructive">Rechazados</p>
          </div>
        </div>
      </div>

      <VoucherTable title="Pendientes de revisión" vouchers={pending} />
      <VoucherTable title="Verificados" vouchers={verified} />
      {rejected.length > 0 && <VoucherTable title="Rechazados" vouchers={rejected} />}
    </div>
  );
}

function VoucherTable({
  title,
  vouchers,
}: {
  title: string;
  vouchers: Awaited<ReturnType<typeof listPendingVouchers>>;
}) {
  if (vouchers.length === 0) return null;
  return (
    <section className="rounded-2xl bg-card ring-1 ring-foreground/5 shadow-md">
      <h2 className="border-b border-border/40 px-5 py-3 text-sm font-bold">{title}</h2>

      {/* Mobile card layout */}
      <ul className="divide-y divide-border/30 md:hidden">
        {vouchers.map((v) => (
          <li key={v.id} className="p-4">
            <Link
              href={`/admin/orders/${v.order_id}`}
              className="block transition-luxury active:scale-[0.98]"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-mono text-sm font-bold text-brand-orange">#{v.order_id.slice(0, 8)}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{zoneLabel(v.zone)}</p>
                </div>
                <span className="font-mono text-base font-black">{formatRD(v.order_total)}</span>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                    paymentStatusToneClasses(v.payment_status),
                  )}
                >
                  {PAYMENT_STATUS_LABEL[v.payment_status] ?? v.payment_status}
                </span>
                <span
                  className={cn(
                    "text-xs font-bold",
                    (v.confidence ?? 0) >= 0.85
                      ? "text-emerald-600"
                      : (v.confidence ?? 0) >= 0.5
                        ? "text-amber-600"
                        : "text-destructive",
                  )}
                >
                  IA: {((v.confidence ?? 0) * 100).toFixed(0)}%
                </span>
                <span className="text-[10px] text-muted-foreground">{formatDateTime(v.created_at)}</span>
              </div>
            </Link>
          </li>
        ))}
      </ul>

      {/* Desktop table layout */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/40 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              <th className="px-4 py-2.5">Orden</th>
              <th className="px-4 py-2.5">Monto</th>
              <th className="px-4 py-2.5">Confianza IA</th>
              <th className="px-4 py-2.5">Zona</th>
              <th className="px-4 py-2.5">Estado</th>
              <th className="px-4 py-2.5">Fecha</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/30">
            {vouchers.map((v) => (
              <tr key={v.id} className="transition-luxury hover:bg-muted/40">
                <td className="px-4 py-2.5">
                  <Link
                    href={`/admin/orders/${v.order_id}`}
                    className="font-mono font-bold text-brand-orange hover:underline"
                  >
                    #{v.order_id.slice(0, 8)}
                  </Link>
                </td>
                <td className="px-4 py-2.5 font-mono font-bold">
                  {formatRD(v.order_total)}
                </td>
                <td className="px-4 py-2.5">
                  <span
                    className={cn(
                      "font-mono font-bold",
                      (v.confidence ?? 0) >= 0.85
                        ? "text-emerald-600"
                        : (v.confidence ?? 0) >= 0.5
                          ? "text-amber-600"
                          : "text-destructive",
                    )}
                  >
                    {((v.confidence ?? 0) * 100).toFixed(0)}%
                  </span>
                </td>
                <td className="px-4 py-2.5 text-xs">{zoneLabel(v.zone)}</td>
                <td className="px-4 py-2.5">
                  <span
                    className={cn(
                      "inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                      paymentStatusToneClasses(v.payment_status),
                    )}
                  >
                    {PAYMENT_STATUS_LABEL[v.payment_status] ?? v.payment_status}
                  </span>
                </td>
                <td className="px-4 py-2.5 text-xs text-muted-foreground">
                  {formatDateTime(v.created_at)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
