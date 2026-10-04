-- Slice: article covers + quizzes belong to articles (not lessons)
-- REVIEW, then run once in Supabase SQL Editor.
--
-- Before running:
-- 1) Create a Storage bucket named: article-images
--    - Public bucket: YES (so covers can load on the public site)
-- 2) Then run the storage policies at the bottom (or set equivalent in UI).

begin;

-- ---------------------------------------------------------------------------
-- 1) Cover image path on articles (path inside the article-images bucket)
-- ---------------------------------------------------------------------------
alter table public.articles
  add column if not exists cover_path text;

comment on column public.articles.cover_path is
  'Path inside storage bucket article-images, e.g. <article-id>/cover.jpg';

-- ---------------------------------------------------------------------------
-- 2) Move quizzes from lessons → articles
--    WARNING: existing lesson-linked quizzes will lose lesson_id.
--    If you already created lesson quizzes you care about, stop and tell me.
-- ---------------------------------------------------------------------------
alter table public.quizzes
  add column if not exists article_id uuid references public.articles (id) on delete cascade;

-- Drop old unique constraint on lesson_id if present (name may vary)
do $$
declare
  cname text;
begin
  select conname into cname
  from pg_constraint
  where conrelid = 'public.quizzes'::regclass
    and contype = 'u'
    and pg_get_constraintdef(oid) ilike '%lesson_id%';
  if cname is not null then
    execute format('alter table public.quizzes drop constraint %I', cname);
  end if;
end $$;

alter table public.quizzes drop column if exists lesson_id;

create unique index if not exists quizzes_article_id_uidx
  on public.quizzes (article_id);

-- article_id required for new rows going forward (allow null only if empty legacy rows)
-- Uncomment after any leftover null rows are cleaned:
-- alter table public.quizzes alter column article_id set not null;

commit;

-- ---------------------------------------------------------------------------
-- 3) Replace save_quiz to use article_id (SECURITY INVOKER + is_admin)
-- ---------------------------------------------------------------------------
create or replace function public.save_quiz(payload jsonb)
returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_quiz_id uuid;
  v_article_id uuid;
  v_title text;
  v_is_published boolean;
  v_question jsonb;
  v_option jsonb;
  v_question_id uuid;
  v_option_id uuid;
  v_deleted_question_id uuid;
  v_deleted_option_id uuid;
  v_position int;
  v_result jsonb;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  if not public.is_admin() then
    raise exception 'Only admins can save quizzes';
  end if;

  v_article_id := nullif(payload->>'article_id', '')::uuid;
  if v_article_id is null then
    raise exception 'article_id is required';
  end if;

  v_title := nullif(trim(payload->>'title'), '');
  if v_title is null then
    raise exception 'Quiz title is required';
  end if;

  v_is_published := coalesce((payload->>'is_published')::boolean, false);
  v_quiz_id := nullif(payload->>'quiz_id', '')::uuid;

  if v_quiz_id is null then
    insert into public.quizzes (article_id, title, is_published)
    values (v_article_id, v_title, v_is_published)
    returning id into v_quiz_id;
  else
    update public.quizzes
    set
      title = v_title,
      is_published = v_is_published,
      article_id = v_article_id
    where id = v_quiz_id;

    if not found then
      raise exception 'Quiz not found';
    end if;
  end if;

  if payload ? 'deleted_option_ids' then
    for v_deleted_option_id in
      select nullif(value::text, 'null')::uuid
      from jsonb_array_elements_text(payload->'deleted_option_ids')
      where nullif(value::text, 'null') is not null
    loop
      delete from public.options
      where id = v_deleted_option_id
        and question_id in (
          select id from public.questions where quiz_id = v_quiz_id
        );
    end loop;
  end if;

  if payload ? 'deleted_question_ids' then
    for v_deleted_question_id in
      select nullif(value::text, 'null')::uuid
      from jsonb_array_elements_text(payload->'deleted_question_ids')
      where nullif(value::text, 'null') is not null
    loop
      delete from public.questions
      where id = v_deleted_question_id
        and quiz_id = v_quiz_id;
    end loop;
  end if;

  if payload ? 'questions' then
    for v_question in
      select value from jsonb_array_elements(payload->'questions')
    loop
      v_question_id := nullif(v_question->>'id', '')::uuid;
      v_position := coalesce((v_question->>'position')::int, 0);

      if nullif(trim(v_question->>'prompt'), '') is null then
        raise exception 'Every question needs a prompt';
      end if;

      if v_question_id is null then
        insert into public.questions (quiz_id, position, prompt, type)
        values (
          v_quiz_id,
          v_position,
          trim(v_question->>'prompt'),
          coalesce(nullif(v_question->>'type', ''), 'multiple_choice')
        )
        returning id into v_question_id;
      else
        update public.questions
        set
          position = v_position,
          prompt = trim(v_question->>'prompt'),
          type = coalesce(nullif(v_question->>'type', ''), type)
        where id = v_question_id
          and quiz_id = v_quiz_id;

        if not found then
          insert into public.questions (id, quiz_id, position, prompt, type)
          values (
            v_question_id,
            v_quiz_id,
            v_position,
            trim(v_question->>'prompt'),
            coalesce(nullif(v_question->>'type', ''), 'multiple_choice')
          );
        end if;
      end if;

      if v_question ? 'options' then
        for v_option in
          select value from jsonb_array_elements(v_question->'options')
        loop
          v_option_id := nullif(v_option->>'id', '')::uuid;

          if nullif(trim(v_option->>'text'), '') is null then
            raise exception 'Every option needs text';
          end if;

          if v_option_id is null then
            insert into public.options (question_id, position, text, points)
            values (
              v_question_id,
              coalesce((v_option->>'position')::int, 0),
              trim(v_option->>'text'),
              coalesce((v_option->>'points')::int, 0)
            );
          else
            update public.options
            set
              position = coalesce((v_option->>'position')::int, 0),
              text = trim(v_option->>'text'),
              points = coalesce((v_option->>'points')::int, 0)
            where id = v_option_id
              and question_id = v_question_id;

            if not found then
              insert into public.options (id, question_id, position, text, points)
              values (
                v_option_id,
                v_question_id,
                coalesce((v_option->>'position')::int, 0),
                trim(v_option->>'text'),
                coalesce((v_option->>'points')::int, 0)
              );
            end if;
          end if;
        end loop;
      end if;
    end loop;
  end if;

  select jsonb_build_object(
    'quiz_id', q.id,
    'article_id', q.article_id,
    'title', q.title,
    'is_published', q.is_published,
    'questions', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'id', qs.id,
          'position', qs.position,
          'prompt', qs.prompt,
          'type', qs.type,
          'options', coalesce((
            select jsonb_agg(
              jsonb_build_object(
                'id', o.id,
                'position', o.position,
                'text', o.text,
                'points', o.points
              )
              order by o.position, o.id
            )
            from public.options o
            where o.question_id = qs.id
          ), '[]'::jsonb)
        )
        order by qs.position, qs.id
      )
      from public.questions qs
      where qs.quiz_id = q.id
    ), '[]'::jsonb)
  )
  into v_result
  from public.quizzes q
  where q.id = v_quiz_id;

  return v_result;
end;
$$;

revoke all on function public.save_quiz(jsonb) from public;
grant execute on function public.save_quiz(jsonb) to authenticated;

-- ---------------------------------------------------------------------------
-- 4) Storage bucket + policies: article-images
-- ---------------------------------------------------------------------------
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

-- Admin write/update/delete
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
