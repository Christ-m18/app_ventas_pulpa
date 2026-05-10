import Link from "next/link";
import { ShieldCheck, User, Mail, Phone } from "lucide-react";
import { listUsers } from "@/features/admin/services/adminUserService";
import { formatRD, formatDateTime } from "@/features/admin/lib/format";
import { formatPhone } from "@/lib/format-phone";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "Usuarios" };

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const search = typeof sp.search === "string" ? sp.search : "";
  const roleFilter = typeof sp.role === "string" ? sp.role : "all";

  const users = await listUsers({ search: search || undefined, role: roleFilter });

  const tabs = [
    { label: "Todos", value: "all" },
    { label: "Clientes", value: "customer" },
    { label: "Admins", value: "admin" },
  ];

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-brand-orange">
          Gestión
        </p>
        <h1 className="text-3xl font-black tracking-tight">Usuarios</h1>
        <p className="text-sm text-muted-foreground">
          {users.length} usuario{users.length !== 1 ? "s" : ""} registrado{users.length !== 1 ? "s" : ""}
        </p>
      </header>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <nav className="flex flex-wrap gap-1.5">
          {tabs.map((t) => (
            <Link
              key={t.value}
              href={
                t.value === "all"
                  ? `/admin/users${search ? `?search=${search}` : ""}`
                  : `/admin/users?role=${t.value}${search ? `&search=${search}` : ""}`
              }
              className={cn(
                "rounded-full px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider transition-luxury",
                roleFilter === t.value
                  ? "bg-brand-orange text-white shadow-md shadow-brand-orange/30"
                  : "bg-muted text-muted-foreground hover:bg-muted/80",
              )}
            >
              {t.label}
            </Link>
          ))}
        </nav>

        <form className="relative">
          <input
            type="search"
            name="search"
            defaultValue={search}
            placeholder="Buscar por nombre, email o teléfono…"
            className="h-10 w-full rounded-xl border border-border bg-background px-4 text-sm placeholder:text-muted-foreground focus:border-brand-orange/50 focus:outline-none focus:ring-2 focus:ring-brand-orange/20 sm:w-72"
          />
          {roleFilter !== "all" && (
            <input type="hidden" name="role" value={roleFilter} />
          )}
        </form>
      </div>

      {users.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted-foreground">
          No se encontraron usuarios.
        </p>
      ) : (
        <>
          {/* Mobile card layout */}
          <ul className="space-y-3 md:hidden">
            {users.map((u) => (
              <li key={u.id}>
                <Link
                  href={`/admin/users/${u.id}`}
                  className="block rounded-2xl bg-card p-4 ring-1 ring-foreground/5 shadow-md transition-luxury active:scale-[0.98]"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-bold">
                          {u.full_name || "Sin nombre"}
                        </p>
                        {u.role === "admin" && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-brand-orange/15 px-2 py-0.5 text-[9px] font-bold uppercase text-brand-orange">
                            <ShieldCheck className="h-2.5 w-2.5" />
                            Admin
                          </span>
                        )}
                      </div>
                      {u.email && (
                        <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                          <Mail className="h-3 w-3 shrink-0" />
                          <span className="truncate">{u.email}</span>
                        </p>
                      )}
                      {u.phone && (
                        <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                          <Phone className="h-3 w-3 shrink-0" />
                          {formatPhone(u.phone)}
                        </p>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs text-muted-foreground">{u.order_count} órd.</p>
                      <p className="font-mono text-sm font-bold text-brand-orange">
                        {formatRD(u.total_spent)}
                      </p>
                    </div>
                  </div>
                  <p className="mt-2 text-[10px] text-muted-foreground">
                    Registrado: {formatDateTime(u.created_at)}
                  </p>
                </Link>
              </li>
            ))}
          </ul>

          {/* Desktop table layout */}
          <div className="hidden overflow-x-auto rounded-2xl bg-card ring-1 ring-foreground/5 shadow-md md:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/60 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  <th className="px-4 py-3">Usuario</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Teléfono</th>
                  <th className="px-4 py-3">Rol</th>
                  <th className="px-4 py-3 text-right">Órdenes</th>
                  <th className="px-4 py-3 text-right">Total gastado</th>
                  <th className="px-4 py-3">Registro</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {users.map((u) => (
                  <tr key={u.id} className="transition-luxury hover:bg-muted/40">
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/users/${u.id}`}
                        className="font-medium text-brand-orange hover:underline"
                      >
                        {u.full_name || "Sin nombre"}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {u.email || "—"}
                    </td>
                    <td className="px-4 py-3 text-xs">{u.phone ? formatPhone(u.phone) : "—"}</td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                          u.role === "admin"
                            ? "bg-brand-orange/15 text-brand-orange"
                            : "bg-sky-500/10 text-sky-700"
                        )}
                      >
                        {u.role === "admin" ? (
                          <ShieldCheck className="h-3 w-3" />
                        ) : (
                          <User className="h-3 w-3" />
                        )}
                        {u.role === "admin" ? "Admin" : "Cliente"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono">{u.order_count}</td>
                    <td className="px-4 py-3 text-right font-mono font-bold">
                      {formatRD(u.total_spent)}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {formatDateTime(u.created_at)}
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
