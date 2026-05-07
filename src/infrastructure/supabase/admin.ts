import "server-only";

import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL } from "./env";

export function getServiceRoleKey() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key || key.startsWith("your-") || key === "missing-service-role-key") {
    return null;
  }
  return key;
}

// Service-role client. NEVER import this from a Client Component.
// Used by API routes for: voucher upload to private bucket, voucher row
// inserts (RLS denies direct user inserts), reading any order regardless
// of ownership when reviewing payments.
export function createSupabaseAdminClient() {
  const key = getServiceRoleKey();
  
  if (!key) {
    console.warn(
      "[supabase admin] SUPABASE_SERVICE_ROLE_KEY missing or placeholder — server-side privileged operations will fail.",
    );
  }

  return createClient(SUPABASE_URL, key ?? "missing-service-role-key", {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export function isAdminAvailable() {
  return !!getServiceRoleKey();
}

