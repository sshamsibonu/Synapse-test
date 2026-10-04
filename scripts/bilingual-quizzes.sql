-- Bilingual quizzes (Uz + En) — same pattern as articles/lessons
-- REVIEW, then run once in Supabase SQL Editor.
-- One quiz per article; text fields become *_uz / *_en. Points stay shared.

begin;

-- quizzes.title → title_uz / title_en
alter table public.quizzes
  add column if not exists title_uz text,
  add column if not exists title_en text;

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'quizzes' and column_name = 'title'
  ) then
    update public.quizzes set
      title_uz = coalesce(title_uz, title),
      title_en = coalesce(title_en, title);
  end if;
end $$;

alter table public.quizzes drop column if exists title;

-- questions.prompt → prompt_uz / prompt_en
alter table public.questions
  add column if not exists prompt_uz text,
  add column if not exists prompt_en text;

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'questions' and column_name = 'prompt'
  ) then
    update public.questions set
      prompt_uz = coalesce(prompt_uz, prompt),
      prompt_en = coalesce(prompt_en, prompt);
  end if;
end $$;

alter table public.questions drop column if exists prompt;

-- options.text → text_uz / text_en (points unchanged)
alter table public.options
  add column if not exists text_uz text,
  add column if not exists text_en text;

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'options' and column_name = 'text'
  ) then
    update public.options set
      text_uz = coalesce(text_uz, text),
      text_en = coalesce(text_en, text);
  end if;
end $$;

alter table public.options drop column if exists text;

commit;

-- Replace save_quiz for bilingual payload
create or replace function public.save_quiz(payload jsonb)
returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_quiz_id uuid;
  v_article_id uuid;
  v_title_uz text;
  v_title_en text;
  v_is_published boolean;
  v_question jsonb;
  v_option jsonb;
  v_question_id uuid;
  v_option_id uuid;
  v_deleted_question_id uuid;
  v_deleted_option_id uuid;
  v_position int;
  v_prompt_uz text;
  v_prompt_en text;
  v_text_uz text;
  v_text_en text;
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

  v_title_uz := nullif(trim(payload->>'title_uz'), '');
  v_title_en := nullif(trim(payload->>'title_en'), '');
  if v_title_uz is null and v_title_en is null then
    raise exception 'Quiz title is required';
  end if;

  v_is_published := coalesce((payload->>'is_published')::boolean, false);
  v_quiz_id := nullif(payload->>'quiz_id', '')::uuid;

  if v_quiz_id is null then
    insert into public.quizzes (article_id, title_uz, title_en, is_published)
    values (v_article_id, v_title_uz, v_title_en, v_is_published)
    returning id into v_quiz_id;
  else
    update public.quizzes
    set
      title_uz = v_title_uz,
      title_en = v_title_en,
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
      v_prompt_uz := nullif(trim(v_question->>'prompt_uz'), '');
      v_prompt_en := nullif(trim(v_question->>'prompt_en'), '');

      if v_prompt_uz is null and v_prompt_en is null then
        raise exception 'Every question needs a prompt';
      end if;

      if v_question_id is null then
        insert into public.questions (quiz_id, position, prompt_uz, prompt_en, type)
        values (
          v_quiz_id,
          v_position,
          v_prompt_uz,
          v_prompt_en,
          coalesce(nullif(v_question->>'type', ''), 'multiple_choice')
        )
        returning id into v_question_id;
      else
        update public.questions
        set
          position = v_position,
          prompt_uz = v_prompt_uz,
          prompt_en = v_prompt_en,
          type = coalesce(nullif(v_question->>'type', ''), type)
        where id = v_question_id
          and quiz_id = v_quiz_id;

        if not found then
          insert into public.questions (id, quiz_id, position, prompt_uz, prompt_en, type)
          values (
            v_question_id,
            v_quiz_id,
            v_position,
            v_prompt_uz,
            v_prompt_en,
            coalesce(nullif(v_question->>'type', ''), 'multiple_choice')
          );
        end if;
      end if;

      if v_question ? 'options' then
        for v_option in
          select value from jsonb_array_elements(v_question->'options')
        loop
          v_option_id := nullif(v_option->>'id', '')::uuid;
          v_text_uz := nullif(trim(v_option->>'text_uz'), '');
          v_text_en := nullif(trim(v_option->>'text_en'), '');

          if v_text_uz is null and v_text_en is null then
            raise exception 'Every option needs text';
          end if;

          if v_option_id is null then
            insert into public.options (question_id, position, text_uz, text_en, points)
            values (
              v_question_id,
              coalesce((v_option->>'position')::int, 0),
              v_text_uz,
              v_text_en,
              coalesce((v_option->>'points')::int, 0)
            );
          else
            update public.options
            set
              position = coalesce((v_option->>'position')::int, 0),
              text_uz = v_text_uz,
              text_en = v_text_en,
              points = coalesce((v_option->>'points')::int, 0)
            where id = v_option_id
              and question_id = v_question_id;

            if not found then
              insert into public.options (id, question_id, position, text_uz, text_en, points)
              values (
                v_option_id,
                v_question_id,
                coalesce((v_option->>'position')::int, 0),
                v_text_uz,
                v_text_en,
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
    'title_uz', q.title_uz,
    'title_en', q.title_en,
    'is_published', q.is_published,
    'questions', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'id', qs.id,
          'position', qs.position,
          'prompt_uz', qs.prompt_uz,
          'prompt_en', qs.prompt_en,
          'type', qs.type,
          'options', coalesce((
            select jsonb_agg(
              jsonb_build_object(
                'id', o.id,
                'position', o.position,
                'text_uz', o.text_uz,
                'text_en', o.text_en,
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
