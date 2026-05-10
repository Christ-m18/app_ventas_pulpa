"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

type DayData = { date: string; revenue: number; orders: number };

function formatShortDay(iso: string) {
  const d = new Date(iso + "T12:00:00");
  return d.toLocaleDateString("es-DO", { day: "numeric", month: "short" });
}

function formatRD(val: number) {
  return `RD$${val.toLocaleString("es-DO", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

export function SalesLineChart({ data }: { data: DayData[] }) {
  if (data.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-muted-foreground">
        Sin datos de ventas en este período.
      </p>
    );
  }

  const chartData = data.map((d) => ({
    ...d,
    label: formatShortDay(d.date),
  }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="oklch(0.70 0.21 47)" stopOpacity={0.35} />
            <stop offset="95%" stopColor="oklch(0.70 0.21 47)" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.5 0 0 / 10%)" />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 11, fill: "oklch(0.5 0.02 40)" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "oklch(0.5 0.02 40)" }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v: number) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)}
          width={45}
        />
        <Tooltip
          contentStyle={{
            background: "oklch(0.98 0.01 75)",
            border: "1px solid oklch(0.5 0 0 / 12%)",
            borderRadius: "12px",
            boxShadow: "0 8px 24px oklch(0 0 0 / 10%)",
            fontSize: "13px",
            padding: "10px 14px",
          }}
          formatter={(value, name) => [
            name === "revenue" ? formatRD(Number(value)) : value,
            name === "revenue" ? "Ingresos" : "Órdenes",
          ]}
          labelFormatter={(label) => String(label)}
        />
        <Area
          type="monotone"
          dataKey="revenue"
          stroke="oklch(0.70 0.21 47)"
          strokeWidth={2.5}
          fill="url(#revenueGrad)"
          dot={{ r: 3, fill: "oklch(0.70 0.21 47)", strokeWidth: 0 }}
          activeDot={{ r: 5, fill: "oklch(0.70 0.21 47)", stroke: "#fff", strokeWidth: 2 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
