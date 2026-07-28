-- ═══════════════════════════════════════════
--  Agezweho Movies — Supabase Schema
--  Run this in your Supabase SQL Editor
-- ═══════════════════════════════════════════

-- Enable UUID extension
create extension if not exists "pgcrypto";

-- ── Movies Table ──────────────────────────
create table if not exists movies (
  id              uuid default gen_random_uuid() primary key,
  title           text not null,
  year            text,
  type            text default 'Movie',
  language        text,
  genre           text,
  rating          text,
  poster_url      text,
  overview        text,
  links           jsonb default '[]'::jsonb,
  watch_links     jsonb default '[]'::jsonb,
  subtitle_links  jsonb default '[]'::jsonb,
  platforms       jsonb default '[]'::jsonb,
  trailer_url     text,
  uploaded_by     text,
  uploader_momo_number   text,
  featured        boolean default false,
  status          text default 'pending',
  created_at      timestamptz default now()
);

-- ── Games Table ──────────────────────────
create table if not exists games (
  id          uuid default gen_random_uuid() primary key,
  title       text not null,
  type        text default 'Game',
  category    text,
  version     text,
  rating      text,
  cover_url   text,
  overview    text,
  links       jsonb default '[]'::jsonb,
  premium     boolean default true,
  price       integer default 50,
  uploader_momo_number text,
  status      text default 'pending',
  created_at  timestamptz default now()
);

alter table movies add column if not exists watch_links jsonb default '[]'::jsonb;
alter table movies add column if not exists subtitle_links jsonb default '[]'::jsonb;
alter table movies add column if not exists platforms jsonb default '[]'::jsonb;
alter table movies add column if not exists trailer_url text;
alter table movies add column if not exists uploaded_by text;
alter table movies add column if not exists uploader_momo_number text;
alter table movies add column if not exists status text default 'pending';
alter table movies alter column status set default 'pending';

alter table games add column if not exists price integer default 50;
alter table games add column if not exists uploader_momo_number text;
alter table games add column if not exists status text default 'pending';
alter table games alter column status set default 'pending';

-- ── Requests Table ────────────────────────
create table if not exists requests (
  id              uuid default gen_random_uuid() primary key,
  title           text not null,
  requested_by    text,
  note            text,
  year            text,
  language        text,
  source          text,
  votes           integer default 0,
  donation_goal   integer default 5000,
  donation_total  integer default 0,
  fulfilled       boolean default false,
  created_at      timestamptz default now()
);

-- ── Donations Table ─────────────────────
create table if not exists donations (
  id            uuid default gen_random_uuid() primary key,
  request_id    uuid references requests(id) on delete cascade,
  movie_id      uuid references movies(id) on delete cascade,
  donor_name    text,
  amount        integer not null default 1000,
  phone_last4   text,
  confirmed     boolean default false,
  created_at    timestamptz default now()
);

alter table donations add column if not exists movie_id uuid references movies(id) on delete cascade;

-- ── Transactions Table (payment gateway) ─
create table if not exists transactions (
  id            uuid default gen_random_uuid() primary key,
  request_id    uuid references requests(id) on delete set null,
  game_id       uuid references games(id) on delete set null,
  user_id       uuid references auth.users(id) on delete set null,
  amount        integer not null,
  tx_ref        text unique not null,
  status        text default 'pending',
  provider_reference text,
  donor_email   text,
  donor_phone   text,
  phone         text,
  created_at    timestamptz default now()
);

-- ── Premium Access Requests Table ────────
create table if not exists premium_access_requests (
  id            uuid default gen_random_uuid() primary key,
  user_id       uuid references auth.users(id) on delete cascade,
  game_id       uuid references games(id) on delete cascade,
  status        text default 'pending',
  created_at    timestamptz default now()
);

alter table premium_access_requests add column if not exists game_id uuid references games(id) on delete cascade;
create unique index if not exists premium_access_requests_user_game_key
  on premium_access_requests (user_id, game_id)
  where game_id is not null;
