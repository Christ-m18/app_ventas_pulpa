import { createClient } from '@supabase/supabase-js';

const rawUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const rawKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

const isMissingOrPlaceholder =
  !rawUrl ||
  rawUrl === 'your-supabase-url' ||
  !rawKey ||
  rawKey === 'your-supabase-anon-key';

if (isMissingOrPlaceholder && __DEV__) {
  console.warn(
    '[mobile] Configura EXPO_PUBLIC_SUPABASE_URL y EXPO_PUBLIC_SUPABASE_ANON_KEY en mobile/.env'
  );
}

export const supabase = createClient(
  isMissingOrPlaceholder ? 'https://placeholder.supabase.co' : rawUrl,
  isMissingOrPlaceholder ? 'placeholder' : rawKey
);
