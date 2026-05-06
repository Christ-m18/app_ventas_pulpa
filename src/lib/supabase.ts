import { SUPABASE_CONFIGURED, supabaseBrowser } from "@/infrastructure/supabase";

if (!SUPABASE_CONFIGURED && typeof window !== "undefined") {
  console.warn(
    "Supabase environment variables are missing or using placeholder values. Data fetching will fail.",
  );
}

export const supabase = supabaseBrowser;
