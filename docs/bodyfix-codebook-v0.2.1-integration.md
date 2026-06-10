# BodyFix Codebook v0.2.1 integration guide

## Scope

Codebook v0.2.1 is a read-only reference layer. It creates and seeds only:

- `public.codebook_categories`
- `public.codebook_items`

It does **not** alter or rebuild `clients`, `service_records`, `followup_tasks`, or `package_candidates`. It also does not change the follow-up dashboard, shared clinic shell, global stylesheet, or city-registration features.

## Deploy and verify

1. Run `supabase/codebook-v0.2.1.sql` in the Supabase SQL editor.
2. Run `supabase/codebook-v0.2.1-verify.sql`.
3. Confirm that verification reports all 17 required categories and approximately 208 seeded items.

The migration is rerunnable. Category and item seeds use `insert ... on conflict do nothing`; item `code` values are globally unique.

## Data contract

The required category keys are:

`SERVICE`, `PACKAGE`, `PASS`, `FOLLOWUP_TASK`, `PRIORITY`, `TASK_STATUS`, `QUICK_FILTER`, `TENSION`, `BODY_REGION`, `FASCIA_LINE`, `LOCATION`, `SOURCE`, `PAYMENT`, `CLIENT_STATUS`, `ATTENDANCE_STATUS`, `CORE_TYPE`, and `CHART_NAVIGATOR`.

All Chart Navigator items have `is_coming_soon = true`. Jyotish Sanskrit and transliteration values live in `metadata`; `name_en` is intentionally left empty for those entries.

## API

`GET /api/clinic/codebook` requires the existing clinic-admin session and returns:

```json
{
  "categories": [],
  "items": []
}
```

Optional query parameters:

- `category_key=SERVICE` or comma-separated category keys
- `group_key=pelvic_core`
- `quick_filter_code=QF-SIT`
- `active_only=true`

Responses are marked `private, no-store`. The API is read-only and always queries `codebook_items`, never `codebook_entries`.

## Clinic page

`/clinic/codebook` is protected by the existing admin-session cookie. The dashboard loads the API, summarizes category/item state, and filters items by category. Its presentation is isolated in `app/clinic/codebook/codebook.module.css` so Codebook does not require changes to `app/globals.css` or `components/clinic/ClinicShell.tsx`.

## Future integration boundary

Future CRM integrations may store Codebook codes in separate migrations, but v0.2.1 deliberately does not add columns or foreign keys to protected CRM tables. Deprecated codes should be retained and marked with `is_deprecated = true` rather than deleted.
