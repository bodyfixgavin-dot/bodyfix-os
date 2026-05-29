# Phase 2 move plan

> Scope: planning only. This document proposes the next physical repo layout after the repo map is accepted.
>
> This plan does not move files, delete files, change routes, change API paths, or change Netlify/Vercel settings.

## Goal

Move the mixed root repository into clearer project lines while protecting the current production website, intake flows, Vercel APIs, and BodyFix OS app.

The target lines are:

- `website` — public BodyFix marketing/official website.
- `intake` — static client intake and Taipei demand-registration surfaces.
- `os` — Next.js BodyFix OS MVP, booking/admin/dashboard, domain logic, tests, and related tooling.
- `archive` — only files explicitly confirmed as old, unused, or reference-only.

## Proposed target layout

```text
/website
  index.html

/intake
  intake.html
  taipei-zones.html
  taipei-zone-admin.html

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
  .env.local.example
  vercel.json

/archive
  only owner-approved stale/reference files
```

## Website line

Move to `website` after Netlify production settings are confirmed:

- `index.html`

Keep under extra review before moving:

- `intake.html` — it is linked from the website and also belongs to the intake line, so the final location needs a route/redirect decision before the physical move.

Required deployment decisions before moving website files:

1. Confirm whether Netlify currently publishes the repository root.
2. Confirm whether Netlify has a build command or simply serves static files.
3. Decide whether production should become:
   - Netlify publish directory: `website`, with explicit redirects for intake pages; or
   - repo root kept as publish directory until a later cutover.
4. If `index.html` moves to `website/index.html`, update Netlify publish directory in the same release window as the move.
5. Preserve existing public URLs or add redirects before changing links.

## Intake line

Move to `intake` after public URLs and API callers are confirmed:

- `intake.html`
- `taipei-zones.html`
- `taipei-zone-admin.html`

Keep API code in place until Vercel function routing is redesigned:

- `api/taipei-zone-register.js`
- `api/taipei-zone-status.js`
- `api/taipei-zone-summary.js`
- `api/_taipei-zone-options.js`
- `api/_supabase.js`

Possible intake/city files that need owner confirmation before their final line is locked:

- `api/city-dashboard.js`
- `api/city-sessions.js`
- `api/city-waitlist-stats.js`
- `api/public-status.js`
- `api/_auth.js`
- `api/_cors.js`
- `api/_options.js`
- `supabase/city-sessions.sql`
- `supabase/city-sessions-verify.sql`

Required deployment decisions before moving intake files:

1. Confirm whether intake pages are served by Netlify, Vercel static routing, or both.
2. Confirm the production URLs for `intake.html`, `taipei-zones.html`, and `taipei-zone-admin.html`.
3. Decide whether the public route should stay as `/intake.html` or become a cleaner route such as `/intake/`.
4. If static files move to `/intake`, add Netlify redirects/rewrites for old URLs before deploying.
5. Do not move `api/**` in the same step unless Vercel routing is updated and tested.

## OS line

Move to `os` only if the Vercel project is reconfigured to use `os` as the project root or if Vercel routing/build settings are updated in the same PR:

- `app/**`
- `components/**`
- `lib/**`
- `src/bodyfix/**`
- `types/**`
- `tests/**`
- `examples/**`
- `supabase/**`
- `package.json`
- `tsconfig.json`
- `eslint.config.mjs`
- `next-env.d.ts`
- `.env.local.example`
- `vercel.json`
- `README.md`, after deciding whether the root README should remain as a repo-level index or move with the OS app.

Keep under extra review before moving:

- `api/**` — these are Vercel serverless functions used by static intake/city pages. They should not be moved into `os` until static page callers and Vercel function routes are explicitly migrated.
- `supabase/**` — currently contains both OS/booking and city/intake SQL, so split only after owners confirm schema ownership.

Required deployment decisions before moving OS files:

1. Confirm which Vercel project consumes this repo and branch.
2. Confirm whether Vercel can switch its root directory to `os` without breaking `api/**/*.js` serverless functions.
3. If root directory becomes `os`, decide where legacy Vercel functions live and how static intake pages reach them.
4. Update Vercel project settings and/or `vercel.json` together with the file move.
5. Run `npm run typecheck`, `npm run lint`, `npm test`, and `npm run build` from the new `os` directory before merging.

## Archive line

Do not move anything into `archive` yet.

Archive candidates require explicit owner approval first. Current candidates for review, not movement, are:

- `examples/projection-example.ts`
- any city/session API or SQL files that owners confirm are deprecated.

Archive acceptance criteria:

1. Owner confirms the file is old, unused, or reference-only.
2. There is no active production URL, API caller, import, build dependency, or Supabase deployment dependency.
3. The archive move happens in a separate, easy-to-revert commit or PR section.

## Suggested phase 2 sequence

1. **Verify deployment ownership**
   - Confirm Netlify publish directory, build command, and domain mapping.
   - Confirm Vercel project root, framework settings, and API function expectations.

2. **Move lowest-risk static files first**
   - Move `taipei-zones.html` and `taipei-zone-admin.html` only after redirects are ready.
   - Keep API endpoints unchanged.

3. **Move website entry only with Netlify cutover**
   - Move `index.html` to `website/index.html` only when Netlify publish directory can be changed at the same time.

4. **Move OS app only with Vercel root/settings change**
   - Move Next.js app/tooling into `os` only when Vercel can build from that directory.
   - Re-run all checks from inside `os`.

5. **Split shared API/database files last**
   - Separate intake/city API and SQL from OS only after production callers and Supabase ownership are known.

## Netlify configuration plan

Before any move:

- Read current Netlify UI settings for production publish directory, build command, environment variables, branch deploys, and custom domains.
- Add redirects before moving static pages if public URLs must remain stable.

Likely future settings after an approved cutover:

- Public website project:
  - publish directory: `website`
  - build command: none, unless a future static build step is introduced
  - redirects: preserve `/intake.html`, `/taipei-zones.html`, and `/taipei-zone-admin.html` if those URLs remain public
- Intake project, if split from website:
  - publish directory: `intake`
  - build command: none
  - redirects or links must point to the unchanged Vercel API base URL

## Vercel configuration plan

Before any move:

- Confirm current Vercel project root and whether root-level `api/**/*.js` functions are still required.
- Confirm environment variables used by Next.js routes and serverless functions.

Likely future settings after an approved cutover:

- BodyFix OS project:
  - root directory: `os`, if all app/tooling files move there
  - build command: `npm run build`
  - install command: `npm install`
  - framework: Next.js
- Serverless intake/city API:
  - keep at root during the first move, or create an explicit API project before relocating
  - preserve existing endpoint paths until static pages are updated and tested

## Merge safety checklist for the actual move PR

- No production route changes without redirects.
- No API path changes without caller updates.
- No Supabase schema files archived without owner approval.
- Netlify and Vercel settings are changed in the same release window as any physical move that depends on them.
- Rollback plan is documented before merge.
