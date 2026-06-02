import { createClient } from "@supabase/supabase-js";

export const SUPABASE_BROWSER_ENV_VARS = ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY"] as const;
export const SUPABASE_ADMIN_ENV_VARS = ["NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"] as const;

type EnvVarName = (typeof SUPABASE_BROWSER_ENV_VARS)[number] | (typeof SUPABASE_ADMIN_ENV_VARS)[number];

function getMissingEnvVars(requiredEnvVars: readonly EnvVarName[]) {
  return requiredEnvVars.filter((envVar) => !process.env[envVar]);
}

export function getMissingSupabaseBrowserEnvVars() {
  return getMissingEnvVars(SUPABASE_BROWSER_ENV_VARS);
}

export function getMissingSupabaseAdminEnvVars() {
  return getMissingEnvVars(SUPABASE_ADMIN_ENV_VARS);
}

export function hasSupabaseEnv() {
  return getMissingSupabaseBrowserEnvVars().length === 0;
}

export function createSupabaseServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false
    }
  });
}

export function hasSupabaseAdminEnv() {
  return getMissingSupabaseAdminEnvVars().length === 0;
}

export function createSupabaseAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return null;
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false
    }
  });
}
