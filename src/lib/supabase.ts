import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

const missingEnvMessage =
  'Missing Supabase environment variables. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.';

const missingClient = new Proxy(
  {},
  {
    get() {
      throw new Error(missingEnvMessage);
    },
  },
) as SupabaseClient;

if (!isSupabaseConfigured) {
  console.warn(missingEnvMessage);
}

export const supabase: SupabaseClient = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : missingClient;
