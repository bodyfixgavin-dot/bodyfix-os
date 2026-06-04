export const SUPABASE_BROWSER_ENV_VARS = ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY"] as const;
export const SUPABASE_ADMIN_ENV_VARS = ["NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"] as const;

type BrowserEnvVarName = (typeof SUPABASE_BROWSER_ENV_VARS)[number];
type AdminEnvVarName = (typeof SUPABASE_ADMIN_ENV_VARS)[number];
type EnvVarName = BrowserEnvVarName | AdminEnvVarName | "SUPABASE_URL";

type EnvStatus = {
  ok: boolean;
  missingEnv: EnvVarName[];
  errors: string[];
};

const supabaseUrlPattern = /^https:\/\/[a-z0-9-]+\.supabase\.co$/i;

function getMissingEnvVars(requiredEnvVars: readonly EnvVarName[]) {
  return requiredEnvVars.filter((envVar) => !process.env[envVar]);
}

export function validateSupabaseProjectUrl(value: string | undefined, envVarName = "NEXT_PUBLIC_SUPABASE_URL") {
  if (!value) {
    return null;
  }

  const trimmedValue = value.trim();
  let parsedUrl: URL;

  try {
    parsedUrl = new URL(trimmedValue);
  } catch {
    return `${envVarName} 格式錯誤，請確認 Supabase URL 應為 https://PROJECT_REF.supabase.co。`;
  }

  if (
    parsedUrl.protocol !== "https:" ||
    !parsedUrl.hostname.endsWith(".supabase.co") ||
    parsedUrl.pathname !== "/" ||
    parsedUrl.search !== "" ||
    parsedUrl.hash !== "" ||
    !supabaseUrlPattern.test(trimmedValue)
  ) {
    return `${envVarName} 格式錯誤，請確認 Supabase URL 應為 https://PROJECT_REF.supabase.co，不可包含 /rest/v1、/sql、/dashboard 或任何額外 path。`;
  }

  return null;
}

function buildEnvStatus(requiredEnvVars: readonly EnvVarName[], urlEnvVarName: EnvVarName): EnvStatus {
  const missingEnv = getMissingEnvVars(requiredEnvVars);
  const errors = missingEnv.map((envVar) => {
    if (envVar === "NEXT_PUBLIC_SUPABASE_URL" || envVar === "SUPABASE_URL") {
      return `Supabase URL 缺少，請確認 ${envVar}。`;
    }
    if (envVar === "NEXT_PUBLIC_SUPABASE_ANON_KEY") {
      return "Supabase key 缺少，請確認 NEXT_PUBLIC_SUPABASE_ANON_KEY。";
    }
    return "Server key 缺少，請確認 SUPABASE_SERVICE_ROLE_KEY。";
  });

  const urlFormatError = validateSupabaseProjectUrl(process.env[urlEnvVarName], urlEnvVarName);
  if (urlFormatError) {
    errors.push(urlFormatError);
  }

  return {
    ok: errors.length === 0,
    missingEnv,
    errors
  };
}

export function getSupabaseBrowserEnvStatus() {
  return buildEnvStatus(SUPABASE_BROWSER_ENV_VARS, "NEXT_PUBLIC_SUPABASE_URL");
}

export function getSupabaseAdminEnvStatus() {
  return buildEnvStatus(SUPABASE_ADMIN_ENV_VARS, "NEXT_PUBLIC_SUPABASE_URL");
}

export function getLegacySupabaseAdminEnvStatus() {
  return buildEnvStatus(["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"], "SUPABASE_URL");
}
