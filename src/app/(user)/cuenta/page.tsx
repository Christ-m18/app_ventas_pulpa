import Link from "next/link";
import { LayoutDashboard, Mail, Pencil, ShieldCheck, ShoppingBag, Sparkles } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { LogoutButton } from "@/features/auth/components/LogoutButton";
import { getAal, getCurrentProfile, requireUser } from "@/infrastructure/auth/dal";
import { createSupabaseServerClient } from "@/infrastructure/supabase/server";
import { BRAND } from "@/lib/brand";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Mi cuenta",
  description: `Tu panel personal en ${BRAND.name}.`,
};

const ORDER_STATUS_LABEL: Record<string, string> = {
  pending: "Por procesar",
  processing: "Procesando",
  out_for_delivery: "En camino",
  delivered: "Entregado",
  cancelled: "Cancelado",
};

const FORMATTER = new Intl.DateTimeFormat("es-DO", { dateStyle: "medium" });

export default async function CuentaPage() {
  const user = await requireUser();
  const [profile, aal] = await Promise.all([getCurrentProfile(), getAal()]);

  const displayName = profile?.full_name?.trim() || user.email?.split("@")[0] || "Cliente";
  const mfaActive = aal?.currentLevel === "aal2" || aal?.nextLevel === "aal2";
  const isAdmin = profile?.role === "admin";

  // Quick peek of last 3 orders for the dashboard.
  let recentOrders: Array<{
    id: string;
    total: number;
    status: string;
    created_at: string;
  }> = [];
  let totalOrders = 0;
  try {
    const supabase = await createSupabaseServerClient();
    const { data, count } = await supabase
      .from("orders")
      .select("id, total, status, created_at", { count: "exact" })
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(3);
    recentOrders = data ?? [];
    totalOrders = count ?? 0;
  } catch {
    // Ignore — dashboard still useful without recent orders.
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 md:py-12">
      <header className="mb-8 flex flex-col gap-2 md:mb-12">
        <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.25em] text-brand-orange">
          <Sparkles className="h-3.5 w-3.5" aria-hidden />
          Tu panel
        </p>
        <h1 className="text-3xl font-black tracking-tight md:text-5xl">
          Hola, <span className="text-brand-orange">{displayName}</span>
        </h1>
        <p className="text-sm text-muted-foreground md:text-base">
          Gestiona tu identidad, seguridad y pedidos en un solo lugar.
        </p>
      </header>

      {isAdmin && (
        <Link
          href="/admin"
          className="group mb-4 flex items-center gap-4 rounded-3xl border border-brand-orange/30 bg-brand-orange/5 p-5 shadow-md transition-luxury hover:-translate-y-0.5 hover:border-brand-orange/50 hover:shadow-xl hover:shadow-brand-orange/15"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-orange text-white shadow-lg shadow-brand-orange/30">
            <LayoutDashboard className="h-6 w-6" aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-black tracking-tight md:text-base">
              Panel de Administración
            </p>
            <p className="text-xs text-muted-foreground">
              Gestiona órdenes, pagos, entregas, productos e inventario.
            </p>
          </div>
          <span className="shrink-0 text-sm font-bold text-brand-orange transition-luxury group-hover:translate-x-1">
            Abrir →
          </span>
        </Link>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {/* Identidad */}
        <section className="rounded-3xl border border-border bg-card p-6 shadow-md transition-luxury hover:shadow-lg">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-orange/15 text-brand-orange">
                <Mail className="h-5 w-5" aria-hidden />
              </div>
              <h2 className="text-lg font-bold">Identidad</h2>
            </div>
            <Link
              href="/cuenta/perfil"
              className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-1.5")}
            >
              <Pencil className="h-3.5 w-3.5" aria-hidden />
              Editar
            </Link>
          </div>
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-xs uppercase tracking-wider text-muted-foreground">Correo</dt>
              <dd className="mt-1 font-medium break-all">{user.email}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wider text-muted-foreground">Nombre</dt>
              <dd className="mt-1 font-medium">{displayName}</dd>
            </div>
            {profile?.phone && (
              <div>
                <dt className="text-xs uppercase tracking-wider text-muted-foreground">Teléfono</dt>
                <dd className="mt-1 font-medium">{profile.phone}</dd>
              </div>
            )}
            <div>
              <dt className="text-xs uppercase tracking-wider text-muted-foreground">Rol</dt>
              <dd className="mt-1 font-medium capitalize">{profile?.role ?? "customer"}</dd>
            </div>
          </dl>
        </section>

        {/* Seguridad */}
        <section className="rounded-3xl border border-border bg-card p-6 shadow-md transition-luxury hover:shadow-lg">
          <div className="mb-4 flex items-center gap-3">
            <div
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-2xl",
                mfaActive
                  ? "bg-brand-lime/15 text-brand-lime"
                  : "bg-amber-500/15 text-amber-600",
              )}
            >
              <ShieldCheck className="h-5 w-5" aria-hidden />
            </div>
            <h2 className="text-lg font-bold">Seguridad</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            {mfaActive
              ? "Tu cuenta tiene autenticación en dos pasos activa."
              : "Aún no tienes 2FA activo. Te recomendamos activarla."}
          </p>
          <Link
            href="/cuenta/seguridad"
            className={cn(
              buttonVariants({ variant: mfaActive ? "outline" : "default", size: "default" }),
              "mt-5",
              !mfaActive && "bg-brand-orange text-white hover:bg-brand-orange/90",
            )}
          >
            {mfaActive ? "Gestionar autenticadores" : "Activar 2FA"}
          </Link>
        </section>

        {/* Pedidos */}
        <section className="rounded-3xl border border-border bg-card p-6 shadow-md transition-luxury hover:shadow-lg md:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-orange/15 text-brand-orange">
                <ShoppingBag className="h-5 w-5" aria-hidden />
              </div>
              <h2 className="text-lg font-bold">Tus pedidos</h2>
            </div>
            {totalOrders > 0 && (
              <Link
                href="/cuenta/pedidos"
                className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
              >
                Ver todos ({totalOrders})
              </Link>
            )}
          </div>

          {recentOrders.length === 0 ? (
            <>
              <p className="text-sm text-muted-foreground">
                Aún no tienes pedidos. Cuando hagas tu primera compra aparecerá aquí.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <Link
                  href="/catalogo"
                  className={cn(
                    buttonVariants({ variant: "default" }),
                    "bg-brand-orange text-white hover:bg-brand-orange/90",
                  )}
                >
                  Ver catálogo
                </Link>
                <Link href="/carrito" className={cn(buttonVariants({ variant: "outline" }))}>
                  Mi carrito
                </Link>
              </div>
            </>
          ) : (
            <ul className="divide-y divide-border">
              {recentOrders.map((order) => (
                <li key={order.id}>
                  <Link
                    href={`/order-confirmation/${order.id}`}
                    className="flex items-center justify-between py-3 transition-luxury hover:text-brand-orange"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-mono text-sm font-bold">#{order.id.slice(0, 8)}</p>
                      <p className="text-xs text-muted-foreground">
                        {FORMATTER.format(new Date(order.created_at))} ·{" "}
                        {ORDER_STATUS_LABEL[order.status] ?? order.status}
                      </p>
                    </div>
                    <span className="font-mono text-base font-black text-brand-orange">
                      RD${Number(order.total).toFixed(2)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <div className="mt-10 flex justify-center">
        <LogoutButton variant="ghost" />
      </div>
    </div>
  );
}
