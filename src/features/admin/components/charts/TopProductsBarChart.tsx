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

type ProductData = { product_id: string; name: string; units: number; revenue: number };

function formatRD(val: number) {
  return `RD$${val.toLocaleString("es-DO", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

export function TopProductsBarChart({ data }: { data: ProductData[] }) {
  if (data.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-muted-foreground">
        Sin datos de productos.
      </p>
    );
  }

  const chartData = data.slice(0, 8).map((d) => ({
    ...d,
    shortName: d.name.length > 16 ? d.name.slice(0, 14) + "…" : d.name,
  }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart
        data={chartData}
        layout="vertical"
        margin={{ top: 4, right: 8, left: 4, bottom: 0 }}
      >
        <defs>
          <linearGradient id="productBarGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="oklch(0.70 0.21 47)" stopOpacity={0.85} />
            <stop offset="100%" stopColor="oklch(0.76 0.18 60)" stopOpacity={0.85} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.5 0 0 / 10%)" horizontal={false} />
        <XAxis
          type="number"
          tick={{ fontSize: 11, fill: "oklch(0.5 0.02 40)" }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v: number) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)}
        />
        <YAxis
          type="category"
          dataKey="shortName"
          tick={{ fontSize: 11, fill: "oklch(0.5 0.02 40)" }}
          axisLine={false}
          tickLine={false}
          width={110}
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
            name === "revenue" ? formatRD(Number(value)) : `${value} uds.`,
            name === "revenue" ? "Ingresos" : "Unidades",
          ]}
          labelFormatter={(_label, payload) => {
            const entry = payload?.[0] as { payload?: ProductData } | undefined;
            return entry?.payload?.name ?? "";
          }}
        />
        <Bar
          dataKey="revenue"
          fill="url(#productBarGrad)"
          radius={[0, 6, 6, 0]}
          maxBarSize={28}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
