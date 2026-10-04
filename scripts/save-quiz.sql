-- save_quiz(payload jsonb)
-- Saves a quiz + questions + options in ONE transaction.
-- SECURITY INVOKER: runs as the calling user so RLS still applies.
-- Also checks public.is_admin() for a clear error if a non-admin somehow calls it.
--
-- REVIEW, then run once in Supabase SQL Editor.
-- Do not run until you are happy with this SQL.

create or replace function public.save_quiz(payload jsonb)
returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_quiz_id uuid;
  v_lesson_id uuid;
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

  v_lesson_id := nullif(payload->>'lesson_id', '')::uuid;
  if v_lesson_id is null then
    raise exception 'lesson_id is required';
  end if;

  v_title := nullif(trim(payload->>'title'), '');
  if v_title is null then
    raise exception 'Quiz title is required';
  end if;

  v_is_published := coalesce((payload->>'is_published')::boolean, false);
  v_quiz_id := nullif(payload->>'quiz_id', '')::uuid;

  -- Create or update the quiz (one per lesson)
  if v_quiz_id is null then
    insert into public.quizzes (lesson_id, title, is_published)
    values (v_lesson_id, v_title, v_is_published)
    returning id into v_quiz_id;
  else
    update public.quizzes
    set
      title = v_title,
      is_published = v_is_published,
      lesson_id = v_lesson_id
    where id = v_quiz_id;

    if not found then
      raise exception 'Quiz not found';
    end if;
  end if;

  -- Delete options the admin removed (explicit ids only)
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

  -- Delete questions the admin removed (explicit ids only)
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

  -- Upsert questions + options (matched by id; insert when id is new)
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
          -- Id from client for a brand-new row: insert with that id
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

  -- Return the saved tree so the admin UI can refresh ids
  select jsonb_build_object(
    'quiz_id', q.id,
    'lesson_id', q.lesson_id,
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

comment on function public.save_quiz(jsonb) is
  'Admin quiz saver: upserts quiz/questions/options in one transaction (SECURITY INVOKER + is_admin check).';
