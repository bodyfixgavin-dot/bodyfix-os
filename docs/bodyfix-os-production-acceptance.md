# BodyFix OS production acceptance

Production URL: `https://bodyfix-os.vercel.app`

Do not rename or replace the production URL while following this checklist.

## 1. Confirm Vercel environment variables

In the Vercel project, confirm these variables are assigned to **Production** and redeploy after any change:

| Variable | Required for | Expected form |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | All Supabase flows | `https://PROJECT_REF.supabase.co` only; no `/rest/v1`, dashboard URL, query, or trailing path |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public booking / waitlist flows | Supabase anon/publishable key |
| `SUPABASE_SERVICE_ROLE_KEY` | BodyFix OS admin APIs | Supabase service-role secret; server-side only |
| `ADMIN_PASSWORD` | Production admin login | Non-empty private password |
| `ADMIN_SESSION_SECRET` | Signed admin session cookie | Long random private value independent from the password |

`ALLOW_ADMIN_BYPASS` must not be `true` in Production.

If an API reports `fetch failed`, first re-copy the project URL and service-role key from the same Supabase project, verify that the Supabase project is active, then redeploy Production. The admin API response now identifies the failed request and returns an environment/schema troubleshooting next step.

## 2. Apply and verify SQL

Run these files in the Supabase SQL Editor in order. The migration files are idempotent; verification files are read-only unless their header explicitly says otherwise.

1. `supabase/clinic-v1.sql`
2. `supabase/clinic-v1-verify.sql`
3. `supabase/codebook-v0.2.1.sql`
4. `supabase/codebook-v0.2.1-verify.sql`
5. `supabase/waitlist.sql`
6. `supabase/waitlist-verify.sql`

Expected Codebook result: `codebook_categories` and `codebook_items` exist and contain the v0.2.1 seed data.

Expected Waitlist result: `waitlist_table_exists`, `row_level_security_enabled`, and `anon_can_insert` are `true`; the `Anyone can insert waitlist` policy is present.

## 3. Acceptance paths

1. Open `/admin`, sign in, and confirm the database status is ready.
2. Open `/clinic/dashboard`; it must redirect to `/clinic` and load the dashboard without a Supabase error.
3. Open `/clinic/followups`; it must load the follow-up dashboard.
4. Open `/clinic/codebook`; it must show Codebook categories and items.
5. If a page fails, inspect its `/api/clinic/...` request in browser developer tools. The JSON response includes `failedRequest`, `errorReason`, `missingEnv`, and `nextStep` without exposing secret values.
