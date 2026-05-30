-- =====================================================================
-- The Class Quarterly · Supabase schema
-- Run this once in Supabase → SQL Editor → New query → Run.
-- =====================================================================

-- 1. Sequence for issue numbers (auto-incremented, never reused)
create sequence if not exists people_issue_seq;

-- 2. People table
create table if not exists public.people (
  id                uuid primary key default gen_random_uuid(),
  name              text not null,
  nickname          text default '',
  hobbies           text default '',
  relationship      text default '',
  fav_lecturer      text default '',
  easiest_level     text default '',
  stressful_level   text default '',
  if_not_cs         text default '',
  quote             text default '',
  social            text default '',
  social_platform   text default 'Instagram',
  department        text default '',
  photo             text default '',
  issue             integer not null default nextval('people_issue_seq'),
  created_at        timestamptz not null default now()
);

create index if not exists people_issue_idx      on public.people (issue desc);
create index if not exists people_created_at_idx on public.people (created_at desc);

-- 3. Row Level Security — open access (suitable for a class-internal app).
--    Tighten this if you ever expose it publicly.
alter table public.people enable row level security;

drop policy if exists "read all"   on public.people;
drop policy if exists "insert all" on public.people;
drop policy if exists "update all" on public.people;
drop policy if exists "delete all" on public.people;

create policy "read all"   on public.people for select using (true);
create policy "insert all" on public.people for insert with check (true);
create policy "update all" on public.people for update using (true);
create policy "delete all" on public.people for delete using (true);

-- 4. Storage bucket for portraits (public-readable)
insert into storage.buckets (id, name, public)
values ('portraits', 'portraits', true)
on conflict (id) do nothing;

drop policy if exists "read portraits"   on storage.objects;
drop policy if exists "write portraits"  on storage.objects;
drop policy if exists "update portraits" on storage.objects;
drop policy if exists "delete portraits" on storage.objects;

create policy "read portraits"   on storage.objects for select using (bucket_id = 'portraits');
create policy "write portraits"  on storage.objects for insert with check (bucket_id = 'portraits');
create policy "update portraits" on storage.objects for update using (bucket_id = 'portraits');
create policy "delete portraits" on storage.objects for delete using (bucket_id = 'portraits');
