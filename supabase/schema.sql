-- ═══════════════════════════════════════════
--  Agezweho Movies — Supabase Schema
--  Run this in your Supabase SQL Editor
-- ═══════════════════════════════════════════

-- Enable UUID extension
create extension if not exists "pgcrypto";

-- ── Movies Table ──────────────────────────
create table if not exists movies (
  id          uuid default gen_random_uuid() primary key,
  title       text not null,
  year        text,
  type        text default 'Movie',
  language    text,
  genre       text,
  rating      text,
  poster_url  text,
  overview    text,
  links       jsonb default '[]'::jsonb,
  featured    boolean default false,
  status      text default 'approved',
  created_at  timestamptz default now()
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
  created_at  timestamptz default now()
);

-- ── Requests Table ────────────────────────
create table if not exists requests (
  id              uuid default gen_random_uuid() primary key,
  title           text not null,
  requested_by    text,
  note            text,
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
  donor_name    text,
  amount        integer not null default 1000,
  phone_last4   text,
  confirmed     boolean default false,
  created_at    timestamptz default now()
);

-- ── Transactions Table (payment gateway) ─
create table if not exists transactions (
  id            uuid default gen_random_uuid() primary key,
  request_id    uuid references requests(id) on delete set null,
  user_id       uuid references auth.users(id) on delete set null,
  amount        integer not null,
  tx_ref        text unique not null,
  status        text default 'pending',
  flw_id        text,
  donor_email   text,
  donor_phone   text,
  created_at    timestamptz default now()
);

-- ── Premium Access Requests Table ────────
create table if not exists premium_access_requests (
  id            uuid default gen_random_uuid() primary key,
  user_id       uuid references auth.users(id) on delete cascade,
  status        text default 'pending',
  created_at    timestamptz default now()
);

-- ── Row Level Security ────────────────────
alter table movies     enable row level security;
alter table games      enable row level security;
alter table requests   enable row level security;
alter table donations  enable row level security;
alter table transactions enable row level security;
alter table premium_access_requests enable row level security;

-- Public can read everything
create policy "public_read_movies"    on movies    for select using (true);
create policy "public_read_games"     on games     for select using (true);
create policy "public_read_requests"  on requests  for select using (true);
create policy "public_read_donations" on donations for select using (true);

-- Authenticated users can read their own
create policy "auth_read_transactions" on transactions for select using (auth.role() = 'service_role' or user_id = auth.uid());
create policy "auth_read_premium_access" on premium_access_requests for select using (auth.uid() = user_id or auth.role() = 'service_role');

-- Public can insert
create policy "public_insert_movies"    on movies    for insert with check (true);
create policy "public_insert_games"     on games     for insert with check (true);
create policy "public_insert_requests"  on requests  for insert with check (true);
create policy "public_insert_donations" on donations for insert with check (true);
create policy "auth_insert_transactions" on transactions for insert with check (auth.role() = 'service_role');
create policy "auth_insert_premium_access" on premium_access_requests for insert with check (auth.uid() = user_id);

-- Public can update (for votes, admin edits)
create policy "public_update_movies"    on movies    for update using (true);
create policy "public_update_games"     on games     for update using (true);
create policy "public_update_requests"  on requests  for update using (true);
create policy "public_update_donations" on donations for update using (true);

-- Service role only for sensitive updates
create policy "service_update_transactions" on transactions for update using (auth.role() = 'service_role');
create policy "service_update_premium_access" on premium_access_requests for update using (auth.role() = 'service_role');

-- Public can delete (admin)
create policy "public_delete_movies" on movies for delete using (true);

-- ── Seed Sample Data ──────────────────────
insert into movies (title, year, type, language, genre, rating, poster_url, overview, links, featured) values
(
  'Pushpa 2: The Rule', '2024', 'Movie', 'Telugu/Hindi', 'Action',  '8.3',
  'https://image.tmdb.org/t/p/w342/eTlR0swrUJL0y6yjGWBFkOJvCMW.jpg',
  'Pushpa Raj expands his red-sandalwood smuggling empire and faces a fierce new antagonist bent on destroying everything he has built.',
  '[{"label":"JioCinema","url":"https://www.jiocinema.com","color":"#6B4DE6"},{"label":"Amazon Prime","url":"https://www.primevideo.com","color":"#00A8E1"}]',
  true
),
(
  'Stree 2', '2024', 'Movie', 'Hindi', 'Horror Comedy', '7.9',
  'https://image.tmdb.org/t/p/w342/pvBHkB2MzO0L9OwxFwcuJDfX7gL.jpg',
  'The gang of Chanderi faces a far more terrifying supernatural force than Stree — one that may require an unlikely alliance to defeat.',
  '[{"label":"Netflix","url":"https://www.netflix.com","color":"#E50914"}]',
  true
),
(
  'Mirzapur S3', '2024', 'Series', 'Hindi', 'Crime Drama', '8.1',
  'https://image.tmdb.org/t/p/w342/2sLUoMmYlEEt8cq6DQhz8oTIUcW.jpg',
  'The power struggle for control of Mirzapur reaches a boiling point as old loyalties shatter and new blood rises to claim the throne.',
  '[{"label":"Amazon Prime","url":"https://www.primevideo.com","color":"#00A8E1"}]',
  false
),
(
  'Animal', '2023', 'Movie', 'Hindi', 'Action Drama', '6.8',
  'https://image.tmdb.org/t/p/w342/oaGvjB0DvdhXhOAuEV3F9VM1xSO.jpg',
  'A son''s obsessive devotion to his father spirals into violence and vengeance as corporate conspiracies and family betrayals collide.',
  '[{"label":"Netflix","url":"https://www.netflix.com","color":"#E50914"},{"label":"JioCinema","url":"https://www.jiocinema.com","color":"#6B4DE6"}]',
  false
);

insert into requests (title, requested_by, note, votes) values
('KGF Chapter 3', 'Vikram', 'Rocky Bhai is back — please add ASAP!', 24),
('Panchayat Season 4', 'Ananya', 'Best Indian series ever. Waiting eagerly!', 17),
('Kalki 2898-AD', 'Rohan', 'Prabhas and Deepika — this will be epic.', 11);
