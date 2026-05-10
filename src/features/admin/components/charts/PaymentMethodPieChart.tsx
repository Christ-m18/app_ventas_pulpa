"use client";

import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";

type Props = {
  cashRevenue: number;
  transferRevenue: number;
};

const COLORS = [
  "oklch(0.78 0.22 130)", // lime — cash
  "oklch(0.70 0.21 47)",  // orange — transfer
];

function formatRD(val: number) {
  return `RD$${val.toLocaleString("es-DO", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

export function PaymentMethodPieChart({ cashRevenue, transferRevenue }: Props) {
  const total = cashRevenue + transferRevenue;
  if (total === 0) {
    return (
      <p className="py-12 text-center text-sm text-muted-foreground">
        Sin datos de pagos.
      </p>
    );
  }

  const data = [
    { name: "Efectivo", value: cashRevenue },
    { name: "Transferencia", value: transferRevenue },
  ];

  const cashPct = ((cashRevenue / total) * 100).toFixed(0);
  const transferPct = ((transferRevenue / total) * 100).toFixed(0);

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start sm:gap-6">
      <ResponsiveContainer width={180} height={180}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={80}
            paddingAngle={3}
            dataKey="value"
            strokeWidth={0}
          >
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              background: "oklch(0.98 0.01 75)",
              border: "1px solid oklch(0.5 0 0 / 12%)",
              borderRadius: "12px",
              boxShadow: "0 8px 24px oklch(0 0 0 / 10%)",
              fontSize: "13px",
              padding: "10px 14px",
            }}
            formatter={(value) => formatRD(Number(value))}
          />
        </PieChart>
      </ResponsiveContainer>

      <div className="flex flex-col justify-center gap-3">
        <div className="flex items-center gap-3">
          <span
            className="h-3 w-3 rounded-full"
            style={{ background: COLORS[0] }}
          />
          <div>
            <p className="text-sm font-bold">Efectivo</p>
            <p className="text-xs text-muted-foreground">
              {formatRD(cashRevenue)} · {cashPct}%
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span
            className="h-3 w-3 rounded-full"
            style={{ background: COLORS[1] }}
          />
          <div>
            <p className="text-sm font-bold">Transferencia</p>
            <p className="text-xs text-muted-foreground">
              {formatRD(transferRevenue)} · {transferPct}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
