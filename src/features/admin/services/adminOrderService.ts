import "server-only";

import { ADMIN_AVAILABLE, createSupabaseAdminClient } from "@/infrastructure/supabase/admin";
import type { OrderStatus } from "../../../../packages/core/domain/entities/order";
import type { AdminOrderDetail, AdminOrderListItem } from "./types";

type ListFilters = {
  status?: OrderStatus | "all";
  paymentMethod?: "cash_on_delivery" | "bank_transfer" | "all";
  paymentStatus?: string | "all";
  search?: string;
  from?: string;
  to?: string;
  limit?: number;
};

function admin() {
  if (!ADMIN_AVAILABLE) throw new Error("ADMIN_DISABLED");
  return createSupabaseAdminClient();
}

async function resolveCustomers(
  client: ReturnType<typeof createSupabaseAdminClient>,
  userIds: string[],
) {
  if (!userIds.length) return new Map<string, { full_name: string | null; email: string | null }>();
  const map = new Map<string, { full_name: string | null; email: string | null }>();

  const { data: profiles } = await client
    .from("profiles")
    .select("id, full_name")
    .in("id", userIds);
  for (const p of profiles ?? []) {
    map.set(p.id as string, { full_name: (p.full_name as string) ?? null, email: null });
  }

  // Best-effort email lookup. listUsers paginates — ok for MVP volumes.
  try {
    const { data: usersData } = await client.auth.admin.listUsers({ perPage: 200 });
    for (const u of usersData?.users ?? []) {
      if (userIds.includes(u.id)) {
        const cur = map.get(u.id) ?? { full_name: null, email: null };
        cur.email = u.email ?? null;
        map.set(u.id, cur);
      }
    }
  } catch {
    // ignore — emails optional
  }
  return map;
}

export async function listOrders(filters: ListFilters = {}): Promise<AdminOrderListItem[]> {
  try {
    const supabase = admin();
    let query = supabase
      .from("orders")
      .select(
        `id, user_id, total, shipping_cost, status, payment_method, payment_status,
         delivery_address, zone, phone, notes, created_at,
         order_items(id)`,
      )
      .order("created_at", { ascending: false })
      .limit(filters.limit ?? 100);

    if (filters.status && filters.status !== "all") {
      query = query.eq("status", filters.status);
    }
    if (filters.paymentMethod && filters.paymentMethod !== "all") {
      query = query.eq("payment_method", filters.paymentMethod);
    }
    if (filters.paymentStatus && filters.paymentStatus !== "all") {
      query = query.eq("payment_status", filters.paymentStatus);
    }
    if (filters.from) query = query.gte("created_at", filters.from);
    if (filters.to) query = query.lte("created_at", filters.to);
    if (filters.search) {
      query = query.or(
        `phone.ilike.%${filters.search}%,delivery_address.ilike.%${filters.search}%`,
      );
    }

    const { data, error } = await query;
    if (error) throw error;

    type Row = {
      id: string;
      user_id: string | null;
      total: number;
      shipping_cost: number;
      status: OrderStatus;
      payment_method: AdminOrderListItem["payment_method"];
      payment_status: AdminOrderListItem["payment_status"];
      delivery_address: string;
      zone: string;
      phone: string;
      notes: string | null;
      created_at: string;
      order_items: { id: string }[] | null;
    };

    const rows = (data ?? []) as unknown as Row[];
    const userIds = Array.from(new Set(rows.map((r) => r.user_id).filter((x): x is string => !!x)));
    const customers = await resolveCustomers(supabase, userIds);

    return rows.map((r) => {
      const c = r.user_id ? customers.get(r.user_id) : null;
      return {
        id: r.id,
        user_id: r.user_id,
        total: Number(r.total),
        shipping_cost: Number(r.shipping_cost),
        status: r.status,
        payment_method: r.payment_method,
        payment_status: r.payment_status,
        delivery_address: r.delivery_address,
        zone: r.zone,
        phone: r.phone,
        notes: r.notes,
        created_at: r.created_at,
        customer_name: c?.full_name ?? null,
        customer_email: c?.email ?? null,
        item_count: r.order_items?.length ?? 0,
      };
    });
  } catch (e) {
    console.warn("[adminOrderService.listOrders]", e);
    return [];
  }
}

