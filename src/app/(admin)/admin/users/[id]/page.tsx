import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  LogIn,
  Mail,
  Phone,
  ShoppingBag,
  User,
} from "lucide-react";
import { getUserDetail } from "@/features/admin/services/adminUserService";
import { RoleSelect } from "@/features/admin/components/RoleSelect";
import {
  formatDateTime,
  formatRD,
  ORDER_STATUS_LABEL,
  PAYMENT_STATUS_LABEL,
  statusToneClasses,
  paymentStatusToneClasses,
} from "@/features/admin/lib/format";
import { cn } from "@/lib/utils";
import { formatPhone } from "@/lib/format-phone";

export const dynamic = "force-dynamic";
export const metadata = { title: "Detalle de usuario" };

export default async function UserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getUserDetail(id);
  if (!user) notFound();

  return (
    <div className="space-y-6">
      <Link
        href="/admin/users"
        className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground transition-luxury hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Volver a usuarios
      </Link>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile card */}
        <aside className="space-y-6">
          <section className="rounded-2xl bg-card p-6 ring-1 ring-foreground/5 shadow-md">
            <div className="mb-5 flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-orange/15 text-brand-orange">
                <User className="h-7 w-7" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="truncate text-xl font-black tracking-tight">
                  {user.full_name || "Sin nombre"}
                </h1>
                <p className="text-xs text-muted-foreground">ID: {user.id.slice(0, 12)}…</p>
              </div>
            </div>

            <div className="space-y-3 text-sm">
              {user.email && (
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="break-all">{user.email}</span>
                </div>
              )}
              {user.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span>{formatPhone(user.phone)}</span>
                </div>
              )}
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  Registrado: {formatDateTime(user.created_at)}
                </span>
              </div>
              {user.last_sign_in_at && (
                <div className="flex items-center gap-3">
                  <LogIn className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    Último acceso: {formatDateTime(user.last_sign_in_at)}
                  </span>
                </div>
              )}
            </div>
          </section>

          <section className="rounded-2xl bg-card p-6 ring-1 ring-foreground/5 shadow-md">
            <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-muted-foreground">
              Rol del usuario
            </h2>
            <RoleSelect userId={user.id} current={user.role} />
          </section>

          <section className="rounded-2xl bg-card p-6 ring-1 ring-foreground/5 shadow-md">
            <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-muted-foreground">
              Resumen
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl bg-brand-orange/10 p-3 text-center">
                <ShoppingBag className="mx-auto mb-1 h-5 w-5 text-brand-orange" />
                <p className="text-2xl font-black">{user.order_count}</p>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Órdenes
                </p>
              </div>
              <div className="rounded-xl bg-brand-lime/10 p-3 text-center">
                <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Total gastado
                </p>
                <p className="text-xl font-black text-brand-orange">
                  {formatRD(user.total_spent)}
                </p>
              </div>
            </div>
          </section>
        </aside>

        {/* Orders */}
        <div className="lg:col-span-2">
          <section className="rounded-2xl bg-card ring-1 ring-foreground/5 shadow-md">
            <div className="border-b border-border/40 px-5 py-4">
              <h2 className="text-sm font-bold">
                Historial de órdenes ({user.orders.length})
              </h2>
            </div>

            {user.orders.length === 0 ? (
              <p className="p-8 text-center text-sm text-muted-foreground">
                Este usuario no tiene órdenes.
              </p>
            ) : (
              <>
                {/* Mobile */}
                <ul className="divide-y divide-border/30 md:hidden">
                  {user.orders.map((o) => (
                    <li key={o.id} className="p-4">
                      <Link
                        href={`/admin/orders/${o.id}`}
                        className="block transition-luxury active:scale-[0.98]"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-mono text-sm font-bold text-brand-orange">
                            #{o.id.slice(0, 8)}
                          </p>
                          <span className="font-mono text-base font-black">
                            {formatRD(o.total)}
                          </span>
                        </div>
                        <div className="mt-2 flex flex-wrap items-center gap-1.5">
                          <span
                            className={cn(
                              "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                              statusToneClasses(o.status)
                            )}
                          >
                            {ORDER_STATUS_LABEL[o.status] ?? o.status}
                          </span>
                          <span
                            className={cn(
                              "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                              paymentStatusToneClasses(o.payment_status)
                            )}
                          >
                            {PAYMENT_STATUS_LABEL[o.payment_status] ?? o.payment_status}
                          </span>
                        </div>
                        <p className="mt-1.5 text-[10px] text-muted-foreground">
                          {formatDateTime(o.created_at)}
                        </p>
                      </Link>
                    </li>
                  ))}
                </ul>

                {/* Desktop */}
                <div className="hidden overflow-x-auto md:block">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border/40 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        <th className="px-4 py-2.5">Orden</th>
                        <th className="px-4 py-2.5">Estado</th>
                        <th className="px-4 py-2.5">Pago</th>
                        <th className="px-4 py-2.5 text-right">Total</th>
                        <th className="px-4 py-2.5">Fecha</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/30">
                      {user.orders.map((o) => (
                        <tr key={o.id} className="transition-luxury hover:bg-muted/40">
                          <td className="px-4 py-2.5">
                            <Link
                              href={`/admin/orders/${o.id}`}
                              className="font-mono font-bold text-brand-orange hover:underline"
                            >
                              #{o.id.slice(0, 8)}
                            </Link>
                          </td>
                          <td className="px-4 py-2.5">
                            <span
                              className={cn(
                                "inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                                statusToneClasses(o.status)
                              )}
                            >
                              {ORDER_STATUS_LABEL[o.status] ?? o.status}
                            </span>
                          </td>
                          <td className="px-4 py-2.5">
                            <span
                              className={cn(
                                "inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                                paymentStatusToneClasses(o.payment_status)
                              )}
                            >
                              {PAYMENT_STATUS_LABEL[o.payment_status] ?? o.payment_status}
                            </span>
                          </td>
                          <td className="px-4 py-2.5 text-right font-mono font-bold">
                            {formatRD(o.total)}
                          </td>
                          <td className="px-4 py-2.5 text-xs text-muted-foreground">
                            {formatDateTime(o.created_at)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
