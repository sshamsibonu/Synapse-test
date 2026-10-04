-- Synapse — initial schema
-- Run this once in the Supabase SQL editor (or via `supabase db push`).

create extension if not exists "pgcrypto";

-- One row per participant, anonymous or linked to a Supabase Auth account.
create table if not exists participants (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid references auth.users (id) on delete set null,
  anon_session_id text unique,
  age_range text,
  gender text,
  country text,
  education text,
  languages text[],
  created_at timestamptz not null default now(),
  constraint participants_identity_check check (
    auth_user_id is not null or anon_session_id is not null
  )
);

create index if not exists idx_participants_auth_user_id on participants (auth_user_id);

-- Per-session self-reported context (varies day to day, so not on participants).
create table if not exists session_intake (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid not null references participants (id) on delete cascade,
  sleep_hours numeric,
  exercise_frequency text,
  screen_time_hours numeric,
  stress_level int check (stress_level between 1 and 5),
  mood text,
  caffeine_today boolean,
  created_at timestamptz not null default now()
);

create index if not exists idx_session_intake_participant_id on session_intake (participant_id);

-- Static reference data describing each cognitive test. Seeded below.
create table if not exists test_definitions (
  id text primary key,
  name text not null,
  domain text not null,
  description text not null,
  scientific_explanation text not null,
  avg_duration_seconds int not null,
  difficulty text not null
);

-- One row per completed test attempt.
create table if not exists test_results (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid not null references participants (id) on delete cascade,
  test_id text not null references test_definitions (id),
  raw_metrics jsonb not null,
  domain_scores jsonb not null,
  completed_at timestamptz not null default now()
);

create index if not exists idx_test_results_participant_id on test_results (participant_id);
create index if not exists idx_test_results_test_id on test_results (test_id);

-- AI-generated insight reports (Features 1/2/3 combined).
create table if not exists ai_reports (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid not null references participants (id) on delete cascade,
  test_result_ids uuid[] not null,
  report_json jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_ai_reports_participant_id on ai_reports (participant_id);

-- All access goes through Next.js route handlers using the service role key,
-- which bypasses RLS. Deny-all policies below are a defense-in-depth backstop
-- against the anon/authenticated keys ever being used directly against these tables.
alter table participants enable row level security;
alter table session_intake enable row level security;
alter table test_definitions enable row level security;
alter table test_results enable row level security;
alter table ai_reports enable row level security;

drop policy if exists "deny all participants" on participants;
create policy "deny all participants" on participants for all using (false);

drop policy if exists "deny all session_intake" on session_intake;
create policy "deny all session_intake" on session_intake for all using (false);

drop policy if exists "public read test_definitions" on test_definitions;
create policy "public read test_definitions" on test_definitions for select using (true);

drop policy if exists "deny all test_results" on test_results;
create policy "deny all test_results" on test_results for all using (false);

drop policy if exists "deny all ai_reports" on ai_reports;
create policy "deny all ai_reports" on ai_reports for all using (false);

-- Seed the 4 MVP tests. Safe to re-run.
insert into test_definitions (id, name, domain, description, scientific_explanation, avg_duration_seconds, difficulty)
values
  (
    'simple-reaction-time',
    'Simple Reaction Time',
    'reaction_time',
    'Tap as soon as a shape appears on screen.',
    'Simple reaction time reflects the speed of the basic sensorimotor pathway from visual detection to motor response, and is widely used as a baseline measure of processing speed in cognitive psychology.',
    60,
    'Easy'
  ),
  (
    'stroop-test',
    'Stroop Test',
    'attention',
    'Name the ink color of a word, ignoring what the word says.',
    'The Stroop effect demonstrates interference between automatic word-reading and deliberate color-naming, and is a classic measure of selective attention and executive inhibitory control.',
    120,
    'Medium'
  ),
  (
    'n-back',
    'N-back',
    'working_memory',
    'Decide whether the current item matches the one shown N steps earlier.',
    'The N-back task requires continuously updating and monitoring items held in working memory, making it a standard laboratory measure of working memory capacity and executive updating.',
    150,
    'Hard'
  ),
  (
    'digit-span',
    'Digit Span',
    'processing_speed',
    'Recall an increasingly long sequence of digits in order.',
    'Digit span is a classic measure of short-term memory span; performance reflects how much verbal information can be held and immediately reproduced.',
    90,
    'Medium'
  )
on conflict (id) do update set
  name = excluded.name,
  domain = excluded.domain,
  description = excluded.description,
  scientific_explanation = excluded.scientific_explanation,
  avg_duration_seconds = excluded.avg_duration_seconds,
  difficulty = excluded.difficulty;
