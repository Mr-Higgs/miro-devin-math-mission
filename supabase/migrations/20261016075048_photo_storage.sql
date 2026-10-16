-- Private storage for uploaded photos, PDFs and screenshots (decisions 006, 007).
--
-- * The bucket is private: files are only reachable through short-lived
--   signed links made by the server.
-- * Files live under a folder named after the adult's user id:
--     <user_id>/assignments/<assignment_id>/<page>.jpg
--     <user_id>/submissions/<submission_id>/<page>.jpg
--   and an adult can only reach files in their own folder.
-- * Files are deleted when the session ends, or 30 days after upload
--   (daily job, Phase 2). Metadata such as GPS is stripped before upload.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'uploads',
  'uploads',
  false,
  20 * 1024 * 1024, -- 20 MB per file
  array['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif', 'application/pdf']
);

create policy "Adults can upload to their own folder"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'uploads'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and (select private.is_onboarded())
  );

create policy "Adults can read their own files"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'uploads'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and (select private.is_onboarded())
  );

create policy "Adults can delete their own files"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'uploads'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

-- No update policy: a changed photo is a new upload.
