import { createClient } from "@supabase/supabase-js";
import {
  SUPABASE_ADMIN_ENV_VARS,
  SUPABASE_BROWSER_ENV_VARS,
  getSupabaseAdminEnvStatus,
  getSupabaseBrowserEnvStatus,
  validateSupabaseProjectUrl
} from "@/lib/supabase/env";

export { SUPABASE_ADMIN_ENV_VARS, SUPABASE_BROWSER_ENV_VARS, getSupabaseAdminEnvStatus, getSupabaseBrowserEnvStatus };

export function getMissingSupabaseBrowserEnvVars() {
  return getSupabaseBrowserEnvStatus().missingEnv;
}

export function getMissingSupabaseAdminEnvVars() {
  return getSupabaseAdminEnvStatus().missingEnv;
}

export function hasSupabaseEnv() {
  return getSupabaseBrowserEnvStatus().ok;
}

export function createSupabaseServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey || validateSupabaseProjectUrl(supabaseUrl)) {
    return null;
  }

  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false
    }
  });
}

export function hasSupabaseAdminEnv() {
  return getSupabaseAdminEnvStatus().ok;
}

export function createSupabaseAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey || validateSupabaseProjectUrl(supabaseUrl)) {
    return null;
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false
    }
  });
}
