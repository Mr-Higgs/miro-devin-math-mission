-- Reading the test (extraction), Phase 2.
--
-- * assignment_pages.rotation: which way each photo is turned, reported by the
--   AI while it reads the test, so the app shows every page upright with no
--   rotate buttons for the adult (decided 2026-10-19).
-- * assignments.extraction_started_at / extraction_error: lets the app tell
--   "still reading" from "stuck" (and retry), and say why reading failed.
-- Existing rows keep working: rotation defaults to 0 (as taken).

alter table public.assignment_pages
  add column rotation smallint not null default 0
    check (rotation in (0, 90, 180, 270));

comment on column public.assignment_pages.rotation is
  'Degrees to turn the photo clockwise so the text reads upright. Set by extraction.';

alter table public.assignments
  add column extraction_started_at timestamptz,
  add column extraction_error text check (char_length(extraction_error) <= 500);
