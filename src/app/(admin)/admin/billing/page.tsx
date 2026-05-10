import { getSalesReport } from "@/features/admin/services/adminReportingService";
import { formatDay, formatRD, zoneLabel } from "@/features/admin/lib/format";
import { StatCard } from "@/features/admin/components/StatCard";
import { Banknote, Building2, Receipt, ShoppingCart, TrendingUp } from "lucide-react";
import { BillingDateFilter } from "@/features/admin/components/BillingDateFilter";
import { SalesLineChart } from "@/features/admin/components/charts/SalesLineChart";
import { OrdersLineChart } from "@/features/admin/components/charts/OrdersLineChart";
import { PaymentMethodPieChart } from "@/features/admin/components/charts/PaymentMethodPieChart";
import { ZoneBarChart } from "@/features/admin/components/charts/ZoneBarChart";
import { TopProductsBarChart } from "@/features/admin/components/charts/TopProductsBarChart";

export const dynamic = "force-dynamic";
export const metadata = { title: "Facturación" };

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const from = typeof sp.from === "string" ? sp.from : monthStart.toISOString().slice(0, 10);
  const to = typeof sp.to === "string" ? sp.to : now.toISOString().slice(0, 10);

  const report = await getSalesReport(`${from}T00:00:00Z`, `${to}T23:59:59Z`);

  // Prepare zone data with readable names
  const zoneChartData = report.byZone.map((z) => ({
    ...z,
    zoneName: zoneLabel(z.zone),
  }));

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-brand-orange">
          Reportes
        </p>
        <h1 className="text-3xl font-black tracking-tight">Facturación</h1>
        <p className="text-sm text-muted-foreground">
          Analíticas en tiempo real basadas en órdenes completadas.
        </p>
      </header>

      <BillingDateFilter from={from} to={to} />

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Ingresos totales"
          value={formatRD(report.totalRevenue)}
          icon={TrendingUp}
          tone="orange"
        />
        <StatCard
          label="Órdenes"
          value={report.totalOrders}
          hint={`Ticket promedio ${formatRD(report.averageTicket)}`}
          icon={Receipt}
          tone="mandarin"
        />
        <StatCard
          label="Efectivo"
          value={formatRD(report.cashRevenue)}
          icon={Banknote}
          tone="lime"
        />
        <StatCard
          label="Transferencia"
          value={formatRD(report.transferRevenue)}
          icon={Building2}
          tone="lemon"
        />
      </div>

      {/* Revenue trend chart */}
      <section className="rounded-2xl bg-card p-5 ring-1 ring-foreground/5 shadow-md">
        <h2 className="mb-1 text-sm font-bold">Tendencia de ingresos</h2>
        <p className="mb-4 text-xs text-muted-foreground">
          Evolución diaria de ingresos en el período seleccionado
        </p>
        <SalesLineChart data={report.byDay} />
      </section>

      {/* Orders trend + Payment method breakdown */}
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl bg-card p-5 ring-1 ring-foreground/5 shadow-md">
          <h2 className="mb-1 text-sm font-bold">Volumen de órdenes</h2>
          <p className="mb-4 text-xs text-muted-foreground">
            Cantidad de órdenes por día
          </p>
          <OrdersLineChart data={report.byDay} />
        </section>

        <section className="rounded-2xl bg-card p-5 ring-1 ring-foreground/5 shadow-md">
          <h2 className="mb-1 text-sm font-bold">Distribución de pagos</h2>
          <p className="mb-4 text-xs text-muted-foreground">
            Proporción entre efectivo y transferencia
          </p>
          <PaymentMethodPieChart
            cashRevenue={report.cashRevenue}
            transferRevenue={report.transferRevenue}
          />
        </section>
      </div>

      {/* Zone revenue chart + list */}
      <section className="rounded-2xl bg-card p-5 ring-1 ring-foreground/5 shadow-md">
        <h2 className="mb-1 text-sm font-bold">Ingresos por zona</h2>
        <p className="mb-4 text-xs text-muted-foreground">
          Las zonas con mayor volumen de ventas
        </p>
        <ZoneBarChart data={zoneChartData} />

        {/* Detailed zone list below chart */}
        {report.byZone.length > 0 && (
          <div className="mt-4 border-t border-border/40 pt-4">
            <ul className="space-y-1.5">
              {report.byZone.map((z) => (
                <li key={z.zone} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{zoneLabel(z.zone)}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">{z.orders} ord.</span>
                    <span className="font-mono font-bold">{formatRD(z.revenue)}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {/* Top products chart + table */}
      <section className="rounded-2xl bg-card p-5 ring-1 ring-foreground/5 shadow-md">
        <div className="mb-4 flex items-center gap-2">
          <ShoppingCart className="h-4 w-4 text-brand-orange" />
          <div>
            <h2 className="text-sm font-bold">Top productos</h2>
            <p className="text-xs text-muted-foreground">
              Productos con mayor ingreso en el período
            </p>
          </div>
        </div>

        <TopProductsBarChart data={report.topProducts} />

        {report.topProducts.length > 0 && (
          <div className="mt-4 border-t border-border/40 pt-4">
            {/* Mobile list */}
            <ul className="divide-y divide-border/30 md:hidden">
              {report.topProducts.map((p, i) => (
                <li key={p.product_id} className="flex items-center justify-between gap-3 px-1 py-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-orange/15 text-[10px] font-bold text-brand-orange">
                      {i + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{p.name}</p>
                      <p className="text-xs text-muted-foreground">{p.units} uds.</p>
                    </div>
                  </div>
                  <span className="shrink-0 font-mono text-sm font-bold">{formatRD(p.revenue)}</span>
                </li>
              ))}
            </ul>

            {/* Desktop table */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/40 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    <th className="px-3 py-2">#</th>
                    <th className="px-3 py-2">Producto</th>
                    <th className="px-3 py-2 text-right">Uds. vendidas</th>
                    <th className="px-3 py-2 text-right">Ingresos</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {report.topProducts.map((p, i) => (
                    <tr key={p.product_id}>
                      <td className="px-3 py-2 font-mono text-muted-foreground">{i + 1}</td>
                      <td className="px-3 py-2 font-medium">{p.name}</td>
                      <td className="px-3 py-2 text-right font-mono">{p.units}</td>
                      <td className="px-3 py-2 text-right font-mono font-bold">
                        {formatRD(p.revenue)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      {/* Daily sales list */}
      <section className="rounded-2xl bg-card p-5 ring-1 ring-foreground/5 shadow-md">
        <h2 className="mb-3 text-sm font-bold">Detalle diario</h2>
        {report.byDay.length === 0 ? (
          <p className="text-sm text-muted-foreground">Sin datos en este rango.</p>
        ) : (
          <ul className="space-y-1.5">
            {report.byDay.map((d) => (
              <li key={d.date} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{formatDay(d.date)}</span>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground">{d.orders} ord.</span>
                  <span className="font-mono font-bold">{formatRD(d.revenue)}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
