-- MASTERY leaderboard schema.
-- Run this once in your Supabase project's SQL Editor (Dashboard -> SQL Editor -> New query).

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text not null unique,
  total_hours numeric not null default 0,
  skills_tracked integer not null default 0,
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Anyone (including anonymous visitors) can read the leaderboard.
create policy "Profiles are publicly readable"
  on public.profiles for select
  using (true);

-- A user may only create their own profile row.
create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- A user may only update their own profile row.
create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Keep username uniqueness case-insensitive-ish and reasonable length.
alter table public.profiles
  add constraint username_length check (char_length(username) between 2 and 24);
