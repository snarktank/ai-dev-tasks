-- ===========================================================
-- Migration: Add invite policy system to competitions
-- Run this in Supabase SQL Editor
-- ===========================================================

-- 1. Create enum for invite policy (idempotent)
do $$
begin
  if not exists (select 1 from pg_type where typname = 'competition_invite_policy') then
    create type public.competition_invite_policy as enum ('owner_only', 'all_members');
  end if;
end
$$;

-- 2. Add columns to competitions table (idempotent)
alter table if exists public.competitions
  add column if not exists owner_id uuid references auth.users(id) on delete set null,
  add column if not exists invite_policy public.competition_invite_policy not null default 'owner_only';

-- 3. Backfill owner_id from created_by (if owner_id is null)
update public.competitions
set owner_id = created_by
where owner_id is null;

-- 4. Add left_at column to competition_participants (idempotent)
alter table if exists public.competition_participants
  add column if not exists left_at timestamptz;

-- 5. Create competition_invites table (idempotent)
create table if not exists public.competition_invites (
  id uuid primary key default gen_random_uuid(),
  competition_id uuid not null references public.competitions(id) on delete cascade,
  invited_user_id uuid not null references auth.users(id) on delete cascade,
  invited_by_user_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  responded_at timestamptz,
  unique (competition_id, invited_user_id)
);

-- Index for fast lookups
create index if not exists idx_competition_invites_user on public.competition_invites (invited_user_id, status);

-- RLS for competition_invites
alter table if exists public.competition_invites enable row level security;

-- Policies: users can read invites sent to them or by them
do $$
begin
  if not exists (
    select 1 from pg_policies 
    where schemaname='public' and tablename='competition_invites' and policyname='invites-select-parties'
  ) then
    create policy "invites-select-parties" on public.competition_invites
      for select using (
        auth.uid() = invited_user_id 
        or auth.uid() = invited_by_user_id
        or exists (
          select 1 from public.competitions c
          where c.id = competition_invites.competition_id and c.owner_id = auth.uid()
        )
      );
  end if;
end
$$;

-- Users can update their own invites (accept/decline)
do $$
begin
  if not exists (
    select 1 from pg_policies 
    where schemaname='public' and tablename='competition_invites' and policyname='invites-update-own'
  ) then
    create policy "invites-update-own" on public.competition_invites
      for update using (auth.uid() = invited_user_id);
  end if;
end
$$;

-- 6. Create RPC: create_competition
create or replace function public.create_competition(
  p_name text,
  p_description text default null,
  p_start_date date default null,
  p_end_date date default null,
  p_invite_policy public.competition_invite_policy default 'owner_only'
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_caller uuid;
  v_competition_id uuid;
begin
  -- Get authenticated user
  select auth.uid() into v_caller;
  if v_caller is null then
    raise exception 'not authenticated';
  end if;

  -- Insert competition
  insert into public.competitions (name, description, start_date, end_date, created_by, owner_id, invite_policy)
  values (p_name, p_description, p_start_date, p_end_date, v_caller, v_caller, p_invite_policy)
  returning id into v_competition_id;

  -- Add creator as participant
  insert into public.competition_participants (competition_id, user_id)
  values (v_competition_id, v_caller);

  return v_competition_id;
end;
$$;

-- 7. Create RPC: invite_to_competition
create or replace function public.invite_to_competition(
  p_competition_id uuid,
  p_invited_user_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_caller uuid;
  v_owner_id uuid;
  v_invite_policy public.competition_invite_policy;
  v_is_active_participant boolean;
begin
  -- Get authenticated user
  select auth.uid() into v_caller;
  if v_caller is null then
    raise exception 'not authenticated';
  end if;

  -- Get competition owner and invite policy
  select owner_id, invite_policy into v_owner_id, v_invite_policy
  from public.competitions
  where id = p_competition_id;

  if not found then
    raise exception 'competition not found';
  end if;

  -- Check if caller is an active participant (left_at is null)
  select exists (
    select 1 from public.competition_participants
    where competition_id = p_competition_id
      and user_id = v_caller
      and left_at is null
  ) into v_is_active_participant;

  if not v_is_active_participant then
    raise exception 'you are not an active participant in this competition';
  end if;

  -- Check invite policy
  if v_invite_policy = 'owner_only' then
    if v_caller != v_owner_id then
      raise exception 'only the owner can invite to this competition';
    end if;
  elsif v_invite_policy = 'all_members' then
    -- All active participants can invite (already checked above)
    null;
  else
    raise exception 'unknown invite policy';
  end if;

  -- Don't invite if already a participant
  if exists (
    select 1 from public.competition_participants
    where competition_id = p_competition_id and user_id = p_invited_user_id
  ) then
    raise exception 'user is already a participant';
  end if;

  -- Create invite (or update if exists)
  insert into public.competition_invites (competition_id, invited_user_id, invited_by_user_id, status)
  values (p_competition_id, p_invited_user_id, v_caller, 'pending')
  on conflict (competition_id, invited_user_id) 
  do update set 
    invited_by_user_id = excluded.invited_by_user_id,
    status = 'pending',
    created_at = now(),
    responded_at = null;

  -- Create notification for invited user
  begin
    insert into public.notifications (user_id, type, title, body, metadata)
    select 
      p_invited_user_id,
      'competition_invite',
      'Tävlingsinbjudan',
      'Du har blivit inbjuden till ' || c.name,
      jsonb_build_object(
        'competition_id', p_competition_id,
        'invited_by_user_id', v_caller
      )
    from public.competitions c
    where c.id = p_competition_id;
  exception when others then
    -- Ignore notification failures
    null;
  end;
end;
$$;

-- 8. Grant permissions
grant execute on function public.create_competition(text, text, date, date, public.competition_invite_policy) to authenticated;
grant execute on function public.invite_to_competition(uuid, uuid) to authenticated;

revoke all on function public.create_competition(text, text, date, date, public.competition_invite_policy) from anon, public;
revoke all on function public.invite_to_competition(uuid, uuid) from anon, public;

-- Done!
