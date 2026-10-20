-- The total score the teacher wrote on the test, as read by the AI.
-- The app checks it against the questions as read: if the points don't add
-- up, it warns the adult on Step 2 which questions to look at (2026-10-19,
-- after misreadings on phone photos). Kept exactly as written ("55", "8/10").

alter table public.extraction_results
  add column score_as_written text check (char_length(score_as_written) <= 40);

comment on column public.extraction_results.score_as_written is
  'Total score written on the paper by the teacher, as read by the AI. Null if none was found.';
