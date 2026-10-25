-- Run this first in the Supabase SQL editor, then run seed.sql.
create extension if not exists "pgcrypto";

create table if not exists cards (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  issuer text not null,
  network text not null,
  tagline text default '',
  annual_fee numeric not null default 0,
  joining_fee numeric not null default 0,
  fee_waiver_spend numeric,
  base_rate numeric not null default 0,
  eligibility text default '',
  highlights text[] default '{}',
  exclusions text[] default '{}',
  source_url text,
  colors text[] default '{}',
  verification_status text not null default 'pending' check (verification_status in ('pending','verified')),
  last_checked timestamptz,
  created_at timestamptz default now()
);

create table if not exists reward_rules (
  id uuid primary key default gen_random_uuid(),
  card_id uuid not null references cards(id) on delete cascade,
  category text not null,
  rate_pct numeric not null,
  monthly_cap numeric,
  note text
);

create table if not exists sources (
  id uuid primary key default gen_random_uuid(),
  card_id uuid references cards(id) on delete cascade,
  url text not null,
  kind text default 'issuer_page',
  last_fetched timestamptz,
  content_hash text,
  unique (card_id, url)
);

-- Proposed changes stay here until a reviewer approves them. Not readable by the public.
create table if not exists change_proposals (
  id uuid primary key default gen_random_uuid(),
  card_id uuid references cards(id) on delete cascade,
  field text not null,
  old_value text,
  new_value text,
  evidence_excerpt text,
  source_url text,
  status text not null default 'pending' check (status in ('pending','approved','rejected','superseded')),
  reviewer uuid,
  reviewed_at timestamptz,
  created_at timestamptz default now()
);

create table if not exists audit_log (
  id bigint generated always as identity primary key,
  actor uuid,
  action text not null,
  detail jsonb,
  created_at timestamptz default now()
);

alter table cards enable row level security;
alter table reward_rules enable row level security;
alter table sources enable row level security;
alter table change_proposals enable row level security;
alter table audit_log enable row level security;

create policy "public read cards" on cards for select using (true);
create policy "public read rules" on reward_rules for select using (true);
create policy "public read sources" on sources for select using (true);
-- change_proposals and audit_log have no public policy: only the service role can touch them.
