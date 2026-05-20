import { supabase } from './_supabase.js';
import { applyCors, methodNotAllowed } from './_cors.js';
import { requireAdmin } from './_auth.js';

export default async function handler(req, res) {
  if (applyCors(req, res)) return;

  if (req.method !== 'GET') {
    return methodNotAllowed(res, ['GET']);
  }

  if (!requireAdmin(req, res)) return;

  const { data, error } = await supabase
    .from('city_waitlist_summary')
    .select('*')
    .order('priority_rank', { ascending: true })
    .order('registration_count', { ascending: false });

  if (error) {
    console.error('[city-waitlist-stats] read failed', error);
    return res.status(500).json({ ok: false, error: 'Database error', code: error.code });
  }

  return res.status(200).json({ ok: true, rows: data ?? [] });
}
