-- Kör denna SQL i Supabase SQL editor för att uppdatera vänförfrågan-notifikationer

-- Ta bort gamla INSERT-policy för friend_requests så endast RPC kan skapa requests
drop policy if exists "friend_requests-insert-sender" on public.friend_requests;

-- === Profiles RLS Policies ===
-- Aktivera RLS på profiles om det inte redan är aktiverat
alter table if exists public.profiles enable row level security;

-- Ta bort gamla policies om de finns
drop policy if exists "profiles-select-own" on public.profiles;
drop policy if exists "profiles-select-friends" on public.profiles;

-- Policy 1: Användare kan se sin egen profil
create policy "profiles-select-own" on public.profiles
  for select using (auth.uid() = id);

-- Policy 2: Vänner kan se varandras profiler
create policy "profiles-select-friends" on public.profiles
  for select using (
    exists (
      select 1 from public.friendships f
      where (f.user_low = auth.uid() and f.user_high = public.profiles.id)
         or (f.user_high = auth.uid() and f.user_low = public.profiles.id)
    )
  );

-- Policy 3: Användare kan uppdatera sin egen profil
drop policy if exists "profiles-update-own" on public.profiles;
create policy "profiles-update-own" on public.profiles
  for update using (auth.uid() = id);

-- Funktion för att skicka vänförfrågan (skapar både request och notifikation)
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

-- Ge rättigheter till authenticated användare att anropa funktionen
grant execute on function public.send_friend_request(uuid) to authenticated;
revoke all on function public.send_friend_request(uuid) from anon, public;

-- Funktion för att acceptera/neka vänförfrågan
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
    update public.friend_requests
      set status = 'declined', responded_at = now()
      where id = p_friend_request_id;
    -- optional notify sender about rejection (comment out if undesired)
    begin
      insert into public.notifications (user_id, type, title, body, metadata)
        values (v_req.from_user_id, 'friend_request_rejected',
                'Vänförfrågan nekad',
                'Din vänförfrågan avslogs.',
                jsonb_build_object('friend_request_id', p_friend_request_id, 'to_user_id', v_req.to_user_id));
    exception when others then
      null;
    end;
  end if;
end;
$$;
