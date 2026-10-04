-- Create the article-images bucket (run if you only need the bucket fix)
-- Safe to re-run.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'article-images',
  'article-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Public read
drop policy if exists "Public read article images" on storage.objects;
create policy "Public read article images"
  on storage.objects for select
  using (bucket_id = 'article-images');

-- Admin upload / update / delete
drop policy if exists "Admin upload article images" on storage.objects;
create policy "Admin upload article images"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'article-images' and public.is_admin());

drop policy if exists "Admin update article images" on storage.objects;
create policy "Admin update article images"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'article-images' and public.is_admin())
  with check (bucket_id = 'article-images' and public.is_admin());

drop policy if exists "Admin delete article images" on storage.objects;
create policy "Admin delete article images"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'article-images' and public.is_admin());
