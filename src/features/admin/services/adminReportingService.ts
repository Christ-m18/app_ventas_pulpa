import "server-only";

import { ADMIN_AVAILABLE, createSupabaseAdminClient } from "@/infrastructure/supabase/admin";

function admin() {
  if (!ADMIN_AVAILABLE) throw new Error("ADMIN_DISABLED");
  return createSupabaseAdminClient();
}

export type SalesReport = {
  totalOrders: number;
  totalRevenue: number;
  cashRevenue: number;
  transferRevenue: number;
  averageTicket: number;
  byDay: Array<{ date: string; revenue: number; orders: number }>;
  byZone: Array<{ zone: string; revenue: number; orders: number }>;
  topProducts: Array<{ product_id: string; name: string; units: number; revenue: number }>;
};

export async function getSalesReport(from: string, to: string): Promise<SalesReport> {
  try {
    const supabase = admin();
    const { data: orders, error } = await supabase
      .from("orders")
      .select("id, total, payment_method, zone, status, created_at")
      .gte("created_at", from)
      .lte("created_at", to)
      .neq("status", "cancelled");
    if (error) throw error;

    type O = {
      id: string;
      total: number;
      payment_method: "cash_on_delivery" | "bank_transfer";
      zone: string;
      created_at: string;
    };
    const rows = (orders ?? []) as unknown as O[];

    const totalRevenue = rows.reduce((s, r) => s + Number(r.total), 0);
    const cashRevenue = rows
      .filter((r) => r.payment_method === "cash_on_delivery")
      .reduce((s, r) => s + Number(r.total), 0);
    const transferRevenue = totalRevenue - cashRevenue;

    const byDayMap = new Map<string, { revenue: number; orders: number }>();
    for (const r of rows) {
      const day = r.created_at.slice(0, 10);
      const cur = byDayMap.get(day) ?? { revenue: 0, orders: 0 };
      cur.revenue += Number(r.total);
      cur.orders += 1;
      byDayMap.set(day, cur);
    }

    const byZoneMap = new Map<string, { revenue: number; orders: number }>();
    for (const r of rows) {
      const cur = byZoneMap.get(r.zone) ?? { revenue: 0, orders: 0 };
      cur.revenue += Number(r.total);
      cur.orders += 1;
      byZoneMap.set(r.zone, cur);
    }

    let topProducts: SalesReport["topProducts"] = [];
    if (rows.length) {
      const orderIds = rows.map((r) => r.id);
      const { data: items } = await supabase
        .from("order_items")
        .select("product_id, quantity, price, products:products (name)")
        .in("order_id", orderIds);

      type Item = {
        product_id: string;
        quantity: number;
        price: number;
        products: { name: string } | null;
      };
      const itemRows = (items ?? []) as unknown as Item[];
      const tally = new Map<string, { name: string; units: number; revenue: number }>();
      for (const it of itemRows) {
        const cur = tally.get(it.product_id) ?? {
          name: it.products?.name ?? "Sin nombre",
          units: 0,
          revenue: 0,
        };
        cur.units += it.quantity;
        cur.revenue += Number(it.price) * it.quantity;
        tally.set(it.product_id, cur);
      }
      topProducts = Array.from(tally.entries())
        .map(([product_id, v]) => ({ product_id, ...v }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 10);
    }

    return {
      totalOrders: rows.length,
      totalRevenue,
      cashRevenue,
      transferRevenue,
      averageTicket: rows.length ? totalRevenue / rows.length : 0,
      byDay: Array.from(byDayMap.entries())
        .map(([date, v]) => ({ date, ...v }))
        .sort((a, b) => a.date.localeCompare(b.date)),
      byZone: Array.from(byZoneMap.entries())
        .map(([zone, v]) => ({ zone, ...v }))
        .sort((a, b) => b.revenue - a.revenue),
      topProducts,
    };
  } catch (e) {
    console.warn("[adminReportingService.getSalesReport]", e);
    return {
      totalOrders: 0,
      totalRevenue: 0,
      cashRevenue: 0,
      transferRevenue: 0,
      averageTicket: 0,
      byDay: [],
      byZone: [],
      topProducts: [],
    };
  }
}

export type DeliveriesBoard = {
  pending: Array<DeliveryItem>;
  inDelivery: Array<DeliveryItem>;
  delivered: Array<DeliveryItem>;
};

export type DeliveryItem = {
  id: string;
  zone: string;
  delivery_address: string;
  phone: string;
  total: number;
  shipping_cost: number;
  status: "pending" | "processing" | "out_for_delivery" | "delivered" | "cancelled";
  payment_method: "cash_on_delivery" | "bank_transfer";
  payment_status: string;
  created_at: string;
};

export async function getDeliveriesBoard(): Promise<DeliveriesBoard> {
  try {
    const supabase = admin();
    const { data, error } = await supabase
      .from("orders")
      .select(
        "id, zone, delivery_address, phone, total, shipping_cost, status, payment_method, payment_status, created_at",
      )
      .neq("status", "cancelled")
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) throw error;

    const all = (data ?? []) as unknown as DeliveryItem[];
    const pending = all.filter((o) => o.status === "pending" || o.status === "processing");
    const inDelivery = all.filter((o) => o.status === "out_for_delivery");
    const delivered = all.filter((o) => o.status === "delivered").slice(0, 50);
    return { pending, inDelivery, delivered };
  } catch (e) {
    console.warn("[adminReportingService.getDeliveriesBoard]", e);
    return { pending: [], inDelivery: [], delivered: [] };
  }
}
