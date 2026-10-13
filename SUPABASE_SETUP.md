# Supabase setup for RealReach

## Current state

The RealReach frontend now contains Supabase Auth integration code and a versioned schema migration, but no Supabase project is connected. The project currently has no URL or public key configured. No database migration has been applied or live-tested, so authentication, RLS policies, and database reads must not be treated as operational yet.

The app uses only `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` (or the legacy browser-safe anon key). These values are included in the browser build. Never use a Supabase `service_role`/secret key, database password, or JWT secret in this frontend or in the Vite environment.

## Setup steps — no code authoring required

1. **Create a Supabase account and project.** If you do not already have one, open [Supabase sign-up](https://supabase.com/dashboard/sign-up), create an account, and create a project for RealReach. Choose a region and database password yourself; keep the database password private. Do not approve a paid upgrade unless you decide to do so.
2. **Apply the schema before registering users.** In the Supabase project, open **SQL Editor → New query**. Copy the complete contents of [`supabase/migrations/20261013000000_realreach_core.sql`](supabase/migrations/20261013000000_realreach_core.sql) into the editor and run it once. It creates the role/profile tables, business tables, signup trigger, indexes, grants, and Row Level Security policies. It inserts no business records.
3. **Configure email redirects.** In **Authentication → URL Configuration**, add the current RealReach Preview origin `https://8328-itn43kkc5spx9rbj8gfze-d6fb2914.us4.manus.computer` to the allowed redirect URLs. For local development, also allow `http://localhost:3000`. The registration page requests a redirect to the current site origin. Enable email confirmation if that matches your account policy.
4. **Add the browser-safe project values.** In the project dashboard, open **Project Settings → API Keys** (or the API page in the current Supabase dashboard) and copy the **Project URL** and the **publishable key**. Do not copy the `secret`/`service_role` key. Configure those two values as the project environment variables `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`. The example file [`/.env.example`](.env.example) shows the variable names only. Restart/rebuild the preview after the values are configured.
5. **Create and confirm the first account.** Open `/register`, create either a Customer or Distributor account, and follow the email confirmation link if requested. Public registration cannot request an Administrator role; the database trigger converts any other supplied role value to Customer.
6. **Bootstrap the first Administrator only as project owner.** After confirming the owner account, open the SQL Editor and use the one-time template [`supabase/bootstrap-admin.sql`](supabase/bootstrap-admin.sql), replacing its email placeholder with the owner’s confirmed account email. This elevated operation is not exposed in the app. Later role changes must be made by a verified administrator and are restricted by RLS; no user can update their own role.
7. **Verify before treating it as live.** Test registration, email confirmation, sign-in, session restoration, sign-out, role redirects, and each role’s permitted/denied reads in this Supabase project. Confirm the SQL migration completed successfully and inspect the policies on all nine application tables. Until the project is configured and these checks pass, the frontend intentionally blocks dashboard access or displays an honest setup/error state.

## Implemented boundaries

- No payment processing, payment records, GPS/location collection, live tracking, or delivery-evidence file upload is implemented.
- The proof-of-delivery picker remains a local browser preview; `delivery_evidence.storage_path` is only a schema field, not a storage integration.
- Campaign creation and delivery-status controls remain local previews; dashboard lists and counts query only records returned by Supabase policies.
- The SQL migration stores no sample or fake production data.
- The first Administrator must be bootstrapped by a trusted project owner outside public registration.

## Security references

- [Supabase API keys](https://supabase.com/docs/guides/getting-started/api-keys)
- [Supabase Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Supabase Auth sign-up](https://supabase.com/docs/reference/javascript/auth-signup)
- [Supabase RBAC and custom claims](https://supabase.com/docs/guides/api/custom-claims-and-role-based-access-control-rbac)
