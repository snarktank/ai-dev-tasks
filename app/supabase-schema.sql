-- Run this in Supabase SQL editor.
-- Competitions
create table if not exists public.competitions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  start_date date,
  end_date date,
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Participants in a competition
create table if not exists public.competition_participants (
  competition_id uuid not null references public.competitions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (competition_id, user_id)
);

-- Fast aggregation by user/time
create index if not exists idx_user_actions_user_time on public.user_actions (user_id, created_at);
create index if not exists idx_user_actions_compound on public.user_actions (user_id, mission_id);

-- RLS
alter table public.competitions enable row level security;
alter table public.competition_participants enable row level security;

-- Policies: users can read competitions they participate in or created
create policy if not exists "read-participant-or-owner" on public.competitions
for select using (
  auth.uid() = created_by
  or exists (
    select 1 from public.competition_participants cp
    where cp.competition_id = competitions.id and cp.user_id = auth.uid()
  )
);

-- Creator can insert competitions
create policy if not exists "insert-owner" on public.competitions
for insert with check (auth.uid() = created_by);

-- Owner can update their competitions
create policy if not exists "update-owner" on public.competitions
for update using (auth.uid() = created_by);

-- Participants policies
create policy if not exists "read-participants" on public.competition_participants
for select using (
  auth.uid() = user_id
  or exists (
    select 1 from public.competitions c
    where c.id = competition_participants.competition_id and c.created_by = auth.uid()
  )
);

-- Users can join any visible competition (owner or invited flow can enforce externally)
create policy if not exists "insert-self" on public.competition_participants
for insert with check (auth.uid() = user_id);

-- Owner can add participants (for invite accept flows done server-side)
create policy if not exists "owner-adds" on public.competition_participants
for insert with check (
  exists (
    select 1 from public.competitions c
    where c.id = competition_participants.competition_id and c.created_by = auth.uid()
  )
);

-- Owner can remove participants
create policy if not exists "owner-removes" on public.competition_participants
for delete using (
  exists (
    select 1 from public.competitions c
    where c.id = competition_participants.competition_id and c.created_by = auth.uid()
  )
);

-- Realtime
-- Enable for tables: competitions, competition_participants, user_actions (already used)

-- === Profiles: background_key default and signup trigger ===
-- Ensure background_key exists and defaults to 'bg_02'
alter table if exists public.profiles
  add column if not exists background_key text;

-- Set default to 'bg_02'
alter table if exists public.profiles
  alter column background_key set default 'bg_02';

-- Backfill any existing NULLs to the default
update public.profiles
set background_key = 'bg_02'
where background_key is null;

-- Enable RLS on profiles
alter table if exists public.profiles enable row level security;

-- Profiles RLS Policies
-- Policy 1: Users can see their own profile
create policy if not exists "profiles-select-own" on public.profiles
  for select using (auth.uid() = id);

-- Policy 2: Friends can see each other's profiles
create policy if not exists "profiles-select-friends" on public.profiles
  for select using (
    exists (
      select 1 from public.friendships f
      where (f.user_low = auth.uid() and f.user_high = public.profiles.id)
         or (f.user_high = auth.uid() and f.user_low = public.profiles.id)
    )
  );

-- Policy 3: Users can update their own profile
create policy if not exists "profiles-update-own" on public.profiles
  for update using (auth.uid() = id);

-- Optional: constrain allowed values (bg_01..bg_07). Skip if already present.
do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'profiles_background_key_allowed'
  ) then
    alter table public.profiles
      add constraint profiles_background_key_allowed
      check (background_key in ('bg_01','bg_02','bg_03','bg_04','bg_05','bg_06','bg_07'));
  end if;
end
$$;

-- Trigger: create profile on new auth.users with background_key = 'bg_02'
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, username, full_name, background_key)
  values (
    new.id,
    coalesce(nullif(trim((new.raw_user_meta_data->>'username')::text), ''), null),
    coalesce(
      nullif(
        trim(
          coalesce((new.raw_user_meta_data->>'first_name')::text, '') || ' ' ||
          coalesce((new.raw_user_meta_data->>'last_name')::text, '')
        ),
        ''
      ),
      null
    ),
    'bg_02'
  )
  on conflict (id) do update
  set background_key = excluded.background_key
  where public.profiles.id = excluded.id
    and coalesce(public.profiles.background_key, '') = '';
  return new;
