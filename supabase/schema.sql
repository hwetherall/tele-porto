-- ============================================================
-- Tele-Porto Database Schema
-- Run this in the Supabase SQL editor to create all tables
-- ============================================================

-- Enable UUID generation
create extension if not exists "pgcrypto";

-- ============================================================
-- ENUMS
-- ============================================================

do $$ begin
  create type phrase_category as enum (
    'household', 'work', 'wedding', 'big_five', 'custom', 'general'
  );
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type scenario_pack as enum ('household', 'work', 'wedding');
exception
  when duplicate_object then null;
end $$;

-- ============================================================
-- TABLES
-- ============================================================

-- Users (Harry and Ky)
create table if not exists users (
  id           uuid primary key default gen_random_uuid(),
  name         text not null unique,
  xp           integer not null default 0,
  level        integer not null default 1,
  streak_count integer not null default 0,
  last_active  date,
  journey_stage integer not null default 1,
  created_at   timestamptz default now()
);

-- Phrases (the learning content)
create table if not exists phrases (
  id          uuid primary key default gen_random_uuid(),
  portuguese  text not null,
  english     text not null,
  category    phrase_category not null,
  audio_url   text,
  created_by  text,
  created_at  timestamptz default now()
);

-- Spaced repetition card state per user per phrase
create table if not exists sr_cards (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references users(id) on delete cascade,
  phrase_id      uuid not null references phrases(id) on delete cascade,
  box            integer not null default 1 check (box between 1 and 6),
  next_review    date not null default current_date,
  ease_factor    numeric(4,2) not null default 2.5,
  interval_days  integer not null default 0,
  times_seen     integer not null default 0,
  times_correct  integer not null default 0,
  created_at     timestamptz default now(),
  unique(user_id, phrase_id)
);

-- Scenario definitions
create table if not exists scenarios (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  description  text not null,
  pack         scenario_pack not null,
  unlock_level integer not null default 1,
  system_prompt text not null,
  created_at   timestamptz default now()
);

-- Session logs for XP tracking and streaks
create table if not exists session_logs (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references users(id) on delete cascade,
  date            timestamptz not null default now(),
  cards_reviewed  integer not null default 0,
  cards_correct   integer not null default 0,
  xp_earned       integer not null default 0,
  scenario_played text,
  created_at      timestamptz default now()
);

-- ============================================================
-- INDEXES
-- ============================================================

create index if not exists idx_sr_cards_user_id on sr_cards(user_id);
create index if not exists idx_sr_cards_next_review on sr_cards(next_review);
create index if not exists idx_sr_cards_user_due on sr_cards(user_id, next_review);
create index if not exists idx_session_logs_user_date on session_logs(user_id, date);
create index if not exists idx_phrases_category on phrases(category);
