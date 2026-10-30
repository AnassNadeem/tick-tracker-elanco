import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
// Prefer the service-role key on the server; fall back to the publishable/anon key
// (which needs an "insert" storage policy on the bucket).
const key =
  process.env.SUPABASE_SERVICE_ROLE_KEY ??
  process.env.SUPABASE_ANON_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  "";

export const STORAGE_BUCKET = process.env.SUPABASE_STORAGE_BUCKET ?? "sighting-photos";

export function isSupabaseStorageConfigured(): boolean {
  return Boolean(url && key);
}

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!client) {
    client = createClient(url, key, { auth: { persistSession: false } });
  }
  return client;
}
