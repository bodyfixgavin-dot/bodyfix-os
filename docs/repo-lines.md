# BodyFix repo lines

> Scope: documentation-only classification. This file is a planning map, not a file move.
>
> Current rule for this first safe cleanup PR: add docs only. Do not move files, delete files, edit production pages, change APIs, or change deployment settings.

## Line definitions

| Line | Meaning | Current status |
| --- | --- | --- |
| `website` | Public BodyFix official website / likely Netlify production surface. | Static root HTML, likely production-sensitive. |
| `intake` | Client Intake / pre-booking questionnaire / customer profile entry and related city-demand forms. | Static forms plus Vercel API helpers. |
| `os` | Next.js / BodyFix OS MVP / dashboard / booking admin / Supabase-backed internal workflows. | Active app code and data model foundation. |
| `archive` | Old versions or files that need confirmation before reuse or movement. | No file should be moved here until owners confirm what is stale. |

## `website`: official website / Netlify production

Current files that appear to belong to `website`:

- `index.html` — public official website entry page.
- `intake.html` — linked from the booking section of `index.html`; also belongs to `intake`, so treat it as shared/production-sensitive until routing is clarified.

Notes:

- If Netlify production publishes the repo root, `index.html` is the safest assumed production entry.
- Do not move `index.html` in the documentation PR.
- Do not change the `index.html` link to `intake.html` until the future physical layout and deploy routes are decided.

## `intake`: Client Intake / questionnaire / customer entry

Current files that appear to belong to `intake`:

- `intake.html` — client intake / booking-intake form.
- `taipei-zones.html` — Taipei service-area demand registration form.
- `taipei-zone-admin.html` — internal summary page for Taipei-zone demand.
- `api/taipei-zone-register.js` — registration API for `taipei-zones.html`.
- `api/taipei-zone-status.js` — public status/options API for Taipei-zone page.
- `api/taipei-zone-summary.js` — summary API for admin view.
- `api/_taipei-zone-options.js` — Taipei-zone option and CORS constants.
- `api/_supabase.js` — shared Supabase client for Vercel serverless APIs.
- `supabase/taipei-zones.sql` — database schema/view/settings for Taipei-zone registration.

Related or possibly shared with city/intake experiments:

- `api/city-dashboard.js`
- `api/city-sessions.js`
- `api/city-waitlist-stats.js`
- `api/public-status.js`
- `api/_auth.js`
- `api/_cors.js`
- `api/_options.js`
- `supabase/city-sessions.sql`
- `supabase/city-sessions-verify.sql`

Notes:

- The `api/**` files are Vercel serverless functions even when static pages are hosted elsewhere.
- Do not change API paths during this first cleanup.

## `os`: Next.js / BodyFix OS MVP / dashboard / Supabase

Current files that appear to belong to `os`:

- `package.json` — scripts and dependencies for the Next.js app.
- `vercel.json` — Vercel config for the Next.js deployment and `api/**/*.js` functions.
- `tsconfig.json`
- `eslint.config.mjs`
- `next-env.d.ts`
- `.env.local.example`
- `app/**` — Next.js App Router pages, admin pages, booking pages, dashboard pages, server actions, and `app/api/**` route handlers.
- `components/**` — reusable React components for OS/dashboard flows.
- `lib/**` — Supabase client helpers, admin session helpers, and booking admin helpers.
- `types/**` — shared TypeScript models.
- `src/bodyfix/**` — BodyFix foundation domain logic: permissions, commission, calculator, config, and types.
- `supabase/booking-v1.sql` — booking schema and secure hold flow.
- `tests/**` — Vitest tests for BodyFix foundation logic.
- `examples/**` — projection example code.
- `README.md` — current repository README describing BodyFix Foundation v0.

Notes:

- `api/**` may remain outside pure `os` because static pages call those endpoints, but Vercel currently has explicit function settings for them.
- Any future `/os` move must update imports, TypeScript paths, Vercel build settings, and possibly project root settings.

## `archive`: old versions or files needing confirmation

Current files that should be considered `archive candidates`, not archived yet:

- none confirmed.

Files that may need owner confirmation before classification:

- `api/city-dashboard.js`
- `api/city-sessions.js`
- `api/city-waitlist-stats.js`
- `api/public-status.js`
- `supabase/city-sessions.sql`
- `supabase/city-sessions-verify.sql`
- `examples/projection-example.ts`

Rule:

- Do not move anything into `/archive` until there is a clear owner decision that the file is old, unused, or only retained for reference.

## Files currently marked “do not touch”

For the first cleanup PR and until the deployment map is approved, do not edit, move, or delete:

- `index.html`
- `intake.html`
- `package.json`
- `vercel.json`
- `api/**`
- `app/api/**`
- `supabase/**`
- any Netlify or Vercel project settings outside the repo

## Proposed target layout for the second PR

Only after this documentation PR is reviewed and merged, consider a second PR that moves files toward:

```text
/website
  index.html

/intake
  intake.html
  taipei-zones.html
  taipei-zone-admin.html
  related static assets if any

/os
  app/
  components/
  lib/
  src/bodyfix/
  types/
  tests/
  examples/
  supabase/
  package.json
  tsconfig.json
  eslint.config.mjs
  next-env.d.ts
  vercel.json

/archive
  only files explicitly confirmed as old or unused
```

Important: this target layout is not yet safe to execute because deployment roots and routes must be confirmed first.

## Recommended next steps

1. Merge this documentation-only PR.
2. Verify Netlify production settings and the exact file/directory being published.
3. Verify Vercel project settings, preview branch behavior, and API routing expectations.
4. Decide whether `intake.html` should live under `website`, `/intake`, or be shared by routing/deploy config.
5. Open a second PR for physical file movement, with deployment config changes and smoke tests included in that same PR.
