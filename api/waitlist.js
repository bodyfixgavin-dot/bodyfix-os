import { createClient } from '@supabase/supabase-js';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ALLOWED_INTERESTS = new Set(['body-reset', 'movement', 'ziwei-tarot', 'city-tour']);

function cleanText(value, maxLength) {
  if (typeof value !== 'string') return null;
  const cleaned = value.trim();
  return cleaned ? cleaned.slice(0, maxLength) : null;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  const name = cleanText(req.body?.name, 100);
  const email = cleanText(req.body?.email, 254)?.toLowerCase();
  const interest = cleanText(req.body?.interest, 60);

  if (!name || !email || !EMAIL_PATTERN.test(email) || !interest || !ALLOWED_INTERESTS.has(interest)) {
    return res.status(400).json({ ok: false, error: 'Invalid waitlist submission' });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('[waitlist] Supabase environment variables are missing');
    return res.status(500).json({ ok: false, error: 'Service unavailable' });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false
      }
    });

    const { error } = await supabase.from('waitlist').insert({
      name,
      email,
      interest,
      source: 'chart-navigator'
    });

    if (error) {
      console.error('[waitlist] insert failed', error.code);
      return res.status(500).json({ ok: false, error: 'Database error' });
    }

    return res.status(201).json({ ok: true });
  } catch (error) {
    console.error('[waitlist] request failed', error instanceof Error ? error.message : 'Unknown error');
    return res.status(500).json({ ok: false, error: 'Service unavailable' });
  }
}
