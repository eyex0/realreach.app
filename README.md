# RealReach — public website and Supabase foundation

A responsive English-language RealReach site for leaflet distribution in Milan. It preserves the supplied brand identity and existing public pages, and includes Customer, Distributor, and Administrator dashboard interfaces.

## Public routes

Home, Services, How it works, Pricing, Coverage, About, Contact, Sign in, and Create an account.

## Dashboard routes

The Customer workspace includes campaigns, orders, reports, and account settings. The Distributor workspace includes assigned jobs, delivery progress, proof of delivery, and account settings. The Administrator workspace includes platform overview, campaigns, customers, distributors, evidence, orders, and reports.

## Supabase status

Supabase Auth and database-query integration code, protected routes, and a Row Level Security migration are present in the source. **No Supabase project is currently connected or configured**, and the migration has not been applied or live-tested. The app must not be treated as having working authentication or a verified production backend until setup and security tests are complete.

Follow [`SUPABASE_SETUP.md`](SUPABASE_SETUP.md) for the no-code project setup steps. The migration is [`supabase/migrations/20261013000000_realreach_core.sql`](supabase/migrations/20261013000000_realreach_core.sql). The browser uses only a Supabase publishable key (or legacy anon key); never add a `service_role`/secret key, database password, or JWT secret to the frontend.

## Functionality boundaries

- When Supabase is unconfigured, sign-in is disabled and protected workspaces show an explicit setup state.
- Once configured, dashboard counts and lists query only records authorized by Supabase policies. Account settings can update the signed-in user’s own profile name and phone number.
- Campaign creation, distributor status updates, and proof-file selection remain local previews; they are not submitted or stored.
- There is no payment processing, GPS/location collection, live tracking, evidence-file upload, or fabricated operational data.
- The migration creates schema and policies only; it inserts no business records.

## Developer commands

Requires Node.js and the pnpm version pinned in `package.json`.

```bash
pnpm install
pnpm dev
pnpm typecheck
pnpm build
```

The supplied Milan image is included under `public/` for local fallback and the project-storage asset is used when available in the managed preview.