create unique index if not exists premium_access_requests_user_game_upsert_key
  on premium_access_requests (user_id, game_id);

alter table requests add column if not exists year text;
alter table requests add column if not exists language text;
alter table requests add column if not exists source text;
alter table requests add column if not exists donation_goal integer default 5000;
alter table requests add column if not exists donation_total integer default 0;

alter table transactions add column if not exists game_id uuid references games(id) on delete set null;
alter table transactions add column if not exists user_id uuid references auth.users(id) on delete set null;
alter table transactions add column if not exists phone text;
alter table transactions add column if not exists provider_reference text;
alter table transactions add column if not exists movie_id uuid references movies(id) on delete set null;

alter table movies add column if not exists uploader_earnings integer default 0;

-- ── Contacts Table ────────────────────────
create table if not exists contacts (
  id            uuid default gen_random_uuid() primary key,
  name          text,
  email         text,
  subject       text,
  message       text not null,
  created_at    timestamptz default now()
);

-- ── Payouts Table (uploader withdrawals) ──
create table if not exists payouts (
  id              uuid default gen_random_uuid() primary key,
  uploader_id     uuid references auth.users(id) on delete set null,
  uploader_email  text,
  uploader_phone  text,
  amount          integer not null,
  status          text default 'pending',
  notes           text,
  processed_by    uuid references auth.users(id) on delete set null,
  processed_at    timestamptz,
  created_at      timestamptz default now()
);

-- ── Admins Table ──────────────────────────
create table if not exists admins (
  id            uuid default gen_random_uuid() primary key,
  user_id       uuid references auth.users(id) on delete cascade unique,
  email         text not null,
  created_by    uuid references auth.users(id) on delete set null,
  created_at    timestamptz default now()
);

-- ── Row Level Security ────────────────────
alter table movies     enable row level security;
alter table games      enable row level security;
alter table requests   enable row level security;
alter table donations  enable row level security;
alter table transactions enable row level security;
alter table premium_access_requests enable row level security;
alter table payouts enable row level security;

alter table admins enable row level security;

-- Public reads are limited to content that can safely be exposed directly.
-- Premium game rows contain download links, so premium game reads go through server APIs.
drop policy if exists "public_read_admins"    on admins;
drop policy if exists "public_read_movies"    on movies;    create policy "public_read_movies"    on movies    for select using (status = 'approved');
drop policy if exists "public_read_games"     on games;     create policy "public_read_games"     on games     for select using (premium = false and status = 'approved');
drop policy if exists "public_read_requests"  on requests;  create policy "public_read_requests"  on requests  for select using (true);
drop policy if exists "public_read_donations" on donations; create policy "public_read_donations" on donations for select using (true);
drop policy if exists "admins_self_read" on admins; create policy "admins_self_read" on admins for select using (user_id = auth.uid() or auth.role() = 'service_role');

-- Authenticated users can read their own
drop policy if exists "auth_read_transactions" on transactions; create policy "auth_read_transactions" on transactions for select using (auth.role() = 'service_role' or user_id = auth.uid());
drop policy if exists "auth_read_premium_access" on premium_access_requests; create policy "auth_read_premium_access" on premium_access_requests for select using (auth.uid() = user_id or auth.role() = 'service_role');

-- Public can insert
drop policy if exists "public_insert_movies"    on movies;    create policy "public_insert_movies"    on movies    for insert with check (status = 'pending');
drop policy if exists "public_insert_games"     on games;     create policy "public_insert_games"     on games     for insert with check (status = 'pending');
drop policy if exists "public_insert_requests"  on requests;  create policy "public_insert_requests"  on requests  for insert with check (true);
drop policy if exists "public_insert_donations" on donations; create policy "public_insert_donations" on donations for insert with check (true);
drop policy if exists "auth_insert_transactions" on transactions; create policy "auth_insert_transactions" on transactions for insert with check (auth.role() = 'service_role');
drop policy if exists "auth_insert_premium_access" on premium_access_requests; create policy "auth_insert_premium_access" on premium_access_requests for insert with check (auth.uid() = user_id);

