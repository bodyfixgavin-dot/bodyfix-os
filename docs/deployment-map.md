# BodyFix deployment map

> Scope: documentation-only snapshot. Do not treat this file as a deploy change.
>
> This map is based on the files currently present in the repo root. It intentionally does not move files, change production, change preview, add APIs, or alter any existing behavior.

## Quick summary

| Surface | Current deployment signal | Files that appear relevant | Purpose | Risk note |
| --- | --- | --- | --- | --- |
| Netlify production website | No `netlify.toml`, `_redirects`, or `_headers` file is currently present in the repo. The root `index.html` is the likely static entry if Netlify is pointed at the repo root. | `index.html`, `intake.html` | Public BodyFix website and the booking-intake link from the website. | Do not edit or move these files until the Netlify publish directory and deploy settings are confirmed in Netlify. |
| Netlify intake / city static pages | API CORS allowlists mention Netlify domains (`bodyfix-tw.netlify.app`, `bodyfix-tw-intake.netlify.app`), but there is no Netlify config in this repo to prove the exact publish target. | `intake.html`, `taipei-zones.html`, `taipei-zone-admin.html` | Standalone intake and Taipei-zone registration/admin pages. | Treat as production-adjacent because static pages call live `/api/*` endpoints. |
| Vercel preview / Next.js app | `vercel.json` declares the Next.js framework and runs `npm run build`. | `vercel.json`, `package.json`, `app/**`, `components/**`, `lib/**`, `types/**`, `src/bodyfix/**`, `supabase/**`, `tests/**`, `examples/**`, `api/**` | BodyFix OS MVP, dashboard, booking/admin routes, Supabase-backed workflows, and Vercel serverless APIs. | Do not change Vercel settings or API routes in the first cleanup PR. |
| GitHub `main` | The repository currently contains static website files, static intake/city pages, Next.js app files, Vercel API files, Supabase SQL, tests, and foundation logic side by side. | Entire repo | Source of truth for all current lines until a later physical reorganization PR. | This PR should only document boundaries; file moves belong in a separate PR after review. |

## Netlify production: likely static website line

The likely public website entry is:

- `index.html` — root static BodyFix website page. It contains the public booking section and links to `intake.html`.
- `intake.html` — standalone booking-intake/client-intake page linked from `index.html`.

Current uncertainty:

- There is no repo-level Netlify config file currently visible, so the exact Netlify publish directory and build command must be verified in the Netlify UI before moving anything.
- If Netlify is publishing the repo root as a static site, moving `index.html` or `intake.html` would break production unless Netlify settings are changed in the same later PR.

## Netlify intake / static registration pages

The following root HTML files appear to be standalone public or internal static pages:

- `intake.html` — client intake / pre-booking form / customer profile intake.
- `taipei-zones.html` — Taipei service-area demand registration page; posts to `/api/taipei-zone-register`.
- `taipei-zone-admin.html` — internal Taipei demand summary page; reads from `/api/taipei-zone-summary`.

Related Vercel API endpoints used by these pages include:

- `api/taipei-zone-register.js`
- `api/taipei-zone-status.js`
- `api/taipei-zone-summary.js`
- shared helpers such as `api/_taipei-zone-options.js` and `api/_supabase.js`

Current uncertainty:

- The static pages may be hosted by Netlify while calling Vercel `/api/*` routes, or they may also be previewed on Vercel. Confirm production URLs before changing paths.

## Vercel preview: likely BodyFix OS line

Vercel is the most explicit deployment target in the repo because `vercel.json` exists and declares:

- framework: `nextjs`
- build command: `npm run build`
- install command: `npm install`
- serverless function settings for `api/**/*.js`

Files likely consumed by the Vercel preview / BodyFix OS MVP:

- `package.json` — Next.js scripts and dependencies.
- `vercel.json` — Vercel deployment configuration.
- `app/**` — App Router pages and API routes:
  - `app/page.tsx` — BodyFix OS MVP landing page.
  - `app/dashboard/**` — dashboard pages.
  - `app/booking/page.tsx` — booking page.
  - `app/admin/page.tsx` — booking admin page.
  - `app/api/**` — Next.js API route handlers for booking/admin workflows.
- `components/**` — reusable OS/dashboard components.
- `lib/**` — Supabase clients, admin session helpers, and booking admin helpers.
- `types/**` — booking and BodyFix TypeScript types.
- `src/bodyfix/**` — BodyFix foundation domain logic.
- `supabase/**` — SQL schemas and verification scripts for OS/booking/city features.
- `tests/**` — Vitest tests for foundation logic.
- `examples/**` — example projection script.
- `api/**` — Vercel serverless functions used by static city/intake pages and city dashboard flows.

## GitHub `main`: mixed source layout

`main` currently mixes multiple project lines at the repo root:

- Static website files: `index.html` and related direct links.
- Static intake/city pages: `intake.html`, `taipei-zones.html`, `taipei-zone-admin.html`.
- Next.js BodyFix OS app: `app/**`, `components/**`, `lib/**`, `types/**`, `src/bodyfix/**`.
- Serverless/API code: `api/**` plus Next.js `app/api/**`.
- Database setup: `supabase/**`.
- Tooling: `package.json`, `tsconfig.json`, `eslint.config.mjs`, `next-env.d.ts`, `.env.local.example`.

Because these lines are currently mixed, the safest path is to first document the map, then move files only after the deployment owners and settings are confirmed.

## Files not to touch before the second PR

Do not edit, move, or delete these until the second cleanup PR has an approved migration plan:

- `index.html`
- `intake.html`
- `package.json`
- `vercel.json`
- all files under `api/**`
- all files under `app/api/**`
- Netlify/Vercel deployment settings outside the repo UI
- Supabase SQL files that back live data flows

## Suggested next step

After this documentation PR is reviewed and merged:

1. Confirm Netlify production publish directory, build command, and domain mapping in Netlify.
2. Confirm which Vercel project/preview branch consumes this repo and whether root static HTML is expected there.
3. Decide the target physical layout, likely:
   - `/website` for the public website.
   - `/intake` for client intake and static registration pages.
   - `/os` for the Next.js BodyFix OS MVP.
   - `/archive` for old or unconfirmed files.
4. Create a second PR that only moves files according to the approved map and updates deployment configuration in the same PR if needed.
