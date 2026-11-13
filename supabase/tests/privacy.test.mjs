// Privacy test for the database migrations.
// Builds a throwaway in-memory Postgres (PGlite) with small stand-ins for what
// Supabase provides (anon/authenticated roles, auth.users, auth.uid(), storage),
// applies every file in supabase/migrations/ in order, then checks the
// row-level security rules: each adult sees and changes only their own data.
//
// Run from docs/web/:  npm run db:test   (before every npm run db:push)
// Each new migration's privacy checks get added to this file.
// Exits non-zero if any check fails.

import { createRequire } from "node:module";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const { PGlite } = createRequire(join(process.cwd(), "package.json"))("@electric-sql/pglite");
const MIG = process.argv[2] ?? "../../supabase/migrations";
const db = new PGlite();

// Minimal stand-ins for what Supabase provides.
await db.exec(`
  create role anon nologin; create role authenticated nologin;
  create schema auth; create schema storage;
  grant usage on schema auth, storage, public to anon, authenticated;
  create table auth.users (id uuid primary key, email text);
  create function auth.uid() returns uuid language sql stable as
    $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
  grant execute on function auth.uid() to anon, authenticated;
  create table storage.buckets (id text primary key, name text, public boolean, file_size_limit bigint, allowed_mime_types text[]);
  create table storage.objects (id uuid primary key default gen_random_uuid(), bucket_id text, name text);
  alter table storage.objects enable row level security;
  grant all on storage.objects to authenticated;
  create function storage.foldername(name text) returns text[] language sql immutable as
    $$ select (string_to_array(name, '/'))[1:array_length(string_to_array(name, '/'), 1) - 1] $$;
  grant execute on function storage.foldername(text) to authenticated;
  -- Supabase's default: API roles get table privileges in public; RLS decides rows.
  alter default privileges in schema public grant all on tables to anon, authenticated;
`);

for (const f of readdirSync(MIG).sort()) {
  await db.exec(readFileSync(join(MIG, f), "utf8"));
  console.log("applied", f);
}

const A = "00000000-0000-0000-0000-00000000000a";
const B = "00000000-0000-0000-0000-00000000000b";
await db.exec(`insert into auth.users values ('${A}','a@x'), ('${B}','b@x');`);

let pass = 0, fail = 0;
const check = (name, ok, extra = "") => { ok ? pass++ : fail++; console.log(`${ok ? "PASS" : "FAIL"} ${name}${extra ? " — " + extra : ""}`); };

async function as(user, sql) {
  await db.exec("reset role");
  await db.exec(`select set_config('request.jwt.claim.sub', '${user ?? ""}', false)`);
  await db.exec(`set role ${user ? "authenticated" : "anon"}`);
  try { return { rows: (await db.query(sql)).rows }; }
  catch (e) { return { error: e.message }; }
  finally { await db.exec("reset role"); }
}

let r;
r = await db.query("select count(*)::int n from public.profiles");
check("trigger made a profile per new user", r.rows[0].n === 2);

r = await as(A, `insert into public.assignments (student_nickname) values ('G') returning id`);
check("not-yet-onboarded adult can't create data", !!r.error, r.error);

r = await as(A, `update public.profiles set age_confirmed_at = now(), terms_accepted_at = now(), terms_version = 'v1' where id = '${A}' returning id`);
check("adult can record own 18+ and terms", r.rows?.length === 1, r.error);

r = await as(A, `update public.profiles set invited_by = '${B}' where id = '${A}'`);
check("adult can't change invited_by", !!r.error, r.error);

r = await as(A, `update public.profiles set terms_accepted_at = now() where id = '${B}' returning id`);
check("adult can't change another profile", r.rows?.length === 0, r.error);

r = await as(A, `insert into public.assignments (student_nickname, assignment_name) values ('G', 'Topic 10 quiz') returning id, user_id`);
check("onboarded adult can create an assignment", r.rows?.length === 1 && r.rows[0].user_id === A, r.error);
const asgn = r.rows?.[0]?.id;

r = await as(A, `
  with q as (insert into public.questions (assignment_id, position, question_number, original_question_text, format, marked_correct)
             values ('${asgn}', 1, '10', 'Value of the 8 in 287?', 'multiple_choice', false) returning id),
       s as (insert into public.sessions (assignment_id) values ('${asgn}') returning id)
  select (select id from q) q, (select id from s) s`);
check("adult can add questions and a session", !!r.rows?.[0]?.q && !!r.rows?.[0]?.s, r.error);
const { q, s } = r.rows?.[0] ?? {};

r = await as(A, `insert into public.generated_questions (session_id, question_id, position, question_text, correct_answer, check_status)
                 values ('${s}', '${q}', 1, 'Value of the 5 in 352?', 'B', 'passed') returning id`);
check("adult can add a generated question", r.rows?.length === 1, r.error);
const gq = r.rows?.[0]?.id;

r = await as(A, `with sub as (insert into public.student_submissions (session_id, attempt_number) values ('${s}', 1) returning id)
                 insert into public.attempts (submission_id, generated_question_id, ai_result, final_result)
                 select id, '${gq}', 'needs_check', 'needs_check' from sub returning id`);
check("adult can add a submission and attempt", r.rows?.length === 1, r.error);

r = await as(A, `insert into public.session_progress (session_id, generated_question_id, status, stars_awarded) values ('${s}', '${gq}', 'pass', 1.5) returning id`);
check("adult can track progress (half stars)", r.rows?.length === 1, r.error);

