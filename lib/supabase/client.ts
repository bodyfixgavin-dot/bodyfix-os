import { createClient } from "@supabase/supabase-js";
import { getSupabaseBrowserEnvStatus, validateSupabaseProjectUrl } from "@/lib/supabase/env";

export function hasSupabaseBrowserEnv() {
  return getSupabaseBrowserEnvStatus().ok;
}

export function createSupabaseBrowserClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey || validateSupabaseProjectUrl(supabaseUrl)) {
    return null;
  }

  return createClient(supabaseUrl, supabaseAnonKey);
}
