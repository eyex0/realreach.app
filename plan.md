# RealReach — Supabase backend foundation

## Inspection result and current boundary

At inspection, the existing project had the nine English public pages, three dashboard interfaces, reusable design components, and local-only form previews. It did not have Supabase SDK code, a migration, project URL, or publishable key. The Webdev-managed server/database remain disabled. The Supabase connector was not enabled after its authorization prompt was declined; this implementation will not retry that request or connect to an external project.

The repository now contains Supabase Auth and query integration code plus a versioned SQL migration. **There is still no live Supabase project configuration; the migration has not been applied or tested against a project.** The UI must remain explicit about this and must not claim that authentication or RLS is operational.

## Implementation approach

1. **Relational schema:** Provide a one-time versioned Supabase migration for `profiles`, `user_roles`, `customers`, `distributors`, `campaigns`, `orders`, `distribution_jobs`, `delivery_evidence`, and `campaign_reports`, with foreign keys, status checks, constraints, timestamps, indexes, and an Auth-user trigger. Public registration can request only Customer or Distributor; the trigger clamps every other metadata value to Customer. The migration inserts no business data.
2. **Database authorization:** Enable RLS on all nine application tables. Use private-schema, fixed-empty-`search_path` helper functions for role and relationship checks. Customers see their own records; distributors see their assigned jobs and authorized related campaign/order/evidence rows; admin policies check the protected `user_roles` table. No authenticated user can write their own role. The first administrator is bootstrapped only by the trusted project owner in the Supabase SQL Editor.
3. **Browser client and Auth:** Load `@supabase/supabase-js` only from the public Supabase URL and publishable/legacy anon key. Persist and restore sessions; implement email/password registration, login, logout, and profile/role verification. Never place a service-role/secret key in the client or request one.
4. **Protected routes and data states:** Keep the existing nine public pages and visual styles. Gate every role workspace on session and exact stored role; redirect signed-out users to sign-in and block mismatched role paths. Dashboard counts/lists read through RLS and render loading, error, and honest empty states. Profile name/phone changes update only the signed-in user’s own profile.
5. **Unimplemented workflows:** Campaign submission, job-status mutation, evidence upload/review, payments, and GPS tracking remain unconnected. Their existing local-preview UI stays clearly labelled and is not represented as a backend feature.
6. **Verification:** Run TypeScript, production build, route-manifest, and migration-coverage checks. Live Auth/RLS testing remains pending until a user-owned Supabase project is configured, the migration is applied, and role-specific tests are performed.

## Project structure

- `src/lib/database.types.ts` — application role and table row types.
- `src/lib/supabase.ts` — browser-safe configuration detection and lazy Supabase client.
- `src/auth/AuthProvider.tsx` — session restoration, profile/role lookup, Auth methods, and own-profile update.
- `src/auth/AuthGate.tsx` — setup/loading/error/signed-out/role-mismatch guards.
- `src/pages/AuthPage.tsx` — existing login/register design wired to Supabase Auth.
- `src/dashboard/DashboardApp.tsx` and `DashboardLayout.tsx` — preserved role routes and layout with verified-role access/sign-out.
- `src/dashboard/useDashboardData.ts` and `DashboardPages.tsx` — RLS-scoped list/count loading, error, and empty states; local-only unfinished workflows remain disclosed.
- `supabase/migrations/` — schema, signup trigger, constraints, grants, indexes, and RLS policies.
- `supabase/bootstrap-admin.sql` — owner-only first-admin template; never linked to public registration.
- `.env.example` and `SUPABASE_SETUP.md` — variable names and manual setup instructions only; no credentials.

## Design constraints

- **Movement:** Preserve the existing refined European B2B RealReach identity.
- **Principles:** Keep the established forest-green, terracotta, cream, and white palette; retain current typography, component shapes, spacing, imagery, and responsive page layouts; add only state messaging and controls that use existing button/card treatments.
- **Layout:** Preserve the centered sign-in/register card and existing dashboard shell. Do not recreate or redesign the homepage or public pages.
- **Interaction:** Never render a protected workspace while the session or role is unverified. State messages distinguish missing configuration, session loading, authorization failure, live query errors, and real empty results.
- **Brand essence:** Local leaflet-distribution coordination for Milan businesses and independent distributors; clear, practical, and professional.

## Required user configuration before live operation

Create or authorize a Supabase project, run the migration once before registering users, configure the Supabase Auth redirect URLs, and add only the Project URL plus the browser-safe publishable key as `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`. The first administrator is promoted separately by the trusted project owner. Exact no-code instructions are in `SUPABASE_SETUP.md`. Do not enter a paid upgrade or enable a connector unless the user explicitly authorizes it.

## Primary references

- [Supabase API keys](https://supabase.com/docs/guides/getting-started/api-keys) — publishable versus secret keys.
- [Supabase Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security) — exposed-schema RLS, grants, policies, and safe security-definer functions.
- [Supabase JavaScript sign-up](https://supabase.com/docs/reference/javascript/auth-signup) — email/password sign-up and confirmation behavior.
- [Supabase RBAC](https://supabase.com/docs/guides/api/custom-claims-and-role-based-access-control-rbac) — database-backed role authorization.
