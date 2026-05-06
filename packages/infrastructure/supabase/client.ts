/**
 * Supabase Client Factory — Single creation point.
 *
 * On the browser side we delegate to the SSR-aware singleton created in
 * `src/infrastructure/supabase/browser.ts` so there is only ONE
 * GoTrueClient per tab. On the server side (build-time / API routes)
 * we fall back to a plain `@supabase/supabase-js` client.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

let serverInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  // In the browser, always reuse the SSR-aware singleton.
  if (typeof window !== 'undefined') {
    // Dynamic require to avoid pulling in browser-only code at build time.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { supabaseBrowser } = require('@/infrastructure/supabase');
    return supabaseBrowser as SupabaseClient;
  }

  // Server side — plain client for data fetching at build / request time.
  if (serverInstance) return serverInstance;

  // We must import from the src/ folder so Next.js's Webpack DefinePlugin correctly inlines the NEXT_PUBLIC_ variables.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { SUPABASE_URL: url, SUPABASE_ANON_KEY: anonKey } = require('../../../src/infrastructure/supabase/env');

  if (!url || !anonKey || url === 'your-supabase-url' || anonKey === 'your-supabase-anon-key') {
    console.warn(
      '[Supabase] Environment variables are missing or using placeholder values.'
    );
    serverInstance = createClient(
      'https://placeholder.supabase.co',
      'placeholder'
    );
    return serverInstance;
  }

  serverInstance = createClient(url, anonKey);
  return serverInstance;
}

/** Reset the singleton (useful for testing). */
export function resetSupabaseClient(): void {
  serverInstance = null;
}
