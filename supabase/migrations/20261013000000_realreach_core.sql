begin;

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;
grant usage on schema private to authenticated;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_roles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'customer' check (role in ('customer', 'distributor', 'admin')),
  created_at timestamptz not null default now()
);

create table if not exists public.customers (
  id uuid primary key references public.profiles(id) on delete cascade,
  organization_name text,
  created_at timestamptz not null default now()
);

create table if not exists public.distributors (
  id uuid primary key references public.profiles(id) on delete cascade,
  service_areas text[] not null default '{}'::text[],
  availability text not null default 'unspecified' check (availability in ('unspecified', 'available', 'unavailable')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.campaigns (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null default auth.uid() references public.customers(id) on delete restrict,
  name text not null check (length(trim(name)) between 1 and 120),
  coverage_area text not null check (length(trim(coverage_area)) between 1 and 160),
  leaflet_quantity integer not null check (leaflet_quantity > 0),
  format text,
  preferred_start_date date,
  print_coordination boolean not null default false,
  brief text,
  status text not null default 'draft' check (status in ('draft', 'submitted', 'approved', 'in_progress', 'completed', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, customer_id)
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null,
  customer_id uuid not null references public.customers(id) on delete restrict,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (campaign_id, customer_id) references public.campaigns(id, customer_id) on delete cascade,
  unique (id, campaign_id)
);

create table if not exists public.distribution_jobs (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null,
  campaign_id uuid not null,
  distributor_id uuid references public.distributors(id) on delete set null,
  assigned_by uuid references public.profiles(id) on delete set null,
  instructions text,
  status text not null default 'assigned' check (status in ('assigned', 'accepted', 'in_progress', 'completed', 'cancelled')),
  scheduled_for timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (order_id, campaign_id) references public.orders(id, campaign_id) on delete cascade,
  unique (id, distributor_id)
);

create table if not exists public.delivery_evidence (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null,
  submitted_by uuid not null,
  storage_path text not null check (length(trim(storage_path)) > 0),
  note text,
  review_status text not null default 'pending' check (review_status in ('pending', 'approved', 'rejected')),
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  foreign key (job_id, submitted_by) references public.distribution_jobs(id, distributor_id) on delete cascade
);

create table if not exists public.campaign_reports (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  summary text not null default '',
  metrics jsonb not null default '{}'::jsonb,
  published_at timestamptz,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists user_roles_role_user_id_idx on public.user_roles (role, user_id);
create index if not exists campaigns_customer_created_idx on public.campaigns (customer_id, created_at desc);
create index if not exists campaigns_status_created_idx on public.campaigns (status, created_at desc);
create index if not exists orders_customer_created_idx on public.orders (customer_id, created_at desc);
create index if not exists orders_campaign_id_idx on public.orders (campaign_id);
create index if not exists jobs_distributor_status_created_idx on public.distribution_jobs (distributor_id, status, created_at desc);
create index if not exists jobs_campaign_id_idx on public.distribution_jobs (campaign_id);
create index if not exists jobs_order_id_idx on public.distribution_jobs (order_id);
create index if not exists evidence_job_created_idx on public.delivery_evidence (job_id, created_at desc);
create index if not exists evidence_review_status_idx on public.delivery_evidence (review_status, created_at desc);
create index if not exists reports_campaign_published_idx on public.campaign_reports (campaign_id, published_at desc);

create or replace function private.has_role(requested_role text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.user_roles as roles
    where roles.user_id = (select auth.uid())
      and roles.role = requested_role
  );
$$;

create or replace function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select private.has_role('admin');
$$;

create or replace function private.distributor_assigned_to_campaign(target_campaign_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.distribution_jobs as jobs
    where jobs.campaign_id = target_campaign_id
      and jobs.distributor_id = (select auth.uid())
  );
$$;

create or replace function private.customer_owns_order(target_order_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.orders as orders
    where orders.id = target_order_id
      and orders.customer_id = (select auth.uid())
  );
$$;

create or replace function private.distributor_assigned_to_order(target_order_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.distribution_jobs as jobs
    where jobs.order_id = target_order_id
      and jobs.distributor_id = (select auth.uid())
  );
$$;

create or replace function private.customer_owns_job(target_job_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.distribution_jobs as jobs
    join public.campaigns as campaigns on campaigns.id = jobs.campaign_id
    where jobs.id = target_job_id
      and campaigns.customer_id = (select auth.uid())
  );
$$;

create or replace function private.distributor_assigned_to_job(target_job_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.distribution_jobs as jobs
    where jobs.id = target_job_id
      and jobs.distributor_id = (select auth.uid())
  );
$$;

create or replace function private.create_profile_for_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  requested_role text;
  requested_name text;
  requested_organization text;
begin
  requested_role := case
    when lower(coalesce(new.raw_user_meta_data ->> 'role', '')) = 'distributor' then 'distributor'
    else 'customer'
  end;
  requested_name := coalesce(new.raw_user_meta_data ->> 'full_name', '');
  requested_organization := nullif(trim(coalesce(new.raw_user_meta_data ->> 'organization_name', '')), '');

  insert into public.profiles (id, full_name)
  values (new.id, requested_name)
  on conflict (id) do nothing;

  insert into public.user_roles (user_id, role)
  values (new.id, requested_role)
  on conflict (user_id) do nothing;

  if requested_role = 'distributor' then
    insert into public.distributors (id) values (new.id) on conflict (id) do nothing;
  else
    insert into public.customers (id, organization_name)
    values (new.id, requested_organization)
    on conflict (id) do nothing;
  end if;

  return new;
end;
$$;

create or replace function private.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create or replace function private.guard_campaign_update()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if not private.is_admin() and (
    new.id is distinct from old.id
    or new.customer_id is distinct from old.customer_id
    or new.status is distinct from old.status
    or new.created_at is distinct from old.created_at
  ) then
    raise exception 'Customers may edit campaign details only; campaign ownership and status are protected.' using errcode = '42501';
  end if;
  return new;
end;
$$;

create or replace function private.guard_job_update()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if not private.is_admin() and row(
    new.id, new.order_id, new.campaign_id, new.distributor_id, new.assigned_by,
    new.instructions, new.scheduled_for, new.created_at
  ) is distinct from row(
    old.id, old.order_id, old.campaign_id, old.distributor_id, old.assigned_by,
    old.instructions, old.scheduled_for, old.created_at
  ) then
    raise exception 'Distributors may update job status only.' using errcode = '42501';
  end if;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function private.create_profile_for_auth_user();

create trigger profiles_touch_updated_at before update on public.profiles
  for each row execute function private.touch_updated_at();
create trigger distributors_touch_updated_at before update on public.distributors
  for each row execute function private.touch_updated_at();
create trigger campaigns_touch_updated_at before update on public.campaigns
  for each row execute function private.touch_updated_at();
create trigger campaigns_guard_update before update on public.campaigns
  for each row execute function private.guard_campaign_update();
create trigger orders_touch_updated_at before update on public.orders
  for each row execute function private.touch_updated_at();
create trigger jobs_touch_updated_at before update on public.distribution_jobs
  for each row execute function private.touch_updated_at();
create trigger jobs_guard_update before update on public.distribution_jobs
  for each row execute function private.guard_job_update();

revoke all on function private.has_role(text) from public, anon;
revoke all on function private.is_admin() from public, anon;
revoke all on function private.distributor_assigned_to_campaign(uuid) from public, anon;
revoke all on function private.customer_owns_order(uuid) from public, anon;
revoke all on function private.distributor_assigned_to_order(uuid) from public, anon;
revoke all on function private.customer_owns_job(uuid) from public, anon;
revoke all on function private.distributor_assigned_to_job(uuid) from public, anon;
revoke all on function private.create_profile_for_auth_user() from public, anon, authenticated;
revoke all on function private.touch_updated_at() from public, anon, authenticated;
revoke all on function private.guard_campaign_update() from public, anon, authenticated;
revoke all on function private.guard_job_update() from public, anon, authenticated;
grant execute on function private.has_role(text) to authenticated;
grant execute on function private.is_admin() to authenticated;
grant execute on function private.distributor_assigned_to_campaign(uuid) to authenticated;
grant execute on function private.customer_owns_order(uuid) to authenticated;
grant execute on function private.distributor_assigned_to_order(uuid) to authenticated;
grant execute on function private.customer_owns_job(uuid) to authenticated;
grant execute on function private.distributor_assigned_to_job(uuid) to authenticated;

alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.customers enable row level security;
alter table public.distributors enable row level security;
alter table public.campaigns enable row level security;
alter table public.orders enable row level security;
alter table public.distribution_jobs enable row level security;
alter table public.delivery_evidence enable row level security;
alter table public.campaign_reports enable row level security;

create policy profiles_read_self_or_admin on public.profiles
  for select to authenticated
  using ((select auth.uid()) = id or (select private.is_admin()));
create policy profiles_update_self_or_admin on public.profiles
  for update to authenticated
  using ((select auth.uid()) = id or (select private.is_admin()))
  with check ((select auth.uid()) = id or (select private.is_admin()));

create policy user_roles_read_self_or_admin on public.user_roles
  for select to authenticated
  using (user_id = (select auth.uid()) or (select private.is_admin()));
create policy user_roles_admin_insert on public.user_roles
  for insert to authenticated
  with check ((select private.is_admin()) and user_id <> (select auth.uid()));
create policy user_roles_admin_update on public.user_roles
  for update to authenticated
  using ((select private.is_admin()) and user_id <> (select auth.uid()))
  with check ((select private.is_admin()) and user_id <> (select auth.uid()));
create policy user_roles_admin_delete on public.user_roles
  for delete to authenticated
  using ((select private.is_admin()) and user_id <> (select auth.uid()));

create policy customers_read_self_or_admin on public.customers
  for select to authenticated
  using (id = (select auth.uid()) or (select private.is_admin()));
create policy customers_update_self_or_admin on public.customers
  for update to authenticated
  using (id = (select auth.uid()) or (select private.is_admin()))
  with check (id = (select auth.uid()) or (select private.is_admin()));
create policy customers_admin_insert on public.customers
  for insert to authenticated
  with check ((select private.is_admin()));
create policy customers_admin_delete on public.customers
  for delete to authenticated
  using ((select private.is_admin()));

create policy distributors_read_self_or_admin on public.distributors
  for select to authenticated
  using (id = (select auth.uid()) or (select private.is_admin()));
create policy distributors_update_self_or_admin on public.distributors
  for update to authenticated
  using (id = (select auth.uid()) or (select private.is_admin()))
  with check (id = (select auth.uid()) or (select private.is_admin()));
create policy distributors_admin_insert on public.distributors
  for insert to authenticated
  with check ((select private.is_admin()));
create policy distributors_admin_delete on public.distributors
  for delete to authenticated
  using ((select private.is_admin()));

create policy campaigns_read_authorized on public.campaigns
  for select to authenticated
  using (
    customer_id = (select auth.uid())
    or (select private.is_admin())
    or (select private.distributor_assigned_to_campaign(id))
  );
create policy campaigns_insert_customer_or_admin on public.campaigns
  for insert to authenticated
  with check (
    (customer_id = (select auth.uid()) and (select private.has_role('customer')) and status = 'draft')
    or (select private.is_admin())
  );
create policy campaigns_update_owner_draft_or_admin on public.campaigns
  for update to authenticated
  using (
    (customer_id = (select auth.uid()) and status = 'draft')
    or (select private.is_admin())
  )
  with check (
    (customer_id = (select auth.uid()) and status = 'draft')
    or (select private.is_admin())
  );
create policy campaigns_admin_delete on public.campaigns
  for delete to authenticated
  using ((select private.is_admin()));

create policy orders_read_authorized on public.orders
  for select to authenticated
  using (
    customer_id = (select auth.uid())
    or (select private.is_admin())
    or (select private.distributor_assigned_to_order(id))
  );
create policy orders_admin_insert on public.orders
  for insert to authenticated
  with check ((select private.is_admin()));
create policy orders_admin_update on public.orders
  for update to authenticated
  using ((select private.is_admin()))
  with check ((select private.is_admin()));
create policy orders_admin_delete on public.orders
  for delete to authenticated
  using ((select private.is_admin()));

create policy jobs_read_authorized on public.distribution_jobs
  for select to authenticated
  using (
    distributor_id = (select auth.uid())
    or (select private.is_admin())
    or (select private.customer_owns_job(id))
  );
create policy jobs_admin_insert on public.distribution_jobs
  for insert to authenticated
  with check ((select private.is_admin()));
create policy jobs_update_assigned_distributor_or_admin on public.distribution_jobs
  for update to authenticated
  using (distributor_id = (select auth.uid()) or (select private.is_admin()))
  with check (distributor_id = (select auth.uid()) or (select private.is_admin()));
create policy jobs_admin_delete on public.distribution_jobs
  for delete to authenticated
  using ((select private.is_admin()));

create policy evidence_read_authorized on public.delivery_evidence
  for select to authenticated
  using (
    (select private.is_admin())
    or (select private.distributor_assigned_to_job(job_id))
    or (select private.customer_owns_job(job_id))
  );
create policy evidence_insert_assigned_distributor on public.delivery_evidence
  for insert to authenticated
  with check (
    submitted_by = (select auth.uid())
    and (select private.distributor_assigned_to_job(job_id))
  );
create policy evidence_admin_update on public.delivery_evidence
  for update to authenticated
  using ((select private.is_admin()))
  with check ((select private.is_admin()));
create policy evidence_admin_delete on public.delivery_evidence
  for delete to authenticated
  using ((select private.is_admin()));

create policy reports_read_customer_or_admin on public.campaign_reports
  for select to authenticated
  using (
    (select private.is_admin())
    or exists (
      select 1 from public.campaigns as campaigns
      where campaigns.id = campaign_reports.campaign_id
        and campaigns.customer_id = (select auth.uid())
    )
  );
create policy reports_admin_insert on public.campaign_reports
  for insert to authenticated
  with check ((select private.is_admin()));
create policy reports_admin_update on public.campaign_reports
  for update to authenticated
  using ((select private.is_admin()))
  with check ((select private.is_admin()));
create policy reports_admin_delete on public.campaign_reports
  for delete to authenticated
  using ((select private.is_admin()));

revoke all on table public.profiles, public.user_roles, public.customers, public.distributors,
  public.campaigns, public.orders, public.distribution_jobs, public.delivery_evidence,
  public.campaign_reports from anon, authenticated;

grant usage on schema public to authenticated;
grant select on public.profiles to authenticated;
grant update (full_name, phone) on public.profiles to authenticated;
grant select, insert, update, delete on public.user_roles to authenticated;
grant select, insert, update (organization_name), delete on public.customers to authenticated;
grant select, insert, update (service_areas, availability), delete on public.distributors to authenticated;
grant select, insert, update, delete on public.campaigns to authenticated;
grant select, insert, update, delete on public.orders to authenticated;
grant select, insert, update, delete on public.distribution_jobs to authenticated;
grant select, insert, update, delete on public.delivery_evidence to authenticated;
grant select, insert, update, delete on public.campaign_reports to authenticated;

commit;
