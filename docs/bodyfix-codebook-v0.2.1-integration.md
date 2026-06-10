# BodyFix Codebook Reference Tables v0.2.1

## Scope

This release adds only the `public.codebook_categories` and `public.codebook_items` reference tables, their indexes, RLS policies, and seed data. The migration is a file-only deliverable and must be reviewed and applied manually to a development branch before any production rollout.

If the repository's earlier v0.2 `codebook_categories` shape already exists, the migration preserves it as `codebook_categories_v02_legacy` before creating the v0.2.1 table. It does not delete old codebook data.

## Migration contents

- 17 categories and 208 globally unique codebook items.
- Idempotent category seeds using `on conflict (category_key) do nothing`.
- Idempotent item seeds using `on conflict (code) do nothing`.
- Indexes for category, code, group, parent, quick filter, and active-state lookups.
- RLS that lets `anon` read active rows and `authenticated` read all rows. Writes remain server-side/service-role only.
- Chart Navigator items marked `is_coming_soon = true`.
- Duplicate tension classifications represented once, with secondary quick filters in `metadata.alternative_quick_filters`.

## Deferred v0.3 integration plan

This release intentionally does **not** alter `service_records` or `followup_tasks`. A future migration may add nullable text columns without foreign keys:

- `service_records.service_code`
- `service_records.package_code`
- `followup_tasks.task_code`
- `followup_tasks.priority_code`

The codebook remains loosely coupled through text codes. Existing and legacy codes should be retired with `is_deprecated = true`, not deleted. Existing follow-up data and the `/clinic/followups` workflow must remain unchanged until the v0.3 migration is separately reviewed.

## Manual dev verification

1. Apply `supabase/codebook-v0.2.1.sql` to a development branch only.
2. Apply it a second time to confirm idempotency.
3. Run the read-only checks in `supabase/codebook-v0.2.1-verify.sql`.
4. Verify `/api/clinic/codebook` and `/clinic/codebook` while logged in as an admin.
5. Verify `/clinic/followups` and existing city-registration flows before promoting the migration.
