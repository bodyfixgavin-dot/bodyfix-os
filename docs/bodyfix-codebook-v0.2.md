# BodyFix Codebook v0.2 deployment notes

`supabase/codebook-v0.2.sql` is the central internal-code reference migration. Run it **after** `supabase/booking-v1.sql` and `supabase/clinic-v1.sql`, because it extends `clients` and `service_records`.

## Data model

- `codebook_categories` defines selector groups such as `service`, `package`, `quick_filter`, `tension`, `region`, and `fascia_line`.
- `codebook_entries` is the single source of truth for all codes. `metadata` stores category-specific values such as duration, session count, task type, or location type.
- Tension patterns use `parent_category_code = quick_filter` and `parent_code = QF-*`, allowing the admin to render the required two-level Quick Filter selector.
- Compatibility views (`service_codes`, `package_codes`, `tension_codes`, `location_codes`, `region_codes`, and `fascia_line_codes`) provide explicit table-like names without duplicating reference data.
- `client_code_seq` and the `clients_assign_client_code` trigger assign new clients sequential codes such as `C935`; existing non-empty client codes are preserved.

## Admin API

Authenticated clinic-admin consumers can read active entries from:

```text
GET /api/clinic/codebook
GET /api/clinic/codebook?categories=service,region,fascia_line
GET /api/clinic/codebook?categories=quick_filter,tension
GET /api/clinic/codebook?categories=package&include_inactive=true
```

The response includes both a flat `entries` array and `by_category` groups. Active entries are returned by default; `include_inactive=true` additionally returns `coming_soon`, `legacy`, and `archived` entries.

## Verification

After applying the migration, run `supabase/codebook-v0.2-verify.sql` in the Supabase SQL Editor. The final insert is wrapped in a transaction and rolled back; it confirms that the database trigger can allocate the next `C` client code without leaving test data behind.
