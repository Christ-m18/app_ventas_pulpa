import "server-only";

import { createSupabaseAdminClient, isAdminAvailable } from "@/infrastructure/supabase/admin";

export type AdminUserRow = {
  id: string;
  email: string | null;
  full_name: string | null;
  phone: string | null;
  role: string;
  mfa_required: boolean;
  created_at: string;
  last_sign_in_at: string | null;
  order_count: number;
  total_spent: number;
};

export type AdminUserDetail = AdminUserRow & {
  orders: Array<{
    id: string;
    total: number;
    status: string;
    payment_status: string;
    created_at: string;
  }>;
};

export async function listUsers(opts?: {
  search?: string;
  role?: string;
}): Promise<AdminUserRow[]> {
  if (!isAdminAvailable()) return [];

  const sb = createSupabaseAdminClient();

  // Get all profiles
  let query = sb
    .from("profiles")
    .select("id, full_name, phone, role, mfa_required, created_at")
    .order("created_at", { ascending: false });

  if (opts?.role && opts.role !== "all") {
    query = query.eq("role", opts.role);
  }

  if (opts?.search) {
    query = query.or(
      `full_name.ilike.%${opts.search}%,phone.ilike.%${opts.search}%`
    );
  }

  const { data: profiles, error } = await query;
  if (error || !profiles) return [];

  // Get auth users for email + last_sign_in
  const userIds = profiles.map((p) => p.id);
  const { data: authData } = await sb.auth.admin.listUsers({ perPage: 1000 });
  const authMap = new Map(
    (authData?.users ?? []).map((u) => [
      u.id,
      { email: u.email ?? null, last_sign_in_at: u.last_sign_in_at ?? null },
    ])
  );

  // Get order counts and totals per user
  const { data: orderStats } = await sb
    .from("orders")
    .select("user_id, total")
    .in("user_id", userIds);

  const statsMap = new Map<string, { count: number; spent: number }>();
  for (const o of orderStats ?? []) {
    if (!o.user_id) continue;
    const s = statsMap.get(o.user_id) ?? { count: 0, spent: 0 };
    s.count++;
    s.spent += Number(o.total);
    statsMap.set(o.user_id, s);
  }

  // Filter by search on email too if needed
  let result: AdminUserRow[] = profiles.map((p) => {
    const auth = authMap.get(p.id);
    const stats = statsMap.get(p.id);
    return {
      id: p.id,
      email: auth?.email ?? null,
      full_name: p.full_name,
      phone: p.phone,
      role: p.role ?? "customer",
      mfa_required: p.mfa_required ?? false,
      created_at: p.created_at,
      last_sign_in_at: auth?.last_sign_in_at ?? null,
      order_count: stats?.count ?? 0,
      total_spent: stats?.spent ?? 0,
    };
  });

  // Also search by email if search string provided
  if (opts?.search) {
    const searchLower = opts.search.toLowerCase();
    result = result.filter(
      (u) =>
        u.full_name?.toLowerCase().includes(searchLower) ||
        u.phone?.toLowerCase().includes(searchLower) ||
        u.email?.toLowerCase().includes(searchLower)
    );
  }

  return result;
}

export async function getUserDetail(userId: string): Promise<AdminUserDetail | null> {
  if (!isAdminAvailable()) return null;

  const sb = createSupabaseAdminClient();

  const { data: profile, error } = await sb
    .from("profiles")
    .select("id, full_name, phone, role, mfa_required, created_at")
    .eq("id", userId)
    .single();

  if (error || !profile) return null;

  // Auth data
  const { data: authData } = await sb.auth.admin.getUserById(userId);
  const email = authData?.user?.email ?? null;
  const last_sign_in_at = authData?.user?.last_sign_in_at ?? null;

  // Orders
  const { data: orders } = await sb
    .from("orders")
    .select("id, total, status, payment_status, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(20);

  const orderList = orders ?? [];
  const order_count = orderList.length;
  const total_spent = orderList.reduce((sum, o) => sum + Number(o.total), 0);

  return {
    id: profile.id,
    email,
    full_name: profile.full_name,
    phone: profile.phone,
    role: profile.role ?? "customer",
    mfa_required: profile.mfa_required ?? false,
    created_at: profile.created_at,
    last_sign_in_at,
    order_count,
    total_spent,
    orders: orderList,
  };
}

export async function updateUserRole(
  userId: string,
  role: "admin" | "customer"
): Promise<{ ok: boolean; error?: string }> {
  if (!isAdminAvailable()) return { ok: false, error: "Servicio no disponible" };

  const sb = createSupabaseAdminClient();

  const { error } = await sb
    .from("profiles")
    .update({ role })
    .eq("id", userId);

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
