import { isAdminBypassAllowed } from "@/lib/admin-session";
import { getSupabaseAdminEnvStatus, getSupabaseBrowserEnvStatus, validateSupabaseProjectUrl } from "@/lib/supabase/env";

export const ADMIN_ENV_CHECKS = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "ADMIN_PASSWORD",
  "ALLOW_ADMIN_BYPASS"
] as const;

export type AdminEnvCheckName = (typeof ADMIN_ENV_CHECKS)[number];

export type AdminDataDiagnostics = {
  loginState: "unauthenticated" | "authenticated";
  databaseState: "not_checked" | "failed" | "ready";
  requestPath: string;
  failedRequest?: string;
  errorReason?: string;
  envErrors: string[];
  missingEnv: AdminEnvCheckName[];
  checkedEnv: AdminEnvCheckName[];
  requiredEnv: AdminEnvCheckName[];
  nextStep?: string;
};

function isMissing(name: AdminEnvCheckName) {
  if (name === "ALLOW_ADMIN_BYPASS") return process.env.ALLOW_ADMIN_BYPASS === undefined;
  return !process.env[name];
}

export function getAdminDataEnvDiagnostics(requestPath: string): AdminDataDiagnostics {
  const supabaseAdmin = getSupabaseAdminEnvStatus();
  const browser = getSupabaseBrowserEnvStatus();
  const bypassAllowed = isAdminBypassAllowed();
  const requiredEnv: AdminEnvCheckName[] = ["NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"];

  if (!bypassAllowed) {
    requiredEnv.push("ADMIN_PASSWORD");
  }

  const missingEnv = requiredEnv.filter(isMissing);
  const envErrors = [...supabaseAdmin.errors];

  if (!process.env.ADMIN_PASSWORD && !bypassAllowed) {
    envErrors.push("缺少 ADMIN_PASSWORD。若不是 Preview bypass 測試，後台登入需要 ADMIN_PASSWORD。");
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    envErrors.push("缺少 NEXT_PUBLIC_SUPABASE_ANON_KEY。公開預約與部分前端 Supabase 功能需要此 env。");
  } else if (!browser.ok) {
    envErrors.push(...browser.errors.filter((error) => !envErrors.includes(error)));
  }

  const urlFormatError = validateSupabaseProjectUrl(process.env.NEXT_PUBLIC_SUPABASE_URL, "NEXT_PUBLIC_SUPABASE_URL");
  if (urlFormatError && !envErrors.includes(urlFormatError)) {
    envErrors.push(urlFormatError);
  }

  return {
    loginState: "authenticated",
    databaseState: envErrors.length ? "failed" : "ready",
    requestPath,
    failedRequest: envErrors.length ? requestPath : undefined,
    errorReason: envErrors[0],
    envErrors,
    missingEnv: Array.from(new Set(missingEnv)),
    checkedEnv: [...ADMIN_ENV_CHECKS],
    requiredEnv,
    nextStep: envErrors.length ? "請確認 Vercel Environment Variables 後重新部署。" : undefined
  };
}

export function buildAdminDataErrorPayload(requestPath: string, fallbackError = "Supabase admin environment is not configured") {
  const diagnostics = getAdminDataEnvDiagnostics(requestPath);
  const failedDiagnostics: AdminDataDiagnostics = {
    ...diagnostics,
    databaseState: "failed",
    failedRequest: diagnostics.failedRequest ?? requestPath,
    errorReason: diagnostics.errorReason ?? fallbackError,
    nextStep: diagnostics.nextStep ?? "請確認 Vercel env、Supabase schema / RLS 與 request path 後重新部署。"
  };

  return {
    error: failedDiagnostics.errorReason ?? fallbackError,
    diagnostics: failedDiagnostics,
    envErrors: failedDiagnostics.envErrors,
    missingEnv: failedDiagnostics.missingEnv,
    checkedEnv: failedDiagnostics.checkedEnv,
    requiredEnv: failedDiagnostics.requiredEnv,
    requestPath,
    failedRequest: failedDiagnostics.failedRequest
  };
}
