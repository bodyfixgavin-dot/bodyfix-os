import { supabase } from './_supabase.js';
import { applyCors, methodNotAllowed } from './_cors.js';
import { requireAdmin } from './_auth.js';
import { asCleanText, asInteger } from './_options.js';

const STATUSES = ['coming_soon', 'registration_open', 'session_open'];
const LOCATION_TYPES = ['tbd', 'studio', 'hotel', 'hybrid'];

function cleanDate(value) {
  const text = asCleanText(value, 20);
  if (!text) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) return null;
  return text;
}

function buildPayload(body) {
  const status = asCleanText(body.status, 40) ?? 'coming_soon';
  const locationType = asCleanText(body.location_type, 40) ?? 'tbd';

  if (!STATUSES.includes(status)) {
    return { error: 'Invalid status' };
  }

  if (!LOCATION_TYPES.includes(locationType)) {
    return { error: 'Invalid location type' };
  }

  const payload = {
    city: asCleanText(body.city, 40),
    status,
    session_title: asCleanText(body.session_title, 160),
    planned_start_date: cleanDate(body.planned_start_date),
    planned_end_date: cleanDate(body.planned_end_date),
    decision_deadline: cleanDate(body.decision_deadline),
    location_type: locationType,
    district: asCleanText(body.district, 80),
    venue_name: asCleanText(body.venue_name, 160),
    venue_notes: asCleanText(body.venue_notes, 1000),
    max_slots: asInteger(body.max_slots, 0),
    booked_slots: asInteger(body.booked_slots, 0),
    deposit_required: status === 'session_open' ? Boolean(body.deposit_required) : false,
    deposit_amount: status === 'session_open' ? asInteger(body.deposit_amount, 0) : null,
    deposit_due_date: status === 'session_open' ? cleanDate(body.deposit_due_date) : null,
    estimated_revenue: asInteger(body.estimated_revenue, 0),
    transport_cost: asInteger(body.transport_cost, 0),
    lodging_cost: asInteger(body.lodging_cost, 0),
    workspace_cost: asInteger(body.workspace_cost, 0),
    food_misc_cost: asInteger(body.food_misc_cost, 0),
    time_cost: asInteger(body.time_cost, 0),
    notes: asCleanText(body.notes, 1500)
  };

  if (!payload.city) return { error: 'city is required' };
  if (payload.planned_start_date && payload.planned_end_date && payload.planned_end_date < payload.planned_start_date) {
    return { error: 'planned_end_date cannot be earlier than planned_start_date' };
  }

  return { payload };
}

export default async function handler(req, res) {
  if (applyCors(req, res)) return;

  if (!['GET', 'POST', 'PATCH'].includes(req.method)) {
    return methodNotAllowed(res, ['GET', 'POST', 'PATCH']);
  }

  if (!requireAdmin(req, res)) return;

  if (req.method === 'GET') {
    const city = asCleanText(req.query.city, 40);
    let query = supabase
      .from('city_session_profit_view')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200);

    if (city) query = query.eq('city', city);

    const { data, error } = await query;
    if (error) {
      console.error('[city-sessions] list failed', error);
      return res.status(500).json({ ok: false, error: 'Database error', code: error.code });
    }

    return res.status(200).json({ ok: true, rows: data ?? [] });
  }

  let body;
  try {
    body = req.body ?? {};
  } catch {
    return res.status(400).json({ ok: false, error: 'Invalid JSON' });
  }

  const { payload, error: payloadError } = buildPayload(body);
  if (payloadError) {
    return res.status(400).json({ ok: false, error: payloadError });
  }

  if (req.method === 'POST') {
    const { data, error } = await supabase
      .from('city_sessions')
      .insert(payload)
      .select('*')
      .single();

    if (error) {
      console.error('[city-sessions] insert failed', error);
      return res.status(500).json({ ok: false, error: 'Database error', code: error.code });
    }

    return res.status(201).json({ ok: true, row: data });
  }

  if (req.method === 'PATCH') {
    const id = asCleanText(req.query.id, 80);
    if (!id) return res.status(400).json({ ok: false, error: 'id query param is required' });

    const { data, error } = await supabase
      .from('city_sessions')
      .update(payload)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      console.error('[city-sessions] update failed', error);
      return res.status(500).json({ ok: false, error: 'Database error', code: error.code });
    }

    return res.status(200).json({ ok: true, row: data });
  }
}
