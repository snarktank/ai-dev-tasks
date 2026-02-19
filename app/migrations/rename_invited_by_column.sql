-- Migration: Remove old invited_by column (invited_by_user_id already exists)
-- Run this in Supabase SQL Editor

-- 1. Copy any data from invited_by to invited_by_user_id if needed
UPDATE public.competition_invites 
SET invited_by_user_id = invited_by 
WHERE invited_by_user_id IS NULL AND invited_by IS NOT NULL;

-- 2. Drop old policies that depend on invited_by column
DROP POLICY IF EXISTS "invites_insert_owner" ON public.competition_invites;
DROP POLICY IF EXISTS "invite-insert-owner" ON public.competition_invites;
DROP POLICY IF EXISTS "invite-select" ON public.competition_invites;

-- 3. Drop the old invited_by column
ALTER TABLE public.competition_invites 
  DROP COLUMN IF EXISTS invited_by;

-- 4. Recreate policies with the correct column name (invited_by_user_id)
-- Note: We'll only recreate essential policies, adjust as needed
CREATE POLICY "invites-insert-authorized" ON public.competition_invites
  FOR INSERT WITH CHECK (
    auth.uid() = invited_by_user_id
    OR EXISTS (
      SELECT 1 FROM public.competitions c
      WHERE c.id = competition_invites.competition_id 
      AND c.owner_id = auth.uid()
    )
  );

CREATE POLICY "invites-select-involved" ON public.competition_invites
  FOR SELECT USING (
    auth.uid() = invited_user_id 
    OR auth.uid() = invited_by_user_id
    OR EXISTS (
      SELECT 1 FROM public.competitions c
      WHERE c.id = competition_invites.competition_id 
      AND c.owner_id = auth.uid()
    )
  );

-- 2. Update any existing RPC functions that might reference the old column
-- Recreate the invite_to_competition function to ensure it uses the correct column name
CREATE OR REPLACE FUNCTION public.invite_to_competition(
  p_competition_id uuid,
  p_invited_user_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY definer
SET search_path = public
AS $$
DECLARE
  v_caller uuid;
  v_owner_id uuid;
  v_invite_policy public.competition_invite_policy;
  v_is_active_participant boolean;
BEGIN
  -- Get authenticated user
  SELECT auth.uid() INTO v_caller;
  IF v_caller IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;

  -- Get competition owner and invite policy
  SELECT owner_id, invite_policy INTO v_owner_id, v_invite_policy
  FROM public.competitions
  WHERE id = p_competition_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'competition not found';
  END IF;

  -- Check if caller is an active participant (left_at is null)
  SELECT EXISTS (
    SELECT 1 FROM public.competition_participants
    WHERE competition_id = p_competition_id
      AND user_id = v_caller
      AND left_at IS NULL
  ) INTO v_is_active_participant;

  IF NOT v_is_active_participant THEN
    RAISE EXCEPTION 'you are not an active participant in this competition';
  END IF;

  -- Check invite policy
  IF v_invite_policy = 'owner_only' THEN
    IF v_caller != v_owner_id THEN
      RAISE EXCEPTION 'only the owner can invite to this competition';
    END IF;
  ELSIF v_invite_policy = 'all_members' THEN
    -- All active participants can invite (already checked above)
    NULL;
  ELSE
    RAISE EXCEPTION 'unknown invite policy';
  END IF;

  -- Don't invite if already a participant
  IF EXISTS (
    SELECT 1 FROM public.competition_participants
    WHERE competition_id = p_competition_id AND user_id = p_invited_user_id
  ) THEN
    RAISE EXCEPTION 'user is already a participant';
  END IF;

  -- Create invite (or update if exists)
  INSERT INTO public.competition_invites (competition_id, invited_user_id, invited_by_user_id, status)
  VALUES (p_competition_id, p_invited_user_id, v_caller, 'pending')
  ON CONFLICT (competition_id, invited_user_id) 
  DO UPDATE SET 
    invited_by_user_id = EXCLUDED.invited_by_user_id,
    status = 'pending',
    created_at = now(),
    responded_at = NULL;

  -- Create notification for invited user
  BEGIN
    INSERT INTO public.notifications (user_id, type, title, body, metadata)
    SELECT 
      p_invited_user_id,
      'competition_invite',
      'Tävlingsinbjudan',
      'Du har blivit inbjuden till ' || c.name,
      jsonb_build_object(
        'competition_id', p_competition_id,
        'invited_by_user_id', v_caller
      )
    FROM public.competitions c
    WHERE c.id = p_competition_id;
  EXCEPTION WHEN OTHERS THEN
    -- Ignore notification failures
    NULL;
  END;
END;
$$;

-- Done!