-- Mutations that change public state must happen through authenticated server APIs.
drop policy if exists "public_update_movies"    on movies;
drop policy if exists "public_update_games"     on games;
drop policy if exists "public_update_requests"  on requests;
drop policy if exists "public_update_donations" on donations;

-- Service role only for sensitive updates
drop policy if exists "service_update_transactions" on transactions; create policy "service_update_transactions" on transactions for update using (auth.role() = 'service_role');
drop policy if exists "service_update_premium_access" on premium_access_requests; create policy "service_update_premium_access" on premium_access_requests for update using (auth.role() = 'service_role');
drop policy if exists "service_update_admins" on admins; create policy "service_update_admins" on admins for all using (auth.role() = 'service_role');
drop policy if exists "service_all_payouts" on payouts; create policy "service_all_payouts" on payouts for all using (auth.role() = 'service_role');
drop policy if exists "auth_read_payouts" on payouts; create policy "auth_read_payouts" on payouts for select using (uploader_id = auth.uid());

-- Deletes are admin-only through service-role API routes.
drop policy if exists "public_delete_movies" on movies;
drop policy if exists "public_delete_requests" on requests;

-- ── Seed Sample Data ──────────────────────
insert into movies (title, year, type, language, genre, rating, poster_url, overview, links, featured, status) values
(
  'Pushpa 2: The Rule', '2024', 'Movie', 'Telugu/Hindi', 'Action',  '8.3',
  'https://image.tmdb.org/t/p/w342/eTlR0swrUJL0y6yjGWBFkOJvCMW.jpg',
  'Pushpa Raj expands his red-sandalwood smuggling empire and faces a fierce new antagonist bent on destroying everything he has built.',
  '[{"label":"JioCinema","url":"https://www.jiocinema.com","color":"#6B4DE6"},{"label":"Amazon Prime","url":"https://www.primevideo.com","color":"#00A8E1"}]',
  true, 'approved'
),
(
  'Stree 2', '2024', 'Movie', 'Hindi', 'Horror Comedy', '7.9',
  'https://image.tmdb.org/t/p/w342/pvBHkB2MzO0L9OwxFwcuJDfX7gL.jpg',
  'The gang of Chanderi faces a far more terrifying supernatural force than Stree — one that may require an unlikely alliance to defeat.',
  '[{"label":"Netflix","url":"https://www.netflix.com","color":"#E50914"}]',
  true, 'approved'
),
(
  'Mirzapur S3', '2024', 'Series', 'Hindi', 'Crime Drama', '8.1',
  'https://image.tmdb.org/t/p/w342/2sLUoMmYlEEt8cq6DQhz8oTIUcW.jpg',
  'The power struggle for control of Mirzapur reaches a boiling point as old loyalties shatter and new blood rises to claim the throne.',
  '[{"label":"Amazon Prime","url":"https://www.primevideo.com","color":"#00A8E1"}]',
  false, 'approved'
),
(
  'Animal', '2023', 'Movie', 'Hindi', 'Action Drama', '6.8',
  'https://image.tmdb.org/t/p/w342/oaGvjB0DvdhXhOAuEV3F9VM1xSO.jpg',
  'A son''s obsessive devotion to his father spirals into violence and vengeance as corporate conspiracies and family betrayals collide.',
  '[{"label":"Netflix","url":"https://www.netflix.com","color":"#E50914"},{"label":"JioCinema","url":"https://www.jiocinema.com","color":"#6B4DE6"}]',
  false, 'approved'
);

insert into requests (title, requested_by, note, votes) values
('KGF Chapter 3', 'Vikram', 'Rocky Bhai is back — please add ASAP!', 24),
('Panchayat Season 4', 'Ananya', 'Best Indian series ever. Waiting eagerly!', 17),
('Kalki 2898-AD', 'Rohan', 'Prabhas and Deepika — this will be epic.', 11);

-- ── Migrations ────────────────────────────
