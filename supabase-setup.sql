-- PYQ Bundle – pre-registration table
-- Run once in Supabase → SQL Editor. Then set BACKEND.mode = 'supabase' in js/register.js
-- and fill in your project URL + anon (public) key.

create table if not exists public.pre_registrations (
  id           bigint generated always as identity primary key,
  created_at   timestamptz not null default now(),
  name         text not null check (char_length(name) between 2 and 100),
  email        text not null check (char_length(email) <= 254),
  phone        text check (phone is null or char_length(phone) <= 20),
  exam         text not null check (char_length(exam) <= 80),
  early_tester boolean not null default false,
  message      text check (message is null or char_length(message) <= 1000),
  source       text check (source is null or char_length(source) <= 40)
);

-- One registration per email (case-insensitive). A duplicate insert returns HTTP 409,
-- which the page shows as "already on the list".
create unique index if not exists pre_registrations_email_key
  on public.pre_registrations (lower(email));

-- Visitors may INSERT only. No select/update/delete policy = nobody can read the list
-- with the public anon key. View submissions in the Supabase dashboard.
alter table public.pre_registrations enable row level security;

drop policy if exists "Anyone can pre-register" on public.pre_registrations;
create policy "Anyone can pre-register"
  on public.pre_registrations
  for insert
  to anon
  with check (true);
