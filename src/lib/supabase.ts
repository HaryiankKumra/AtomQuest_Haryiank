import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
// Supports both old anon key format and new publishable key format
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Client-side Supabase (public)
export const supabase = createClient(supabaseUrl, supabaseKey);

// Server-side Supabase — uses service role if available, else falls back to anon key
// With RLS disabled (see SQL schema), anon key has full access
export const supabaseAdmin = createClient(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);
