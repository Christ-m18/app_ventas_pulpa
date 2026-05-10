"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

type ZoneData = { zone: string; zoneName: string; revenue: number; orders: number };

function formatRD(val: number) {
  return `RD$${val.toLocaleString("es-DO", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

export function ZoneBarChart({ data }: { data: ZoneData[] }) {
  if (data.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-muted-foreground">
        Sin datos de zonas.
      </p>
    );
  }

  // Abbreviate long names for mobile
  const chartData = data.slice(0, 8).map((d) => ({
    ...d,
    shortName: d.zoneName.length > 14 ? d.zoneName.slice(0, 12) + "…" : d.zoneName,
  }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="oklch(0.76 0.18 60)" stopOpacity={0.9} />
            <stop offset="100%" stopColor="oklch(0.70 0.21 47)" stopOpacity={0.9} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.5 0 0 / 10%)" vertical={false} />
        <XAxis
          dataKey="shortName"
          tick={{ fontSize: 10, fill: "oklch(0.5 0.02 40)" }}
          axisLine={false}
          tickLine={false}
          interval={0}
          angle={-25}
          textAnchor="end"
          height={55}
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
          labelFormatter={(_label, payload) => {
            const entry = payload?.[0] as { payload?: ZoneData } | undefined;
            return entry?.payload?.zoneName ?? "";
          }}
        />
        <Bar
          dataKey="revenue"
          fill="url(#barGrad)"
          radius={[6, 6, 0, 0]}
          maxBarSize={48}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
