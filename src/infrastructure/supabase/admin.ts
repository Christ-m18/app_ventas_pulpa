import "server-only";

import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL } from "./env";

const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const isPlaceholder =
  !SERVICE_ROLE_KEY ||
  SERVICE_ROLE_KEY.startsWith("your-") ||
  SERVICE_ROLE_KEY === "missing-service-role-key";

if (isPlaceholder) {
  console.warn(
    "[supabase admin] SUPABASE_SERVICE_ROLE_KEY missing or placeholder — server-side privileged operations will fail.",
  );
}

// Service-role client. NEVER import this from a Client Component.
// Used by API routes for: voucher upload to private bucket, voucher row
// inserts (RLS denies direct user inserts), reading any order regardless
// of ownership when reviewing payments.
export function createSupabaseAdminClient() {
  return createClient(SUPABASE_URL, SERVICE_ROLE_KEY ?? "missing-service-role-key", {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export const ADMIN_AVAILABLE = !isPlaceholder;

