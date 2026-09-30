create schema if not exists private;

revoke all on schema private from public;
grant usage on schema private to authenticated;

create or replace function private.is_gym_creator(target_gym_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.gyms g
    where g.id = target_gym_id
      and g.created_by = (select auth.uid())
  );
$$;

revoke all on function private.is_gym_creator(uuid) from public;
grant execute on function private.is_gym_creator(uuid) to authenticated;

drop policy if exists "gym creators can add themselves as owner"
on public.gym_users;

create policy "gym creators can add themselves as owner"
on public.gym_users
for insert
to authenticated
with check (
  user_id = (select auth.uid())
  and role = 'owner'
  and private.is_gym_creator(gym_id)
);

create or replace function public.create_gym_workspace(
  p_name text,
  p_slug text,
  p_timezone text default 'Asia/Kolkata',
  p_currency text default 'INR',
  p_plan_name text default 'Monthly',
  p_plan_price numeric default 0,
  p_plan_duration_days integer default 30
)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_gym public.gyms;
begin
  if v_user_id is null then
    raise exception 'Authentication required';
  end if;

  insert into public.gyms (
    name,
    slug,
    timezone,
    currency,
    created_by
  )
  values (
    p_name,
    p_slug,
    p_timezone,
    upper(p_currency),
    v_user_id
  )
  returning * into v_gym;

  insert into public.gym_users (
    gym_id,
    user_id,
    role
  )
  values (
    v_gym.id,
    v_user_id,
    'owner'
  );

  insert into public.membership_plans (
    gym_id,
    name,
    price,
    duration_days
  )
  values (
    v_gym.id,
    p_plan_name,
    p_plan_price,
    p_plan_duration_days
  );

  return jsonb_build_object(
    'id', v_gym.id,
    'name', v_gym.name,
    'slug', v_gym.slug,
    'timezone', v_gym.timezone,
    'currency', v_gym.currency
  );
end;
$$;

revoke all on function public.create_gym_workspace(
  text, text, text, text, text, numeric, integer
) from public;

revoke all on function public.create_gym_workspace(
  text, text, text, text, text, numeric, integer
) from anon;

grant execute on function public.create_gym_workspace(
  text, text, text, text, text, numeric, integer
) to authenticated;