// Other adult
await as(B, `update public.profiles set age_confirmed_at = now(), terms_accepted_at = now() where id = '${B}'`);
r = await as(B, `select count(*)::int n from public.assignments`);
check("another adult sees none of A's assignments", r.rows?.[0]?.n === 0, r.error);
r = await as(B, `select count(*)::int n from public.questions`);
check("another adult sees none of A's questions", r.rows?.[0]?.n === 0, r.error);
r = await as(B, `insert into public.sessions (assignment_id) values ('${asgn}')`);
check("another adult can't attach a session to A's assignment", !!r.error, r.error);
r = await as(B, `insert into public.assignments (user_id, student_nickname) values ('${A}', 'X')`);
check("another adult can't create rows as A", !!r.error, r.error);
r = await as(B, `delete from public.assignments where id = '${asgn}' returning id`);
check("another adult can't delete A's assignment", r.rows?.length === 0, r.error);

r = await as(null, `select count(*)::int n from public.assignments`);
check("signed-out visitor is refused", !!r.error, r.error);

r = await as(A, `update public.sessions set status = 'completed' where id = '${s}'`);
check("completed session must have completed_at", !!r.error, r.error);
r = await as(A, `update public.sessions set status = 'completed', completed_at = now() where id = '${s}' returning updated_at > started_at as bumped`);
check("completing a session works and bumps updated_at", r.rows?.[0]?.bumped === true, r.error);

r = await as(A, `insert into public.assignments (student_nickname) values ('')`);
check("empty nickname rejected", !!r.error, r.error);

// Storage
r = await as(A, `insert into storage.objects (bucket_id, name) values ('uploads', '${A}/assignments/${asgn}/1.jpg') returning id`);
check("adult can upload into own folder", r.rows?.length === 1, r.error);
r = await as(A, `insert into storage.objects (bucket_id, name) values ('uploads', '${B}/assignments/x/1.jpg')`);
check("adult can't upload into another's folder", !!r.error, r.error);
r = await as(B, `select count(*)::int n from storage.objects`);
check("another adult can't see A's files", r.rows?.[0]?.n === 0, r.error);
r = await db.query(`select public, file_size_limit from storage.buckets where id = 'uploads'`);
check("uploads bucket is private", r.rows[0]?.public === false);

// Page rotation and extraction progress (migration extraction_progress)
r = await as(A, `insert into public.assignment_pages (assignment_id, page_order, file_path, file_type, rotation)
                 values ('${asgn}', 1, '${A}/assignments/${asgn}/page-1.jpg', 'image/jpeg', 180) returning rotation`);
check("adult can save a page turned 180", r.rows?.[0]?.rotation === 180, r.error);
r = await as(A, `update public.assignment_pages set rotation = 45 where assignment_id = '${asgn}'`);
check("rotation must be 0, 90, 180 or 270", !!r.error, r.error);
r = await as(B, `update public.assignment_pages set rotation = 90 where assignment_id = '${asgn}' returning id`);
check("another adult can't turn A's pages", r.rows?.length === 0, r.error);
r = await as(A, `update public.assignments set extraction_status = 'processing', extraction_started_at = now() where id = '${asgn}' returning id`);
check("adult can mark their test as being read", r.rows?.length === 1, r.error);

// Score on the paper (migration score_on_paper)
r = await as(A, `insert into public.extraction_results (assignment_id, model_used, score_as_written) values ('${asgn}', 'test', '55') returning score_as_written`);
check("adult can save the score read from the paper", r.rows?.[0]?.score_as_written === "55", r.error);
r = await as(B, `select count(*)::int n from public.extraction_results`);
check("another adult can't see A's score", r.rows?.[0]?.n === 0, r.error);

// Practice generation (migration practice_generation)
r = await as(A, `insert into public.sessions (assignment_id, practice_status, practice_started_at) values ('${asgn}', 'generating', now()) returning id`);
check("adult can mark a practice set as being written", r.rows?.length === 1, r.error);
const s2 = r.rows?.[0]?.id;
r = await as(A, `insert into public.questions (assignment_id, position, question_number, original_question_text, format, marked_correct)
                 values ('${asgn}', 2, '2', 'Q', 'fill_in', false) returning id`);
const q2 = r.rows?.[0]?.id;
r = await as(A, `insert into public.generated_questions (session_id, question_id, position, question_text, correct_answer, check_status, answer_check, check_notes)
                 values ('${s2}', '${q2}', 1, 'New Q', '7', 'flagged', '{"kind":"arithmetic","expression":"3 + 4"}', 'Check failed') returning answer_check->>'kind' as kind`);
check("adult can save a practice question with its check", r.rows?.[0]?.kind === "arithmetic", r.error);
r = await as(B, `select count(*)::int n from public.generated_questions`);
check("another adult can't see A's practice questions", r.rows?.[0]?.n === 0, r.error);
r = await as(B, `update public.sessions set practice_status = 'ready' where id = '${s2}' returning id`);
check("another adult can't change A's practice status", r.rows?.length === 0, r.error);

// Deleting the user removes everything
await db.exec(`delete from auth.users where id = '${A}'`);
r = await db.query(`select (select count(*) from public.assignments) + (select count(*) from public.attempts) + (select count(*) from public.session_progress) as n`);
check("deleting an account removes all its rows", Number(r.rows[0].n) === 0);

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
