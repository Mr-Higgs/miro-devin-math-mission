-- Core schema: backend doc §3 (data model), decisions 003, 006, 010 and 011.
--
-- Who can see what:
--   * Every table has row-level security (RLS) on.
--   * Every row carries user_id, and an adult can only reach their own rows.
--   * Child rows are tied to their parent AND the same user_id by composite
--     foreign keys, so no one can attach a row to someone else's record.
--   * Nothing is reachable until the adult has confirmed they are 18+ and
--     accepted the terms (decision 011).
--   * Signed-out visitors (the "anon" role) get nothing.
-- Server jobs that must see everything (the daily photo cleanup) use the
-- secret key, which skips RLS.

-- ---------------------------------------------------------------------------
-- Helpers, in a schema the public API doesn't expose
-- ---------------------------------------------------------------------------
create schema if not exists private;
grant usage on schema private to authenticated;

create function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Choice lists
-- ---------------------------------------------------------------------------
create type public.extraction_status as enum ('pending', 'processing', 'done', 'failed');
create type public.question_format as enum ('multiple_choice', 'multiple_select', 'fill_in', 'open_response');
create type public.session_status as enum ('in_progress', 'completed');
-- Result of the math checks on a generated question (decision 010)
create type public.check_status as enum ('passed', 'flagged', 'tutor_edited');
-- Grading results (decision 003); matches web/src/lib/grading.ts
create type public.grade_result as enum ('pass', 'redo', 'needs_check', 'skipped');
create type public.progress_status as enum ('pending', 'pass', 'redo', 'needs_check', 'skipped');

-- ---------------------------------------------------------------------------
-- 1. Profiles: one per adult user (the login itself is Supabase Auth)
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  invited_by uuid references auth.users (id) on delete set null,
  age_confirmed_at timestamptz, -- "I am 18 or older" (decision 011)
  terms_accepted_at timestamptz,
  terms_version text,
  created_at timestamptz not null default now()
);
comment on table public.profiles is
  'One row per adult user. Email lives in auth.users. There are no student accounts (decision 011).';

-- True once the signed-in adult has confirmed 18+ and accepted the terms.
-- SECURITY DEFINER so it can read profiles from inside other tables' rules.
create function private.is_onboarded()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
      and age_confirmed_at is not null
      and terms_accepted_at is not null
  );
$$;
revoke execute on function private.is_onboarded() from public;
grant execute on function private.is_onboarded() to authenticated;

-- Make a profile row for every new login.
create function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id) values (new.id);
  return new;
end;
$$;
revoke execute on function private.handle_new_user() from public;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function private.handle_new_user();

alter table public.profiles enable row level security;

create policy "Adults can read their own profile"
  on public.profiles for select to authenticated
  using (id = (select auth.uid()));

create policy "Adults can update their own profile"
  on public.profiles for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- Adults may only record their own confirmations; invited_by is set by the server.
revoke all on public.profiles from anon, authenticated;
grant select on public.profiles to authenticated;
grant update (age_confirmed_at, terms_accepted_at, terms_version) on public.profiles to authenticated;

-- ---------------------------------------------------------------------------
-- 2. Assignments: the original graded test
-- ---------------------------------------------------------------------------
create table public.assignments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  student_nickname text not null check (char_length(student_nickname) between 1 and 40),
  assignment_name text check (char_length(assignment_name) <= 120),
  extraction_status public.extraction_status not null default 'pending',
  created_at timestamptz not null default now(),
  unique (id, user_id)
);
comment on column public.assignments.student_nickname is
  'Entered by the adult. Never the real name from the paper (decisions 006, 011).';
create index on public.assignments (user_id, created_at desc);

-- ---------------------------------------------------------------------------
-- 3. Assignment pages: one uploaded photo / PDF page / screenshot
--    The file is deleted under decision 006; the row stays with deleted_at set.
-- ---------------------------------------------------------------------------
create table public.assignment_pages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid(),
  assignment_id uuid not null,
  page_order integer not null check (page_order >= 1),
  file_path text not null, -- path in the private "uploads" storage bucket
  file_type text not null,
  uploaded_at timestamptz not null default now(),
  deleted_at timestamptz,
  foreign key (assignment_id, user_id) references public.assignments (id, user_id) on delete cascade,
  unique (assignment_id, page_order)
);
create index assignment_pages_due_for_deletion on public.assignment_pages (uploaded_at) where deleted_at is null;

-- ---------------------------------------------------------------------------
-- 4. Extraction results: the AI's reading of the whole assignment
-- ---------------------------------------------------------------------------
create table public.extraction_results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid(),
  assignment_id uuid not null,
  model_used text not null,
  extraction_confidence numeric(3, 2) check (extraction_confidence between 0 and 1),
  notes text,
  created_at timestamptz not null default now(),
  foreign key (assignment_id, user_id) references public.assignments (id, user_id) on delete cascade
);
create index on public.extraction_results (assignment_id);

-- ---------------------------------------------------------------------------
-- 5. Questions: one question as it appeared on the original test
-- ---------------------------------------------------------------------------
create table public.questions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid(),
  assignment_id uuid not null,
  position integer not null check (position >= 1), -- order on the page
  question_number text not null, -- as printed: "4", "4a"
  original_question_text text not null,
  format public.question_format not null,
  choices jsonb, -- {"A": "800", "B": "80"} or null
  picture_description text,
  question_type text, -- e.g. "value_of_digit"
  student_answer text,
  correct_answer text,
  points_possible numeric(5, 2),
  points_earned numeric(5, 2), -- partial credit allowed
  marked_correct boolean not null,
  requires_work boolean not null default false, -- adult can change it (003 Amendment 1)
  confidence numeric(3, 2) check (confidence between 0 and 1),
  added_by_tutor boolean not null default false, -- a question the AI missed
  created_at timestamptz not null default now(),
  foreign key (assignment_id, user_id) references public.assignments (id, user_id) on delete cascade,
  unique (id, user_id)
);
create index on public.questions (assignment_id, position);

