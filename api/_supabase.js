import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim();
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseUrlPattern = /^https:\/\/[a-z0-9-]+\.supabase\.co$/i;

function getSupabaseUrlError(value) {
  if (!value) {
    return 'Supabase URL 缺少，請確認 SUPABASE_URL 或 NEXT_PUBLIC_SUPABASE_URL。';
  }

  try {
    const parsedUrl = new URL(value);
    if (
      parsedUrl.protocol !== 'https:' ||
      !parsedUrl.hostname.endsWith('.supabase.co') ||
      parsedUrl.pathname !== '/' ||
      parsedUrl.search !== '' ||
      parsedUrl.hash !== '' ||
      !supabaseUrlPattern.test(value)
    ) {
      return 'Supabase URL 格式錯誤，請確認 Supabase URL 應為 https://PROJECT_REF.supabase.co，不可包含 /rest/v1、/sql、/dashboard 或任何額外 path。';
    }
  } catch {
    return 'Supabase URL 格式錯誤，請確認 Supabase URL 應為 https://PROJECT_REF.supabase.co。';
  }

  return null;
}

const supabaseUrlError = getSupabaseUrlError(supabaseUrl);
if (supabaseUrlError) {
  throw new Error(supabaseUrlError);
}

if (!supabaseServiceRoleKey) {
  throw new Error('Server key 缺少，請確認 SUPABASE_SERVICE_ROLE_KEY。');
}

export const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false
  }
});
