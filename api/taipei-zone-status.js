import { supabase } from './_supabase.js';
import { TAIPEI_ALLOWED_ORIGINS, TAIPEI_ZONE_OPTIONS } from './_taipei-zone-options.js';

function applyTaipeiCors(req, res) {
  const origin = req.headers.origin;
  const allowOrigin = origin && TAIPEI_ALLOWED_ORIGINS.includes(origin)
    ? origin
    : TAIPEI_ALLOWED_ORIGINS[0];

  res.setHeader('Access-Control-Allow-Origin', allowOrigin);
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
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
    .from('taipei_zone_settings')
    .select('value')
    .eq('key', 'public_status')
    .single();

  if (error) {
    return res.status(500).json({ ok: false, error: 'Database error', code: error.code });
  }

  return res.status(200).json({
    ok: true,
    status: data?.value ?? 'coming_soon',
    labels: {
      coming_soon: '登記頁建置中',
      registration_open: '開放台北據點需求登記',
      closed: '目前暫停登記'
    },
    allowed_statuses: TAIPEI_ZONE_OPTIONS.public_status
  });
}