end;
$$;

-- Create trigger once
do $$
begin
  if not exists (
    select 1
    from pg_trigger
    where tgname = 'create_profile_on_signup'
  ) then
    create trigger create_profile_on_signup
    after insert on auth.users
    for each row execute procedure public.handle_new_user();
  end if;
end
$$;

-- === Missions: quantity fields and specific mission setup ===
-- Add quantity fields with minimal schema changes
alter table if exists public.missions
  add column if not exists quantity_mode int,
  add column if not exists quantity_unit text,
  add column if not exists quantity_multiplier numeric;

-- Set quantity fields for the "panta burkar" mission
update public.missions
set
  quantity_mode = 1,
  quantity_unit = 'SEK',
  quantity_multiplier = 0.1
where lower(title) = 'panta burkar';


-- === Notifications (for invites, friend requests, etc.) ===
-- Table (idempotent)
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null,
  title text not null,
  body text,
  metadata jsonb,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

-- Indexes
create index if not exists idx_notifications_user_time on public.notifications (user_id, created_at desc);

-- RLS
alter table if exists public.notifications enable row level security;

-- Policies
create policy if not exists "notifications-select-own" on public.notifications
for select using (auth.uid() = user_id);

create policy if not exists "notifications-insert-own" on public.notifications
for insert with check (auth.uid() = user_id);

create policy if not exists "notifications-update-own" on public.notifications
for update using (auth.uid() = user_id);

-- Realtime for notifications
-- (Enable in Supabase UI: Database > Replication > configure 'notifications' or run SQL as needed)

-- === Friend requests RLS hardening (idempotent) ===
-- Ensure table exists (skip if already there)
create table if not exists public.friend_requests (
  id uuid primary key default gen_random_uuid(),
  from_user_id uuid not null references auth.users(id) on delete cascade,
  to_user_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'pending',
  responded_at timestamptz,
  created_at timestamptz not null default now()
);

alter table if exists public.friend_requests enable row level security;

-- Allow both parties to read their requests
create policy if not exists "friend_requests-select-parties" on public.friend_requests
for select using (auth.uid() = from_user_id or auth.uid() = to_user_id);

-- REMOVED: Allow sender to insert directly (use RPC send_friend_request instead)
-- create policy if not exists "friend_requests-insert-sender" on public.friend_requests
-- for insert with check (auth.uid() = from_user_id);

-- Allow recipient to update status (accept/decline)
create policy if not exists "friend_requests-update-recipient" on public.friend_requests
for update using (auth.uid() = to_user_id);

-- Allow recipient to delete request (when declining)
create policy if not exists "friend_requests-delete-recipient" on public.friend_requests
for delete using (auth.uid() = to_user_id);

-- === Friendships table (idempotent) ===
create table if not exists public.friendships (
  user_low uuid not null,
  user_high uuid not null,
  created_at timestamptz not null default now(),
  -- enforce ordering so (a,b) and (b,a) are treated the same
  constraint friendships_user_order check (user_low < user_high),
  constraint friendships_pkey primary key (user_low, user_high)
);

-- Ensure RLS allows participants to read their friendships
alter table if exists public.friendships enable row level security;
do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='friendships' and policyname='fships-select-parties'
  ) then
    create policy "fships-select-parties" on public.friendships
      for select using (auth.uid() = user_low or auth.uid() = user_high);
  end if;
end
$$;

-- Optional: allow either party to delete their friendship (keep strict if you prefer RPC-only)
do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='friendships' and policyname='fships-delete-parties'
  ) then
    create policy "fships-delete-parties" on public.friendships
      for delete using (auth.uid() = user_low or auth.uid() = user_high);
  end if;
end
$$;

