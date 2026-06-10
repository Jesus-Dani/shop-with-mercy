-- =============================================================
-- Shop With Mercy — Create Admin User
--
-- Run this AFTER:
--   1. The owner has signed up via the app (which creates their auth.users + profiles row)
--   2. The initial schema migration (001_initial_schema.sql) has been applied
--
-- How to run:
--   Supabase Dashboard → SQL Editor
--   Replace <OWNER_USER_ID> with the UUID from:
--     Authentication → Users → click the owner's email → copy the UUID
-- =============================================================

insert into public.admin_users (user_id)
values ('<OWNER_USER_ID>')
on conflict (user_id) do nothing;

-- Verify:
select au.user_id, p.full_name, au.created_at
from public.admin_users au
join public.profiles p on p.id = au.user_id;
