-- Run after schema.sql. Adds admin access: only users listed in `admins` can write.
create table if not exists admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz default now()
);
alter table admins enable row level security;

create or replace function is_admin() returns boolean
language sql security definer stable set search_path = public as $$
  select exists (select 1 from admins where user_id = auth.uid())
$$;

drop policy if exists "admin reads own row" on admins;
create policy "admin reads own row" on admins for select using (user_id = auth.uid());

do $$
declare t text;
begin
  foreach t in array array['cards','reward_rules','sources','change_proposals','audit_log'] loop
    execute format('drop policy if exists "admin all %1$s" on %1$I', t);
    execute format('create policy "admin all %1$s" on %1$I for all using (is_admin()) with check (is_admin())', t);
  end loop;
end $$;

-- Make yourself an admin: first create the user in Supabase > Authentication > Users, then run:
-- insert into admins (user_id) select id from auth.users where email = 'you@example.com';
