export const PUBLIC_STATUSES = ['coming_soon', 'registration_open', 'session_open'];

export const ALLOWED_CITIES = ['台中', '高雄', '台南', '新竹', '桃園', '其他'];

export const SERVICE_OPTIONS = [
  'fascia_chain_60',
  'targeted_fascia_60',
  'multi_fascia_90',
  'pelvic_core_60',
  'pelvic_core_addon_30',
  'ziwei_60',
  'tarot_addon_15',
  'tarot_addon_30',
  'grooming_interest'
];

export const TIME_BLOCK_OPTIONS = [
  'weekday_day',
  'weekday_evening',
  'weekend_day',
  'weekend_evening',
  'flexible'
];

export const SERVICE_PRICE_MAP = {
  fascia_chain_60: 2200,
  targeted_fascia_60: 2300,
  multi_fascia_90: 3600,
  pelvic_core_60: 2500,
  pelvic_core_addon_30: 1200,
  ziwei_60: 3600,
  tarot_addon_15: 333,
  tarot_addon_30: 666,
  grooming_interest: 0
};

export function normalizeArray(value) {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item) => typeof item === 'string')
    .map((item) => item.trim())
    .filter(Boolean);
}

export function filterAllowed(values, allowed) {
  return normalizeArray(values).filter((item) => allowed.includes(item));
}

export function estimateRevenueFromServices(serviceInterests = []) {
  const services = normalizeArray(serviceInterests);
  if (services.length === 0) return 0;
  return services.reduce((sum, service) => sum + (SERVICE_PRICE_MAP[service] ?? 0), 0);
}

export function asCleanText(value, max = 500) {
  if (typeof value !== 'string') return null;
  const cleaned = value.trim();
  if (!cleaned) return null;
  return cleaned.slice(0, max);
}

export function asInteger(value, fallback = 0) {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed < 0) return fallback;
  return parsed;
}
