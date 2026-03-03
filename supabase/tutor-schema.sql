-- ============================================================
-- Tutor Feature — Database Schema
-- Run this in the Supabase SQL editor after the main schema
-- ============================================================

-- Tutor lessons (static seed data — one row per lesson)
create table if not exists tutor_lessons (
  id           text primary key,
  title        text not null,
  lesson_order integer not null,
  concept_tags text[] not null default '{}',
  unlocked_by  text references tutor_lessons(id)
);

-- Tutor progress (one row per user per lesson)
create table if not exists tutor_progress (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references users(id) on delete cascade,
  lesson_id    text not null references tutor_lessons(id) on delete cascade,
  completed    boolean not null default false,
  score        integer not null default 0,
  max_score    integer not null default 0,
  attempts     integer not null default 0,
  last_attempt timestamptz,
  xp_earned    integer not null default 0,
  unique(user_id, lesson_id)
);

-- Tutor concept scores (one row per user per concept tag)
create table if not exists tutor_concept_scores (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references users(id) on delete cascade,
  concept_tag   text not null,
  times_tested  integer not null default 0,
  times_correct integer not null default 0,
  mastery_pct   integer generated always as (
    case when times_tested = 0 then 0
    else (times_correct * 100 / times_tested)
    end
  ) stored,
  last_updated  timestamptz default now(),
  unique(user_id, concept_tag)
);

-- Indexes
create index if not exists idx_tutor_progress_user on tutor_progress(user_id);
create index if not exists idx_tutor_progress_lesson on tutor_progress(lesson_id);
create index if not exists idx_tutor_concept_scores_user on tutor_concept_scores(user_id);
create index if not exists idx_tutor_concept_scores_mastery on tutor_concept_scores(user_id, mastery_pct);

-- ============================================================
-- SEED: Tutor Lessons
-- ============================================================

insert into tutor_lessons (id, title, lesson_order, concept_tags, unlocked_by) values
  ('estar-intro',       'What does estar mean?',          1, ARRAY['estar-meaning', 'estar-conjugation-eu', 'estar-conjugation-voce'], null),
  ('ter-intro',         'Saying what you have',           2, ARRAY['ter-meaning', 'ter-conjugation-eu', 'ter-conjugation-voce'], null),
  ('ir-intro',          'Going places with ir',           3, ARRAY['ir-meaning', 'ir-conjugation-eu', 'ir-conjugation-voce'], null),
  ('querer-intro',      'Saying what you want',           4, ARRAY['querer-meaning', 'querer-conjugation-eu', 'querer-conjugation-voce'], null),
  ('fazer-intro',       'Doing things with fazer',        5, ARRAY['fazer-meaning', 'fazer-conjugation-eu', 'fazer-conjugation-voce'], null),
  ('full-conjugation',  'All forms of all five',          6, ARRAY['conjugation-nos', 'conjugation-eles', 'conjugation-review'], 'fazer-intro'),
  ('negation',          'Making sentences negative',      7, ARRAY['negation-basic', 'negation-with-big-five'], 'full-conjugation'),
  ('ir-future',         'Talking about your plans',       8, ARRAY['ir-future', 'ir-future-with-fazer', 'ir-future-with-querer'], 'negation'),
  ('combining',         'Chaining two verbs together',    9, ARRAY['verb-chaining-querer', 'verb-chaining-ter-que'], 'ir-future'),
  ('real-conversation', 'Putting it all together',       10, ARRAY['full-review', 'real-context-mychelle', 'real-context-felipe', 'real-context-wedding'], 'combining')
on conflict (id) do nothing;
