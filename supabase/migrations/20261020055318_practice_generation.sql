-- Writing the practice set (Step 3, decision 010).
--
-- * sessions.practice_status / practice_started_at / practice_error: lets the
--   app tell "still writing" from "stuck" (and retry), and say why it failed.
-- * generated_questions.answer_check: the calculation the AI gave with each
--   practice question, so the app's math checks can be run again later
--   (e.g. after the adult edits a question).
-- * generated_questions.check_notes: why a question was flagged, shown to the adult.
-- Existing rows keep working (defaults / nulls).

create type public.practice_status as enum ('none', 'generating', 'ready', 'failed');

alter table public.sessions
  add column practice_status public.practice_status not null default 'none',
  add column practice_started_at timestamptz,
  add column practice_error text check (char_length(practice_error) <= 500);

alter table public.generated_questions
  add column answer_check jsonb,
  add column check_notes text check (char_length(check_notes) <= 1000);

comment on column public.generated_questions.answer_check is
  'The AI''s check for its answer (arithmetic expression or clue constraints), verified by web/src/lib/checks.';
