-- Run once in the Supabase SQL Editor as the trusted project owner,
-- after the owner account has confirmed its email address.
-- Replace the placeholder with that exact confirmed account email.
-- Public registration cannot perform this role change.

update public.user_roles as roles
set role = 'admin'
from auth.users as auth_user
where auth_user.id = roles.user_id
  and lower(auth_user.email) = lower('REPLACE_WITH_CONFIRMED_OWNER_EMAIL')
  and auth_user.email_confirmed_at is not null;

-- Verify that exactly the intended account was promoted before continuing:
select roles.user_id, roles.role, auth_user.email, auth_user.email_confirmed_at
from public.user_roles as roles
join auth.users as auth_user on auth_user.id = roles.user_id
where lower(auth_user.email) = lower('REPLACE_WITH_CONFIRMED_OWNER_EMAIL');
