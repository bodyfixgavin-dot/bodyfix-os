export const TAIPEI_ALLOWED_ORIGINS = [
  'https://bodyfix-tw-intake.netlify.app',
  'https://bodyfix-clinic.vercel.app',
  'http://localhost:3000',
  'http://localhost:5173'
];

export const TAIPEI_ZONE_OPTIONS = {
  preferred_zone: ['ximen', 'liuzhangli', 'sun_yat_sen_memorial_hall', 'home_visit', 'other'],
  liuzhangli_distance_feeling: ['convenient', 'acceptable', 'a_bit_far', 'too_far_affects_booking'],
  main_need: [
    'neck_shoulder_chest',
    'lower_back_pelvis',
    'hip_legs',
    'training_recovery',
    'movement_training',
    'twelve_session_plan',
    'ziwei_tarot',
    'other'
  ],
  session_length_preference: ['sixty_main', 'sixty_plus_30_if_needed', 'consult_first'],
  service_mode: ['studio', 'home_visit', 'flexible', 'consult_first'],
  preferred_time: ['weekday_afternoon', 'weekday_evening', 'weekend_daytime', 'weekend_evening', 'flexible'],
  is_existing_client: ['yes', 'no', 'unknown'],
  contact_type: ['line', 'instagram', 'phone', 'other'],
  public_status: ['coming_soon', 'registration_open', 'closed']
};

export function cleanText(value, max = 500) {
  if (typeof value !== 'string') return null;
  const text = value.trim();
  if (!text) return null;
  return text.slice(0, max);
}

export function cleanMultiSelect(value, allowed) {
  if (!Array.isArray(value)) return [];
  return value.filter((item) => typeof item === 'string' && allowed.includes(item));
}

export function isAllowed(value, allowed) {
  return typeof value === 'string' && allowed.includes(value);
}
