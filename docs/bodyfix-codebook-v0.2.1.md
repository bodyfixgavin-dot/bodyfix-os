# BodyFix Codebook Reference Tables v0.2.1

## Deployment

Run `supabase/codebook-v0.2.1.sql` in the Supabase SQL Editor, then run `supabase/codebook-v0.2.1-verify.sql`. The seed is rerunnable: categories use `on conflict (category_key) do nothing` and items use the globally unique `code` with `on conflict (code) do nothing`.

The migration creates only `public.codebook_categories` and `public.codebook_items`. It does not alter `service_records` or `followup_tasks`, rebuild `clients`, delete existing data, or update existing follow-up tasks. If the earlier repository v0.2 `codebook_categories` shape is present, it is preserved as `codebook_categories_v02_legacy` before the new reference table is created.

## Access model

- Anonymous Supabase clients can select active categories and active items only.
- Authenticated Supabase clients can select all categories and items.
- Table writes are not granted to anonymous or authenticated roles. Server-side clinic admin requests use the service-role-backed admin client; the service-role key remains server-only.
- `/api/clinic/codebook` is protected by the existing clinic-admin session and returns `{ categories, items }`.

Supported API filters:

```text
GET /api/clinic/codebook
GET /api/clinic/codebook?category_key=SERVICE
GET /api/clinic/codebook?category_key=PRIORITY,FOLLOWUP_TASK&active_only=true
GET /api/clinic/codebook?group_key=pelvic_core
GET /api/clinic/codebook?quick_filter_code=QF-SIT
GET /api/clinic/codebook/SERVICE?active_only=true
```

## v0.3 integration plan (documentation only)

A future migration may add nullable text columns `service_records.service_code`, `service_records.package_code`, `followup_tasks.task_code`, and `followup_tasks.priority_code`. These columns should initially remain nullable and should not receive foreign keys so existing records remain loosely coupled and safe to migrate gradually. Retired codes should be marked with `is_deprecated = true` rather than deleted.

No part of that v0.3 integration plan is executed by v0.2.1.