-- ---------------------------------------------------------------------------
-- 6. Sessions: one tutoring workflow for one assignment
--    completed_at starts photo deletion (decision 006).
-- ---------------------------------------------------------------------------
create table public.sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid(),
  assignment_id uuid not null,
  status public.session_status not null default 'in_progress',
  started_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz,
  foreign key (assignment_id, user_id) references public.assignments (id, user_id) on delete cascade,
  unique (id, user_id),
  check ((status = 'completed') = (completed_at is not null))
);
create index on public.sessions (assignment_id);
create index on public.sessions (user_id, updated_at desc);
create trigger sessions_updated_at before update on public.sessions
  for each row execute function private.set_updated_at();

-- ---------------------------------------------------------------------------
-- 7. Generated questions: the practice version of one missed question
--    (decision 010). Also the answer key; there's no separate table for it.
-- ---------------------------------------------------------------------------
create table public.generated_questions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid(),
  session_id uuid not null,
  question_id uuid not null,
  position integer not null check (position >= 1), -- same order as the original
  question_text text not null,
  choices jsonb,
  picture_spec jsonb, -- diagram as data, drawn and checked by the app (010)
  correct_answer text not null,
  steps_to_solve text,
  hint text, -- written for the adult (011)
  requires_work boolean not null default false,
  check_status public.check_status not null,
  generation_attempts integer not null default 1 check (generation_attempts >= 1),
  created_at timestamptz not null default now(),
  foreign key (session_id, user_id) references public.sessions (id, user_id) on delete cascade,
  foreign key (question_id, user_id) references public.questions (id, user_id) on delete cascade,
  unique (id, user_id)
);
create index on public.generated_questions (session_id, position);
create index on public.generated_questions (question_id);

-- ---------------------------------------------------------------------------
-- 8. Student submissions: one upload of the student's finished work
-- ---------------------------------------------------------------------------
create table public.student_submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid(),
  session_id uuid not null,
  attempt_number integer not null check (attempt_number >= 1),
  uploaded_at timestamptz not null default now(),
  foreign key (session_id, user_id) references public.sessions (id, user_id) on delete cascade,
  unique (id, user_id)
);
create index on public.student_submissions (session_id);

-- ---------------------------------------------------------------------------
-- 9. Submission pages: one photo / PDF page / screenshot in a submission
-- ---------------------------------------------------------------------------
create table public.submission_pages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid(),
  submission_id uuid not null,
  page_order integer not null check (page_order >= 1),
  file_path text not null,
  file_type text not null,
  uploaded_at timestamptz not null default now(),
  deleted_at timestamptz,
  foreign key (submission_id, user_id) references public.student_submissions (id, user_id) on delete cascade,
  unique (submission_id, page_order)
);
create index submission_pages_due_for_deletion on public.submission_pages (uploaded_at) where deleted_at is null;

-- ---------------------------------------------------------------------------
-- 10. Attempts: the grading result for one practice question from one upload
-- ---------------------------------------------------------------------------
create table public.attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid(),
  submission_id uuid not null,
  generated_question_id uuid not null,
  ai_result public.grade_result not null,
  student_answer_read text,
  work_shown boolean,
  feedback text, -- a note for the adult, never addressed to the student (011)
  final_result public.grade_result not null, -- ai_result unless the adult overrode it
  overridden_by_tutor boolean not null default false,
  created_at timestamptz not null default now(),
  foreign key (submission_id, user_id) references public.student_submissions (id, user_id) on delete cascade,
  foreign key (generated_question_id, user_id) references public.generated_questions (id, user_id) on delete cascade,
  unique (submission_id, generated_question_id)
);
create index on public.attempts (generated_question_id);

-- ---------------------------------------------------------------------------
-- 11. Session progress: current status of each practice question
-- ---------------------------------------------------------------------------
create table public.session_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid(),
  session_id uuid not null,
  generated_question_id uuid not null unique,
  status public.progress_status not null default 'pending',
  attempts_count integer not null default 0 check (attempts_count >= 0),
  stars_awarded numeric(3, 1) not null default 0 check (stars_awarded >= 0), -- +0.5 for a pass on a retry
  updated_at timestamptz not null default now(),
  foreign key (session_id, user_id) references public.sessions (id, user_id) on delete cascade,
  foreign key (generated_question_id, user_id) references public.generated_questions (id, user_id) on delete cascade
);
create index on public.session_progress (session_id);
create trigger session_progress_updated_at before update on public.session_progress
  for each row execute function private.set_updated_at();

-- (12. Validation rules are TypeScript code, not a table. 13. Problem-area
-- tags are v2 and get their own migration when needed.)

-- ---------------------------------------------------------------------------
-- Row-level security for every user-owned table
-- ---------------------------------------------------------------------------
do $$
declare
  t text;
begin
  foreach t in array array[
    'assignments', 'assignment_pages', 'extraction_results', 'questions', 'sessions',
    'generated_questions', 'student_submissions', 'submission_pages', 'attempts', 'session_progress'
  ]
  loop
    execute format('alter table public.%I enable row level security', t);
    execute format('revoke all on public.%I from anon', t);
    execute format(
      'create policy "Adults can manage their own rows" on public.%I for all to authenticated '
      'using (user_id = (select auth.uid()) and (select private.is_onboarded())) '
      'with check (user_id = (select auth.uid()) and (select private.is_onboarded()))',
      t
    );
  end loop;
end;
$$;
