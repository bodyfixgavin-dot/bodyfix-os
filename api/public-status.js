import { supabase } from './_supabase.js';
import { applyCors, methodNotAllowed } from './_cors.js';
import { requireAdmin } from './_auth.js';
import { PUBLIC_STATUSES, asCleanText } from './_options.js';

export default async function handler(req, res) {
  if (applyCors(req, res)) return;

  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('city_settings')
      .select('value')
      .eq('key', 'public_status')
      .single();

    if (error) {
      console.error('[public-status] read failed', error);
      return res.status(500).json({ ok: false, error: 'Database error', code: error.code });
    }

    return res.status(200).json({
      ok: true,
      status: data?.value ?? 'coming_soon',
      labels: {
        coming_soon: '登記頁建置中',
        registration_open: '正式開放城市需求登記',
        session_open: '正式場次開放預約與訂金保留'
      }
    });
  }

  if (req.method === 'PATCH') {
    if (!requireAdmin(req, res)) return;

    let body;
    try {
      body = req.body ?? {};
    } catch {
      return res.status(400).json({ ok: false, error: 'Invalid JSON' });
    }

    const status = asCleanText(body.status, 40);
    if (!status || !PUBLIC_STATUSES.includes(status)) {
      return res.status(400).json({ ok: false, error: 'Invalid public status' });
    }

    const { data, error } = await supabase
      .from('city_settings')
      .update({ value: status, updated_at: new Date().toISOString() })
      .eq('key', 'public_status')
      .select('key, value, updated_at')
      .single();

    if (error) {
      console.error('[public-status] update failed', error);
      return res.status(500).json({ ok: false, error: 'Database error', code: error.code });
    }

    return res.status(200).json({ ok: true, setting: data });
  }

  return methodNotAllowed(res, ['GET', 'PATCH']);
}