export async function getOrderDetail(id: string): Promise<AdminOrderDetail | null> {
  try {
    const supabase = admin();
    const { data, error } = await supabase
      .from("orders")
      .select(
        `id, user_id, total, shipping_cost, status, payment_method, payment_status,
         delivery_address, zone, phone, notes, created_at,
         order_items (
           id, order_id, product_id, quantity, price,
           products:products (id, name, image_url, unit)
         )`,
      )
      .eq("id", id)
      .single();

    if (error || !data) {
      if (error) console.warn("[adminOrderService.getOrderDetail]", error.message);
      return null;
    }

    type ProductMini = { id: string; name: string; image_url: string | null; unit: string };
    type ItemRow = {
      id: string;
      order_id: string;
      product_id: string;
      quantity: number;
      price: number;
      products: ProductMini | null;
    };
    type Row = {
      id: string;
      user_id: string | null;
      total: number;
      shipping_cost: number;
      status: OrderStatus;
      payment_method: AdminOrderDetail["payment_method"];
      payment_status: AdminOrderDetail["payment_status"];
      delivery_address: string;
      zone: string;
      phone: string;
      notes: string | null;
      created_at: string;
      order_items: ItemRow[] | null;
    };
    const row = data as unknown as Row;

    let customerName: string | null = null;
    let customerPhone: string | null = null;
    let customerEmail: string | null = null;
    if (row.user_id) {
      const { data: prof } = await supabase
        .from("profiles")
        .select("full_name, phone")
        .eq("id", row.user_id)
        .maybeSingle();
      customerName = (prof?.full_name as string) ?? null;
      customerPhone = (prof?.phone as string) ?? null;

      const { data: userRes } = await supabase.auth.admin.getUserById(row.user_id);
      customerEmail = userRes?.user?.email ?? null;
    }

    const { data: voucherRows } = await supabase
      .from("payment_vouchers")
      .select("id, storage_path, extracted, is_verified, confidence, warnings, created_at")
      .eq("order_id", row.id)
      .order("created_at", { ascending: false })
      .limit(1);

    const voucher = voucherRows?.[0]
      ? {
          id: voucherRows[0].id as string,
          storage_path: voucherRows[0].storage_path as string,
          extracted: (voucherRows[0].extracted ?? {}) as Record<string, unknown>,
          is_verified: voucherRows[0].is_verified as boolean,
          confidence: (voucherRows[0].confidence as number | null) ?? null,
          warnings: (voucherRows[0].warnings ?? []) as string[],
          created_at: voucherRows[0].created_at as string,
        }
      : null;

    return {
      id: row.id,
      user_id: row.user_id,
      total: Number(row.total),
      shipping_cost: Number(row.shipping_cost),
      status: row.status,
      payment_method: row.payment_method,
      payment_status: row.payment_status,
      delivery_address: row.delivery_address,
      zone: row.zone,
      phone: row.phone,
      notes: row.notes,
      created_at: row.created_at,
      customer: {
        id: row.user_id,
        full_name: customerName,
        email: customerEmail,
        phone: customerPhone ?? row.phone,
      },
      items: (row.order_items ?? []).map((it) => ({
        id: it.id,
        order_id: it.order_id,
        product_id: it.product_id,
        quantity: it.quantity,
        price: Number(it.price),
        product: it.products
          ? {
              id: it.products.id,
              name: it.products.name,
              image_url: it.products.image_url,
              unit: it.products.unit,
            }
          : null,
      })),
      voucher,
    };
  } catch (e) {
    console.warn("[adminOrderService.getOrderDetail]", e);
    return null;
  }
}

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  const supabase = admin();
  const { error } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", orderId);
  if (error) throw new Error(error.message);
}

export async function getDashboardStats() {
  try {
    const supabase = admin();

    const todayStart = new Date();
    todayStart.setUTCHours(0, 0, 0, 0);
    const monthStart = new Date(todayStart);
    monthStart.setUTCDate(1);

    const [
      { count: pendingCount },
      { count: outForDeliveryCount },
      { count: pendingPaymentReview },
      { data: todaySales },
      { data: monthSales },
      { data: lowStock },
    ] = await Promise.all([
      supabase.from("orders").select("id", { count: "exact", head: true }).eq("status", "pending"),
      supabase
        .from("orders")
        .select("id", { count: "exact", head: true })
        .eq("status", "out_for_delivery"),
      supabase
        .from("orders")
        .select("id", { count: "exact", head: true })
        .eq("payment_status", "pending_review"),
      supabase
        .from("orders")
        .select("total")
        .gte("created_at", todayStart.toISOString())
        .neq("status", "cancelled"),
      supabase
        .from("orders")
        .select("total, payment_method")
        .gte("created_at", monthStart.toISOString())
        .neq("status", "cancelled"),
      supabase.from("products").select("id, name, stock").lte("stock", 5).order("stock"),
    ]);

    const todayRevenue = (todaySales ?? []).reduce((s, r) => s + Number(r.total), 0);
    const monthRevenue = (monthSales ?? []).reduce((s, r) => s + Number(r.total), 0);
    const cashRevenue = (monthSales ?? [])
      .filter((r) => r.payment_method === "cash_on_delivery")
      .reduce((s, r) => s + Number(r.total), 0);
    const transferRevenue = monthRevenue - cashRevenue;

    return {
      pendingCount: pendingCount ?? 0,
      outForDeliveryCount: outForDeliveryCount ?? 0,
      pendingPaymentReview: pendingPaymentReview ?? 0,
      todayRevenue,
      monthRevenue,
      cashRevenue,
      transferRevenue,
      lowStock: (lowStock ?? []) as Array<{ id: string; name: string; stock: number }>,
    };
  } catch (e) {
    console.warn("[adminOrderService.getDashboardStats]", e);
    return {
      pendingCount: 0,
      outForDeliveryCount: 0,
      pendingPaymentReview: 0,
      todayRevenue: 0,
      monthRevenue: 0,
      cashRevenue: 0,
      transferRevenue: 0,
      lowStock: [] as Array<{ id: string; name: string; stock: number }>,
    };
  }
}