-- === Stored procedure to send a friend request ===
create or replace function public.send_friend_request(p_to_user_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_caller uuid;
  v_request_id uuid;
  v_sender_name text;
  v_sender_username text;
begin
  -- Verify authenticated
  select auth.uid() into v_caller;
  if v_caller is null then
    raise exception 'not authenticated';
  end if;

  -- Cannot request yourself
  if v_caller = p_to_user_id then
    raise exception 'cannot send friend request to yourself';
  end if;

  -- Create the friend request
  insert into public.friend_requests (from_user_id, to_user_id, status)
    values (v_caller, p_to_user_id, 'pending')
    returning id into v_request_id;

  -- Get sender's profile info for notification
  select 
    coalesce(
      nullif(full_name, ''),
      concat_ws(' ', nullif(first_name, ''), nullif(last_name, '')),
      username,
      split_part(email, '@', 1)
    ),
    coalesce(username, split_part(email, '@', 1))
  into v_sender_name, v_sender_username
  from public.profiles
  where id = v_caller;

  -- Create notification for recipient
  begin
    insert into public.notifications (user_id, type, title, body, metadata)
      values (
        p_to_user_id,
        'friend_request',
        'Vänförfrågan',
        coalesce(v_sender_name, 'Någon') || ' (@' || coalesce(v_sender_username, 'okänd') || ') vill bli vän med dig.',
        jsonb_build_object(
          'friend_request_id', v_request_id,
          'from_user_id', v_caller,
          'from_username', v_sender_username,
          'from_name', v_sender_name
        )
      );
  exception when others then
    -- ignore notification failure
    null;
  end;

  return v_request_id;
end;
$$;

-- Grant permissions
grant execute on function public.send_friend_request(uuid) to authenticated;
revoke all on function public.send_friend_request(uuid) from anon, public;

-- === Stored procedure to accept/decline a friend request ===
create or replace function public.respond_friend_request(p_friend_request_id uuid, p_accept boolean)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_req record;
  v_caller uuid;
  low uuid;
  high uuid;
  v_accepter_name text;
begin
  -- Fetch request and lock it to avoid races
  select * into v_req from public.friend_requests where id = p_friend_request_id for update;
  if not found then
    raise exception 'friend_request % not found', p_friend_request_id;
  end if;

  -- Only the recipient may respond
  select auth.uid() into v_caller;
  if v_caller is null then
    raise exception 'not authenticated';
  end if;
  if v_req.to_user_id is distinct from v_caller then
    raise exception 'forbidden';
  end if;

  -- If already processed, do nothing (idempotent)
  if v_req.status <> 'pending' then
    return;
  end if;

  if p_accept then
    -- order the pair deterministically
    if v_req.from_user_id < v_req.to_user_id then
      low := v_req.from_user_id;
      high := v_req.to_user_id;
    else
      low := v_req.to_user_id;
      high := v_req.from_user_id;
    end if;
    -- insert friendship idempotently (on conflict do nothing)
    insert into public.friendships (user_low, user_high) values (low, high)
      on conflict do nothing;
    update public.friend_requests
      set status = 'accepted', responded_at = now()
      where id = p_friend_request_id;
    
    -- Get the name of the person who accepted the request
    select coalesce(
      nullif(full_name, ''),
      concat_ws(' ', nullif(first_name, ''), nullif(last_name, '')),
      username,
      split_part(email, '@', 1),
      'Någon'
    ) into v_accepter_name
    from public.profiles
    where id = v_req.to_user_id;
    
    -- try to notify sender, ignore errors
    begin
      insert into public.notifications (user_id, type, title, body, metadata)
        values (v_req.from_user_id, 'friend_request_accepted',
                'Ny vän',
                v_accepter_name || ' accepterade din vänförfrågan',
                jsonb_build_object('friend_request_id', p_friend_request_id, 'to_user_id', v_req.to_user_id));
    exception when others then
      -- ignore notification failure
      null;
    end;
  else
    -- Delete the request entirely when declined (no notification sent)
    delete from public.friend_requests
      where id = p_friend_request_id;
  end if;
end;
$$;

