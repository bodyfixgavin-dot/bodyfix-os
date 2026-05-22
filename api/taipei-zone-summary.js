import { supabase } from './_supabase.js';
import { TAIPEI_ALLOWED_ORIGINS } from './_taipei-zone-options.js';

function applyTaipeiCors(req, res) {
  const origin = req.headers.origin;
  const allowOrigin = origin && TAIPEI_ALLOWED_ORIGINS.includes(origin)
    ? origin
    : TAIPEI_ALLOWED_ORIGINS[0];

  res.setHeader('Access-Control-Allow-Origin', allowOrigin);
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Max-Age', '86400');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return true;
  }

  return false;
}

export default async function handler(req, res) {
  if (applyTaipeiCors(req, res)) return;

  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET, OPTIONS');
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  const { data, error } = await supabase
    .from('taipei_zone_summary')
    .select('*')
    .order('total_count', { ascending: false });

  if (error) {
    return res.status(500).json({ ok: false, error: 'Database error', code: error.code });
  }

  return res.status(200).json({ ok: true, data: data ?? [] });
}
