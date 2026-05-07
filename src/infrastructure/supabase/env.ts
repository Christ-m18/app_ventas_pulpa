const PLACEHOLDER_URL = "https://placeholder.supabase.co";
const PLACEHOLDER_KEY = "placeholder";

// Cache buster: force Webpack to re-evaluate the NEXT_PUBLIC_ variables
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || PLACEHOLDER_URL;
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || PLACEHOLDER_KEY;

export const SUPABASE_CONFIGURED =
  SUPABASE_URL !== PLACEHOLDER_URL && SUPABASE_ANON_KEY !== PLACEHOLDER_KEY;
