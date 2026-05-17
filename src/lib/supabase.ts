import { createClient, SupabaseClient } from '@supabase/supabase-js';

function createAdminClient(): SupabaseClient {
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL;

  // Support both old (anon key) and new (publishable key) Supabase naming
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) {
    throw new Error(
      `[GSTP] Supabase env vars missing.\n` +
      `Set these in Vercel Dashboard → Settings → Environment Variables:\n` +
      `  NEXT_PUBLIC_SUPABASE_URL\n` +
      `  NEXT_PUBLIC_SUPABASE_ANON_KEY (or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)\n` +
      `  SUPABASE_SERVICE_ROLE_KEY\n` +
      `  JWT_SECRET`
    );
  }

  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

function createPublicClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) {
    throw new Error('[GSTP] Missing NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY');
  }
  return createClient(url, key);
}

// Lazy singletons — created on first request, never at build time
let _admin: SupabaseClient | null = null;
let _client: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  if (!_admin) _admin = createAdminClient();
  return _admin;
}

export function getSupabase(): SupabaseClient {
  if (!_client) _client = createPublicClient();
  return _client;
}

// Proxy wrappers so existing code (supabaseAdmin.from(...)) keeps working unchanged
export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get(_, prop: string) {
    return (getSupabaseAdmin() as any)[prop];
  },
});

export const supabase = new Proxy({} as SupabaseClient, {
  get(_, prop: string) {
    return (getSupabase() as any)[prop];
  },
});
