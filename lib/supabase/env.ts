export const SUPABASE_BROWSER_ENV_VARS = ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"] as const;
export const SUPABASE_LEGACY_BROWSER_KEY = "NEXT_PUBLIC_SUPABASE_ANON_KEY" as const;
export const SUPABASE_ADMIN_ENV_VARS = ["NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"] as const;

type BrowserEnvVarName = (typeof SUPABASE_BROWSER_ENV_VARS)[number] | typeof SUPABASE_LEGACY_BROWSER_KEY;
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

function getBrowserKey() {
  return process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
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

function getEnvError(envVar: EnvVarName) {
  if (envVar === "NEXT_PUBLIC_SUPABASE_URL" || envVar === "SUPABASE_URL") {
    return `missing env: ${envVar}`;
  }
  if (envVar === "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY" || envVar === "NEXT_PUBLIC_SUPABASE_ANON_KEY") {
    return "missing env: NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY";
  }
  return "missing env: SUPABASE_SERVICE_ROLE_KEY";
}

function buildEnvStatus(requiredEnvVars: readonly EnvVarName[], urlEnvVarName: EnvVarName): EnvStatus {
  const missingEnv = getMissingEnvVars(requiredEnvVars);
  const errors = missingEnv.map(getEnvError);

  const urlFormatError = validateSupabaseProjectUrl(process.env[urlEnvVarName], urlEnvVarName);
  if (urlFormatError) {
    errors.push(`invalid url: ${urlFormatError}`);
  }

  return {
    ok: errors.length === 0,
    missingEnv,
    errors
  };
}

export function getSupabaseBrowserEnvStatus() {
  const missingEnv: EnvVarName[] = [];
  const errors: string[] = [];

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    missingEnv.push("NEXT_PUBLIC_SUPABASE_URL");
    errors.push(getEnvError("NEXT_PUBLIC_SUPABASE_URL"));
  }

  if (!getBrowserKey()) {
    missingEnv.push("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "NEXT_PUBLIC_SUPABASE_ANON_KEY");
    errors.push(getEnvError("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"));
  }

  const urlFormatError = validateSupabaseProjectUrl(process.env.NEXT_PUBLIC_SUPABASE_URL, "NEXT_PUBLIC_SUPABASE_URL");
  if (urlFormatError) {
    errors.push(`invalid url: ${urlFormatError}`);
  }

  return {
    ok: errors.length === 0,
    missingEnv,
    errors
  };
}

export function getSupabaseAdminEnvStatus() {
  return buildEnvStatus(SUPABASE_ADMIN_ENV_VARS, "NEXT_PUBLIC_SUPABASE_URL");
}

export function getLegacySupabaseAdminEnvStatus() {
  return buildEnvStatus(["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"], "SUPABASE_URL");
}
