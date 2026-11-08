import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let client: SupabaseClient | undefined;

export function getSupabase() {
  if (client) return client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!url || !anonKey) throw new Error('Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
  let parsedUrl: URL;
  try { parsedUrl = new URL(url); } catch { throw new Error('NEXT_PUBLIC_SUPABASE_URL must be a valid URL'); }
  if (parsedUrl.protocol !== 'https:' && parsedUrl.protocol !== 'http:') throw new Error('NEXT_PUBLIC_SUPABASE_URL must use HTTP or HTTPS');
  client = createClient(url, anonKey);
  return client;
}
