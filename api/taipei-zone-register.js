import { supabase } from './_supabase.js';
import {
  TAIPEI_ALLOWED_ORIGINS,
  TAIPEI_ZONE_OPTIONS,
  cleanText,
  cleanMultiSelect,
  isAllowed
} from './_taipei-zone-options.js';

function applyTaipeiCors(req, res) {
  const origin = req.headers.origin;
  const allowOrigin = origin && TAIPEI_ALLOWED_ORIGINS.includes(origin)
    ? origin
    : TAIPEI_ALLOWED_ORIGINS[0];

  res.setHeader('Access-Control-Allow-Origin', allowOrigin);
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
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

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST, OPTIONS');
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  const body = req.body ?? {};
  const payload = {
    preferred_zone: cleanText(body.preferred_zone, 50),
    liuzhangli_distance_feeling: cleanText(body.liuzhangli_distance_feeling, 60),
    main_need: cleanText(body.main_need, 60),
    session_length_preference: cleanText(body.session_length_preference, 60),
    service_mode: cleanText(body.service_mode, 40),
    preferred_time: cleanMultiSelect(body.preferred_time, TAIPEI_ZONE_OPTIONS.preferred_time),
    is_existing_client: cleanText(body.is_existing_client, 20) ?? 'unknown',
    contact_type: cleanText(body.contact_type, 20),
    contact_value: cleanText(body.contact_value, 200),
    note: cleanText(body.note, 1200)
  };

  const required = [
    'preferred_zone',
    'liuzhangli_distance_feeling',
    'main_need',
    'session_length_preference',
    'service_mode',
    'contact_type',
    'contact_value'
  ];

  const missing = required.some((field) => !payload[field]);
  if (missing) {
    return res.status(400).json({ ok: false, error: 'Missing required fields' });
  }

  if (
    !isAllowed(payload.preferred_zone, TAIPEI_ZONE_OPTIONS.preferred_zone)
    || !isAllowed(payload.liuzhangli_distance_feeling, TAIPEI_ZONE_OPTIONS.liuzhangli_distance_feeling)
    || !isAllowed(payload.main_need, TAIPEI_ZONE_OPTIONS.main_need)
    || !isAllowed(payload.session_length_preference, TAIPEI_ZONE_OPTIONS.session_length_preference)
    || !isAllowed(payload.service_mode, TAIPEI_ZONE_OPTIONS.service_mode)
    || !isAllowed(payload.is_existing_client, TAIPEI_ZONE_OPTIONS.is_existing_client)
    || !isAllowed(payload.contact_type, TAIPEI_ZONE_OPTIONS.contact_type)
  ) {
    return res.status(400).json({ ok: false, error: 'Invalid field value' });
  }

  const { data, error } = await supabase
    .from('taipei_zone_registrations')
    .insert(payload)
    .select('id')
    .single();

  if (error) {
    return res.status(500).json({ ok: false, error: 'Database error', code: error.code });
  }

  return res.status(201).json({
    ok: true,
    message: '已收到你的台北據點需求登記',
    id: data.id
  });
}
