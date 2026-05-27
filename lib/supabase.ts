import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Checks if Supabase has been configured with local or cloud credentials
export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return !!(url && url.trim() !== '' && anonKey && anonKey.trim() !== '');
}

let supabaseClient: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured()) {
    return null;
  }

  if (!supabaseClient) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    supabaseClient = createClient(url, anonKey, {
      auth: {
        persistSession: false,
      }
    });
  }

  return supabaseClient;
}
