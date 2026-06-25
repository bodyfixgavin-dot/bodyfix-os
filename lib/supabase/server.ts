import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
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
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey || validateSupabaseProjectUrl(supabaseUrl)) {
    return null;
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
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


export async function createSupabaseUserServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey || validateSupabaseProjectUrl(supabaseUrl)) {
    return null;
  }

  const cookieStore = await cookies();

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Server Components cannot persist refreshed cookies; Route Handlers can.
        }
      }
    }
  });
}
